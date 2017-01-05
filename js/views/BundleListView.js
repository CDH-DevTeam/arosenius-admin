define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	var BundleListCollection = require('collections/BundleListCollection');
	var DataListView = require('views/DataListView');

	var config = require('config');

	return DataListView.extend({
		uiTemplateName: 'bundleListViewTemplate',
		viewMode: 'grid',

		initialize: function(options) {
			this.options = options;

			this.collection = new BundleListCollection();
			this.collection.order = this.options.order;
			this.collection.orderDir = this.options.orderDir;
			this.collection.on('reset', this.render, this);
			this.collection.metadata.on('change', this.updateMetadata, this);

			this.collection.getPage(this.options.page, this.options.museum, this.options.searchQuery);

			this.renderUI();

			this.on('listCheckChanged', _.bind(this.placeCheckClick, this));
			this.on('search', _.bind(function(event) {
				this.options.router.navigate('/places/search/'+event.query);
			}, this));
		},

		events: {
			'click .footer-toolbar .prev': function() {
				if (this.collection.currentPage > 1) {
					var selectedMuseum = this.$el.find('.search-museum-select').find(":selected").val();
					var searchQuery = this.$el.find('.footer-toolbar .search-input').val();

					this.options.app.router.navigate('bundles/page/'+(Number(this.collection.currentPage)-1)+
						(selectedMuseum != 'all' ? '/museum/'+selectedMuseum : '')+
						(searchQuery != '' ? '/search/'+searchQuery : ''),
					{
						trigger: true
					});
				}
			},
			'click .footer-toolbar .next': function() {
				var selectedMuseum = this.$el.find('.search-museum-select').find(":selected").val();
				var searchQuery = this.$el.find('.footer-toolbar .search-input').val();

				this.options.app.router.navigate('bundles/page/'+(Number(this.collection.currentPage)+1)+
					(selectedMuseum != 'all' ? '/museum/'+selectedMuseum : '')+
					(searchQuery != '' ? '/search/'+searchQuery : ''),
				{
					trigger: true
				});
			}
		},

		updateMetadata: function() {
			if (this.collection.metadata.get('page') != undefined) {
				this.$el.find('.page-info').html((Number(this.collection.metadata.get('page'))+200)+' / '+this.collection.metadata.get('total'));
			}
		},

		checkedPlaces: [],

		placeCheckClick: function(event) {
			this.checkedPlaces = _.map(this.$el.find('.item-check:checked'), _.bind(function(checkBox) {
				return $(checkBox).data('id');
			}, this));

			if (this.checkedPlaces.length > 1) {
				this.$el.find('.combine-controls').css('display', 'block');
				this.$el.find('.combine-controls .checked-number').text(this.checkedPlaces.length);

				var selectOptions = _.map(this.checkedPlaces, _.bind(function(placeId) {
					return '<option value="'+placeId+'">'+this.collection.get(placeId).get('name')+' ['+this.collection.get(placeId).get('area')+']'+(this.collection.get(placeId).get('lat') != undefined ? ' [g]' : '')+'</option>';
				}, this));
				this.$el.find('.combine-controls .combine-places-select').html(selectOptions);
			}
			else {
				this.$el.find('.combine-controls').css('display', 'none');
			}
		},

		render: function() {
			this.renderList();

			return this;
		},

		uiSearch: function() {
			var selectedMuseum = this.$el.find('.search-museum-select').find(":selected").val();
			var searchQuery = this.$el.find('.footer-toolbar .search-input').val();
			console.log(searchQuery);
			if (selectedMuseum == 'all' && searchQuery == '') {
				this.collection.getPage(1);

				this.options.app.router.navigate('bundles/page/1', {
					trigger: true
				});
			}
			else {
				this.options.app.router.navigate('bundles/page/1'+
					(selectedMuseum != 'all' ? '/museum/'+selectedMuseum : '')+
					(searchQuery != '' ? '/search/'+searchQuery : ''),
				{
					trigger: true
				});
			}
		},

		afterRenderUI: function() {
			this.$el.find('.footer-toolbar .search-input').keydown(_.bind(function(event) {
				if (event.keyCode == 13) {
					this.uiSearch();
				}
			}, this));

			this.$el.find('.footer-toolbar .search-museum-select').change(_.bind(function(event) {
				this.uiSearch();
			}, this));

			this.museumsCollection = new Backbone.Collection();
			this.museumsCollection.url = config.publicApiUrl+'/museums';
			this.museumsCollection.on('reset', _.bind(function() {
				console.log('museumsCollection.reset');
				console.log(this.options);
				_.each(this.museumsCollection.models, _.bind(function(model) {
					this.$el.find('.footer-toolbar .search-museum-select').append('<option>'+model.get('value')+'</option>');
				}, this));
				if (this.options.museum && this.options.museum != '') {
					this.$el.find('.footer-toolbar .search-museum-select').val(this.options.museum);
				}
			}, this));
			this.museumsCollection.fetch({
				reset: true
			});
		},

		renderList: function() {
			var template = _.template($('#bundleListTemplate').html());
			this.$el.find('.list-container').html(template({
				models: this.collection.models
			}));
			this.$el.find('.item-check').click(_.bind(this.placeCheckClick, this));
			this.placeCheckClick();			
		}
	});
});