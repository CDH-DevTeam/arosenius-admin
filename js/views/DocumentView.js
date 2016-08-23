define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');
	require('leaflet');

	var DataView = require('views/DataView');
	var DataModel = require('models/DataModel');

	var config = require('config');

	return DataView.extend({
		initialize: function(options) {
			this.options = options;

			this.model = new DataModel();
			this.model.once('change', this.render, this);
			this.model.url = config.apiUrl+'/document/'+this.options.documentId;
			this.model.fetch();
		},

		events: {
			'click .save-button': 'saveButtonClick',
			'click .image-link': 'imageLinkClick'
		},

		saveButtonClick: function() {
			this.model.url = config.apiUrl+'/document/'+this.options.documentId;
			this.model.save(null, {
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