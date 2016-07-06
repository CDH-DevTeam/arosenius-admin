define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	var BundleListCollection = require('collections/BundleListCollection');
	var DataListView = require('views/DataListView');

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

			if (this.options.searchQuery != '') {
				this.collection.search(this.options.searchQuery);
			}
			else {
				this.collection.getPage(this.options.page, this.options.order, this.options.orderDir);
			}

			this.renderUI();

			this.on('listCheckChanged', _.bind(this.placeCheckClick, this));
			this.on('search', _.bind(function(event) {
				this.options.router.navigate('/places/search/'+event.query);
			}, this));
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
			if (this.collection.searchQuery != '') {
				this.options.router.navigate('/bundles/search/'+this.collection.searchQuery);
			}
			else {
				this.options.router.navigate('/bundles/'+this.collection.currentPage+
					(this.collection.order != '' ? '/'+this.collection.order : '')+
					(this.collection.orderDir != '' ? '/'+this.collection.orderDir : '')
				);
			}

			this.renderList();

			return this;
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