define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');
	require('leaflet');

	require('lib/lawnchair');

	var DataView = require('views/DataView');
	var DataModel = require('models/DataModel');

	var config = require('config');

	var authHelper = require('lib/auth.helper');

	return DataView.extend({
		initialize: function(options) {
			this.options = options;

			this.getDocument(this.options.documentId);
		},

		getDocument: function(documentId) {
			this.model = new DataModel();
			this.options.documentId = documentId;

			var view = this;
			Lawnchair(function() {
				this.exists(view.options.documentId, function(exists) {
					view.localCopyExist = exists;
				})
			});

			this.model.once('change', this.render, this);
			this.model.url = config.apiUrl+'/document/'+this.options.documentId;
			this.model.fetch({
				beforeSend: authHelper.sendAuthentication
			});
		},

		events: {
			'click .save-button': 'saveButtonClick',
			'click .image-link': 'imageLinkClick',
			'click .load-local-copy-button': 'localCopyButtonClick'
		},

		localCopyButtonClick: function() {
			if (this.localCopyExist) {
				this.loadLocalModel();
			}
		},

		saveButtonClick: function() {
			if (this.model.get('images') && this.model.get('images').length > 0) {
				var sortedImages = _.sortBy(this.model.get('images'), function(image) {
					return image.page.order || 0;
				});

				this.model.set({
					images: sortedImages
				});
			}

			this.model.url = config.apiUrl+'/document/'+this.options.documentId;
			this.model.save(null, {
				beforeSend: authHelper.sendAuthentication,
				success: _.bind(function() {
					this.render();
					this.options.app.showMessage('Document entry saved.')
				}, this),
				type: 'POST'
			});

			var view = this;

			Lawnchair(function() {
				this.save({
					key: view.options.documentId,
					document: view.model.toJSON()
				});
			});
		},

		loadLocalModel: function() {
			view = this;

			Lawnchair(function() {
				this.get(view.options.documentId, function(data) {
					if (data) {
						view.model.clear().set(data.document);
						view.render();
					}
				})
			})
		},

		imageLinkClick: function(event) {
			event.preventDefault();

			var imageUrl = $(event.currentTarget).attr('href');

			this.options.app.$el.find('.overlay-container').html('<div class="image-overlay"><img src="'+imageUrl+'"/></div>');

			$(document.body).addClass('has-overlay');

			this.options.app.$el.find('.overlay-container').click(_.bind(function() {
				this.options.app.$el.find('.overlay-container').html('');
				$(document.body).removeClass('has-overlay');
			}, this));
		},

		initBundleList: function() {
			var bundleListEl = this.$el.find('.bundle-list');
			var DocumentListCollection = require('collections/DocumentListCollection');
			var bundleCollection = new DocumentListCollection();
			bundleCollection.on('reset', _.bind(function() {
				_.each(bundleCollection.models, function(model) {
					bundleListEl.append('<a href="#document/'+model.get('id')+'" class="thumb'+(model.get('id') == this.model.get('id') ? ' selected' : '')+'" style="background-image: url(http://cdh-vir-1.it.gu.se:8004/images/255x/'+model.get('image')+'.jpg)"></a>');
				}, this);
			}, this));
			bundleCollection.byBundle(this.model.get('bundle'), null, true);
		},

		render: function() {
			console.log('localCopyExist: '+this.localCopyExist);
			var template = _.template($("#documentViewTemplate").html());

			this.$el.html(template({
				model: this.model,
				readOnly: this.options.readOnly,
				escape: this.htmlescapeValue
			}));

			this.initBindings();

			if (!this.options.readOnly) {
				this.initDataSelects();
			}

			if (this.$el.find('.bundle-list')) {
				this.initBundleList();
			}

			if (this.localCopyExist) {
				this.$el.find('.load-local-copy-button').css('display', 'block');
			}

			return this;
		},

		destroy: function() {
			DataView.prototype.destroy.call(this);
		}
	});
});