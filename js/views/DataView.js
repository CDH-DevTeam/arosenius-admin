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

		escapeValue: function(value) {
			return value.split('"').join('\"');
		},

		htmlescapeValue: function(value) {
			return value ? value.split('"').join('&quot;') : '';
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
							if ($(el).find('textarea').length > 0) {
								$(el).find('textarea').val(selectedValue+'\n'+$(el).find('textarea').val());
								setTimeout(function() {
									$(el).find('textarea').change();
								}, 100);								
							}
							else if ($(el).find('input').length > 0) {
								$(el).find('input').val(selectedValue);
								setTimeout(function() {
									$(el).find('input').change();
								}, 100);								
							}
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
			var assignValue = _.bind(function(bindPropertyKey, bindProperty, value, bindPropertyIndex) {

				if (bindPropertyKey != undefined) {
					var attribute = this.model.get(bindProperty) ? this.model.get(bindProperty) : {};

					if (bindPropertyKey.indexOf('.') > -1) {
						this.objReference(bindPropertyIndex !== undefined ? attribute[bindPropertyIndex] : attribute, bindPropertyKey, value);
					}
					else {
						if (bindPropertyIndex !== undefined) {
							attribute[bindPropertyIndex][bindPropertyKey] = value;
						}
						else {
							attribute[bindPropertyKey] = value;
						}
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
				var bindPropertyIndex = $(el).data('bind-index');
				var bindFormatter = $(el).data('formatter');

				if ($(el).is('input') || $(el).is('textarea')) {
					$(el).change(_.bind(function() {
						var value = this.escapeValue($(el).val());
						
						if (bindFormatter) {
							if (bindFormatter == 'nl-array') {
								value = _.map(_.uniq(value.split("\n")), function(item) {
									if (item.substr(item.length-1) == ' ') {
										return item.slice(0, -1);
									}
									else {
										return item;
									}
								});
								if (value.length && value[0] == '') {
									value = [];
								}
							}
							if (bindFormatter == 'number') {
								value = Number(value.split(',').join('.'));
							}
						}
						if ($(el).attr('type') == 'checkbox') {
							assignValue(bindPropertyKey, bindProperty, $(el).is(':checked'), bindPropertyIndex);
						}
						else {
							assignValue(bindPropertyKey, bindProperty, value, bindPropertyIndex);
						}
					}, this));
				}

				if ($(el).is('select')) {
					$(el).change(_.bind(function() {
						assignValue(bindPropertyKey, bindProperty, this.escapeValue($(el).val()), bindPropertyIndex);
					}, this));
				}
			}, this));
		},

		destroy: function() {
			this.undelegateEvents();
			this.$el.removeData().unbind(); 
		}
	});
});