define(function(require){
	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	var config = require('config');

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

		initDataSelects: function() {
			_.each(this.$el.find('.data-select-wrapper'), _.bind(function(el) {
				var optionsCollection = new Backbone.Collection();
				optionsCollection.url = config.publicApiUrl+$(el).data('endpoint');
				optionsCollection.on('reset', function() {
					var selectEl = $('<select class="data-select"><option>...</option>'+_.map(
						_.filter(optionsCollection.models, function(model) {
							return model.get('value') != '';
						}), function(model) {
						return '<option>'+model.get('value')+'</option>';
					}).join('')+'</select>');

					$(el).append(selectEl);
	
					selectEl.on('change', function(event) {
						var selectedValue = selectEl.find(":selected").text();

						if (selectedValue != '...') {
							$(el).find('textarea').val(selectedValue+'\n'+$(el).find('textarea').val());
							setTimeout(function() {
								$(el).find('textarea').change();
							}, 100);
							selectEl.val('...');
						}
					});
				});
				optionsCollection.fetch({
					reset: true
				});
			}, this));
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
					$(el).change(_.bind(function() {
						var value = $(el).val();
						if (bindFormatter) {
							if (bindFormatter == 'nl-array') {
								value = _.uniq(value.split("\n"));
								if (value.length && value[0] == '') {
									value = [];
								}
							}
						}
						if ($(el).attr('type') == 'checkbox') {
							assignValue(bindPropertyKey, bindProperty, $(el).is(':checked'));
						}
						else {
							assignValue(bindPropertyKey, bindProperty, value);
						}
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