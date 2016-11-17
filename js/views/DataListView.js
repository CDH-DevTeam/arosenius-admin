define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	return Backbone.View.extend({
		checkAllClick: function(event) {
			if (!this.disableCheckBoxes) {
				console.log($(event.currentTarget).closest('table').find('.item-check').length)
				if ($(event.currentTarget).closest('table').find('.item-check').length == $(event.currentTarget).closest('table').find('.item-check:checked').length) {
					$(event.currentTarget).closest('table').find('.item-check').prop('checked', false);
				}
				else {
					$(event.currentTarget).closest('table').find('.item-check').prop('checked', true);
				}
				this.trigger('listCheckChanged');
			}
		},

		destroy: function() {
			this.undelegateEvents();
			this.$el.removeData().unbind();
			this.$el.html('');
		},

		updateMetadata: function() {
			console.log('updateMetadata');

			this.$el.find('.page-info').html((Number(this.collection.metadata.get('page'))+200)+' / '+this.collection.metadata.get('total'));
		},

		renderUI: function() {
			var template = _.template($("#"+this.uiTemplateName).html());

			this.$el.html(template());

			if (this.afterRenderUI) {
				this.afterRenderUI();
			}
			
			return this;
		}
	});
});