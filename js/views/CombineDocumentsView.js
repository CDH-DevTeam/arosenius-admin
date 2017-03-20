define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');
	require('leaflet');

	var DataView = require('views/DataView');
	var DataModel = require('models/DataModel');
	var DocumentsListView = require('views/DocumentsListView');
	var DocumentView = require('views/DocumentView');

	var config = require('config');

	var authHelper = require('lib/auth.helper');

	return DataView.extend({
		initialize: function(options) {
			this.options = options;

			console.log(this.options);

			this.model = new DataModel();
			this.model.set({
				title: 'Combine documents',
				description: '',
				collection: {
					museum: ''
				}
			});

			this.model.url = config.apiUrl+'/bundle/new/';

			this.model.set({
				documents: this.options.documentIds.split(';'),
				selectedDocument: this.options.documentIds.split(';')[0]
			});

			this.render();
		},

		events: {
			'click .save-button': 'saveButtonClick'
		},

		saveButtonClick: function() {
			this.model.url = config.apiUrl+'/documents/combine';
			this.model.save(null, {
				beforeSend: authHelper.sendAuthentication,
				success: _.bind(function(response) {
					this.options.app.showMessage('Documents combined.');

					setTimeout(_.bind(function() {

						this.options.router.navigate('document/'+this.model.get('selectedDocument'), {
							trigger: true
						});
					}, this), 1000);
				}, this),
				error: _.bind(function(model, response) {
					console.log(response)
					this.options.app.showMessage(response.responseJSON.error);
				}, this),
				type: 'PUT'
			});
		},

		documentSelectHandler: function(selectedDocument) {
			this.model.set({
				selectedDocument: selectedDocument[0]
			});

			this.documentView = new DocumentView({
				el: this.$el.find('.document-view-container'),
				documentId: selectedDocument[0],
				readOnly: true
			});
		},

		render: function() {
			var template = _.template($("#combineDocumentsViewTemplate").html());

			this.$el.html(template({
				model: this.model
			}));

			this.documentList = new DocumentsListView({
				el: this.$el.find('.image-list-container'),
				documentIds: this.options.documentIds,
				renderUI: false,
				viewMode: 'grid',
				hideCheckBoxes: true,
				showRadioBoxes: true,
				showAll: true,
				disableLinks: true,
				onSelect: _.bind(this.documentSelectHandler, this)
			});

			this.initBindings();

			this.initDataSelects();

			return this;
		},

		destroy: function() {
			DataView.prototype.destroy.call(this);
		}
	});
});