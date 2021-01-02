define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');
	require('leaflet');

	require('lib/lawnchair');

	var DataView = require('views/DataView');
	var ImageListView = require('views/ImageListView');
	var DataModel = require('models/DataModel');

	var config = require('config');

	var authHelper = require('lib/auth.helper');

	var museums = {
		'Göteborgs universitetsbibliotek': 'GUB',
		'Göteborgs konstmuseum': 'GKM',
		'Nationalmuseum': 'NM',
		'Privat samling': 'PRIV',
		'Norrköpings konstmuseum': 'nkm'
	}

	return DataView.extend({
		initialize: function(options) {
			this.options = options;

			this.waitingForDeleteConfirm = false;

			if (this.options.documentId == 'new') {
				console.log('create new')
				this.newModel = true;
				this.newDocument();
			}
			else {
				this.newModel = false;
				this.getDocument(this.options.documentId);
			}
		},

		getDocument: function(documentId) {
			this.waitingForDeleteConfirm = false;

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

		newDocument: function() {
			console.log('newDocument')
			var hightestIdModel = new Backbone.Model();
			hightestIdModel.url = config.publicApiUrl+'/highest_insert_id';

			hightestIdModel.on('change', _.bind(function() {
				this.model = new DataModel({
					insert_id: hightestIdModel.get('highest_insert_id')+1,
					title: 'Nytt',
					collection: {
						museum: ''
					},
					museum_int_id: '',
					images: []
				});
				console.log(this.model)

				this.render();
			}, this));
			hightestIdModel.fetch();
		},

		events: {
			'click .save-button': 'saveButtonClick',
			'click .delete-button': 'deleteButtonClick',
			'click .image-link': 'imageLinkClick',
			'click .load-local-copy-button': 'localCopyButtonClick',
			'click .add-image-button': 'addImageButtonClick',
			'click .image-select-button': 'imageSelectButtonClick',
			'click .update-view-button': 'render'
		},

		addImageButtonClick: function() {
			var images = this.model.get('images');

			images.push({
				image: '',
				page: {
					number: '',
					side: '',
					order: ''
				}
			});

			this.model.set('images, images');

			this.render();
		},

		imageSelectButtonClick: function(event) {
			console.log(event.target.dataset.imageindex)
			this.imageSelectIndex = event.target.dataset.imageindex;
			
			this.options.app.$el.find('.overlay-container').html('<div class="image-overlay"><div id="imageList" class="image-list"></div<</div>');

			this.imageListView = new ImageListView({
				el: $('#imageList'),
				onClose: _.bind(function() {
					this.imageListView.destroy();

					this.options.app.$el.find('.overlay-container').html('');

					$(document.body).removeClass('has-overlay');
				}, this),
				onSelect: _.bind(function(image) {
					var images = this.model.get('images');

					images[this.imageSelectIndex].image = image.split('.')[0];

					this.model.set('images', images);

					this.render();

					this.imageListView.destroy();

					this.options.app.$el.find('.overlay-container').html('');

					$(document.body).removeClass('has-overlay');
				}, this)
			});

			$(document.body).addClass('has-overlay');
		},

		localCopyButtonClick: function() {
			if (this.localCopyExist) {
				this.loadLocalModel();
			}
		},

		saveButtonClick: function() {
			if (this.model.get('images') && this.model.get('images').length > 0) {
				var sortedImages = _.sortBy(this.model.get('images'), function(image) {
					return image.page && image.page.order || 0;
				});

				this.model.set({
					images: sortedImages
				});
			}

			if (this.newModel) {
				var docId = museums[this.model.get('collection').museum]+'-'+(this.model.get('insert_id'));

				this.model.set('id', docId);

				this.model.url = config.apiUrl+'/document/'+docId;

				this.model.save(null, {
					beforeSend: authHelper.sendAuthentication,
					success: _.bind(function() {
						this.render();
						this.options.app.showMessage('Document entry saved.');
						window.location.hash = '#document/'+docId;
					}, this),
					type: 'PUT'
				});
			}
			else {
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
			}
		},

		deleteButtonClick: function() {
			this.model.set('deleted', true);

			this.saveButtonClick();
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
					bundleListEl.append('<a href="#document/'+model.get('id')+'" class="thumb'+(model.get('id') == this.model.get('id') ? ' selected' : '')+'" style="background-image: url(https://aroseniusarkivet.dh.gu.se/api/images/255x/'+model.get('image')+'.jpg)"></a>');
				}, this);
			}, this));
			bundleCollection.byBundle(this.model.get('bundle'), null, true);
		},

		initNavButtons: function() {
			console.log('initNavButtons')
			console.log(this.model.get('insert_id'))
			var prevModel = new Backbone.Model();
			prevModel.url = config.publicApiUrl+'/prev/'+this.model.get('insert_id');
			prevModel.on('change', _.bind(function() {
				this.$el.find('.prev-button').attr('href', '#document/'+prevModel.get('id'));
			}, this));
			prevModel.fetch();

			var nextModel = new Backbone.Model();
			nextModel.url = config.publicApiUrl+'/next/'+this.model.get('insert_id');
			nextModel.on('change', _.bind(function() {
				this.$el.find('.next-button').attr('href', '#document/'+nextModel.get('id'));
			}, this));
			nextModel.fetch();
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

			this.initNavButtons();

			return this;
		},

		destroy: function() {
			DataView.prototype.destroy.call(this);
		}
	});
});
