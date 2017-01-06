define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');
	require('leaflet');

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
			this.model.once('change', this.render, this);
			this.model.url = config.apiUrl+'/document/'+this.options.documentId;
			this.model.fetch({
				beforeSend: authHelper.sendAuthentication
			});
		},

		events: {
			'click .save-button': 'saveButtonClick',
			'click .image-link': 'imageLinkClick'
		},

		saveButtonClick: function() {
			this.model.url = config.apiUrl+'/document/'+this.options.documentId;
			this.model.save(null, {
				beforeSend: authHelper.sendAuthentication,
				success: _.bind(function() {
					this.render();
					this.options.app.showMessage('Document entry saved.')
				}, this),
				type: 'POST'
			});
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
			var template = _.template($("#documentViewTemplate").html());

			this.$el.html(template({
				model: this.model
			}));

			this.initBindings();

			this.initDataSelects();

			if (this.$el.find('.bundle-list')) {
				this.initBundleList();
			}

			return this;
		},

		destroy: function() {
			DataView.prototype.destroy.call(this);
		}
	});
});