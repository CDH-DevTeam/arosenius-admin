define(function(require){
	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	return Backbone.View.extend({
		objReference: function(obj, ref, value) {
			if (typeof obj == 'undefined') {
				obj = {};
			}

			if (typeof ref == 'string') {
				return this.objReference(obj, ref.split('.'), value);
			}
			else if (ref.length == 1 && value !== undefined) {
				return obj[ref[0]] = value;
			}
			else if (ref.length == 0) {
				return obj;
			}
			else {
				if (ref.length > 1 && obj[ref[0]] == undefined) {
					obj[ref[0]] = {};
				}

				return this.objReference(obj[ref[0]], ref.slice(1), value);
			}
		},

		initBindings: function() {
			var assignValue = _.bind(function(bindPropertyKey, bindProperty, value) {

				if (bindPropertyKey != undefined) {
					var attribute = this.model.get(bindProperty) ? this.model.get(bindProperty) : {};

					if (bindPropertyKey.indexOf('.') > -1) {
						this.objReference(attribute, bindPropertyKey, value);
					}
					else {
						attribute[bindPropertyKey] = value;
					}

					this.model.set(bindProperty, attribute);
				}
				else {
					this.model.set(bindProperty, value);
				}
			}, this);

			_.each(this.$el.find('[data-bind]'), _.bind(function(el) {
				var bindProperty = $(el).data('bind');
				var bindPropertyKey = $(el).data('bind-key');
				var bindFormatter = $(el).data('formatter');

				if ($(el).is('input') || $(el).is('textarea')) {
					$(el).focusout(_.bind(function() {
						var value = $(el).val();
						if (bindFormatter) {
							if (bindFormatter == 'nl-array') {
								value = value.split("\n");
								if (value.length && value[0] == '') {
									value = [];
								}
							}
						}
						assignValue(bindPropertyKey, bindProperty, value);
					}, this));
/*
					this.model.on('change:'+bindProperty, _.bind(function() {
						$(el).val(this.model.get(bindProperty));
					}, this));
*/
				}

				if ($(el).is('select')) {
					$(el).change(_.bind(function() {
						assignValue(bindPropertyKey, bindProperty, $(el).val());
					}, this));
/*
					this.model.on('change:'+bindProperty, _.bind(function() {
						$(el).val(this.model.get(bindProperty));
					}, this));
*/
				}
			}, this));
		},

		destroy: function() {
			this.undelegateEvents();
			this.$el.removeData().unbind(); 
		}
	});
});