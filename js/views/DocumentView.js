define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');
	require('leaflet');

	var DataView = require('views/DataView');
	var DataModel = require('models/DataModel');

	return DataView.extend({
		initialize: function(options) {
			this.options = options;

			this.model = new DataModel();
			this.model.once('change', this.render, this);
			this.model.url = 'http://cdh-vir-1.it.gu.se:8004/document/'+this.options.documentId;
			this.model.fetch();
		},

		events: {
			'click .save-button': 'saveButtonClick'
		},

		saveButtonClick: function() {
			this.model.url = 'http://localhost:3000/document/'+this.options.documentId;
			this.model.save(null, {
				success: _.bind(function() {
					this.render();
					this.options.app.showMessage('Document entry saved.')
				}, this),
				type: 'POST'
			});
		},

		render: function() {
			var template = _.template($("#documentViewTemplate").html());

			this.$el.html(template({
				model: this.model
			}));

			this.initBindings();
			return this;
		},

		destroy: function() {
			DataView.prototype.destroy.call(this);
		}
	});
});