define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');
	require('leaflet');

	var DataView = require('views/DataView');
	var DataModel = require('models/DataModel');
	var DocumentsListView = require('views/DocumentsListView');

	var config = require('config');

	var authHelper = require('lib/auth.helper');

	return DataView.extend({
		initialize: function(options) {
			this.options = options;

			console.log(this.options);

			this.model = new DataModel();
			this.model.set({
				title: 'New bundle',
				description: '',
				collection: {
					museum: ''
				}
			});

			this.model.url = config.apiUrl+'/bundle/new/';

			this.model.set({
				documents: this.options.documentIds.split(';')
			});

			this.render();
		},

		events: {
			'click .save-button': 'saveButtonClick'
		},

		saveButtonClick: function() {
			this.model.url = config.apiUrl+'/bundle';
			this.model.save(null, {
				beforeSend: authHelper.sendAuthentication,
				success: _.bind(function(response) {
					this.options.app.showMessage('Bundle entry saved.');

					setTimeout(_.bind(function() {
						this.options.router.navigate('bundle/'+this.model.attributes._id, {
							trigger: true
						});
					}, this), 1000);
				}, this),
				type: 'PUT'
			});
		},

		render: function() {
			var template = _.template($("#newBundleViewTemplate").html());

			this.$el.html(template({
				model: this.model
			}));

			this.documentList = new DocumentsListView({
				el: this.$el.find('.image-list-container'),
				documentIds: this.options.documentIds,
				renderUI: false,
				viewMode: 'grid',
				hideCheckBoxes: true,
				showAll: true
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