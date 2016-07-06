define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');
	require('leaflet');

	var DataView = require('views/DataView');
	var DataModel = require('models/DataModel');
	var DocumentsListView = require('views/DocumentsListView');

	return DataView.extend({
		initialize: function(options) {
			this.options = options;

			this.model = new DataModel();
			this.model.once('change', this.render, this);
			this.model.url = 'http://127.0.0.1:3000/bundle/'+this.options.bundleId;
			this.model.fetch();
		},

		events: {
			'click .save-button': 'saveButtonClick'
		},

		saveButtonClick: function() {
			this.model.url = 'http://127.0.0.1:3000/document/'+this.options.placeId;
			this.model.save(null, {
				success: _.bind(function() {
					this.render();
					this.options.app.showMessage('Place entry saved.')
				}, this),
				type: 'POST'
			});
		},

		render: function() {
			var template = _.template($("#bundleViewTemplate").html());

			this.$el.html(template({
				model: this.model
			}));

			this.documentList = new DocumentsListView({
				el: this.$el.find('.image-list-container'),
				bundle: this.model.get('bundle'),
				renderUI: false,
				viewMode: 'grid',
				hideCheckBoxes: true,
				showAll: true
			});

			this.initBindings();
			return this;
		},

		destroy: function() {
			DataView.prototype.destroy.call(this);
		}
	});
});