define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	var DocumentListCollection = require('collections/DocumentListCollection');
	var DataListView = require('views/DataListView');

	var config = require('config');

	var authHelper = require('lib/auth.helper');

	return DataListView.extend({
		uiTemplateName: 'documentListViewTemplate',

		initialize: function(options) {
			this.options = options;

			this.viewMode = this.options.viewMode || localStorage.viewMode || 'list';

			this.collection = new DocumentListCollection();
			this.collection.on('reset', this.render, this);
			this.collection.metadata.on('change', this.updateMetadata, this);

			if (this.options.bundle != undefined) {
				this.collection.byBundle(this.options.bundle, 0, this.options.showAll);
			}
			else {
				this.collection.getPage(this.options.page, this.options.museum, this.options.type, this.options.searchQuery);
			}

			if (this.viewMode == 'grid') {
				this.uiTemplateName = 'documentGridViewTemplate';
			}
			else {
				this.uiTemplateName = 'documentListViewTemplate';
			}

			if (this.options.renderUI != undefined) {
				if (this.options.renderUI != false) {
					this.renderUI();
				}
			}
			else {
				this.renderUI();
			}

			this.on('listCheckChanged', _.bind(this.placeCheckClick, this));
			this.on('search', _.bind(function(event) {
				if (this.options.router) {
					this.options.router.navigate('/places/search/'+event.query);
				}
			}, this));
		},

		events: {
			'click .footer-toolbar .prev': function() {
				if (this.collection.currentPage > 1) {
					var selectedMuseum = this.$el.find('.search-museum-select').find(":selected").val();
					var selectedType = this.$el.find('.search-type-select').find(":selected").val();
					var searchQuery = this.$el.find('.footer-toolbar .search-input').val();

					this.options.app.router.navigate('documents/page/'+(Number(this.collection.currentPage)-1)+
						(selectedMuseum != 'all' ? '/museum/'+selectedMuseum : '')+
						(selectedType != 'all' ? '/type/'+selectedType : '')+
						(searchQuery != '' ? '/search/'+searchQuery : ''),
					{
						trigger: true
					});
				}
			},
			'click .footer-toolbar .next': function() {
				var selectedMuseum = this.$el.find('.search-museum-select').find(":selected").val();
				var selectedType = this.$el.find('.search-type-select').find(":selected").val();
				var searchQuery = this.$el.find('.footer-toolbar .search-input').val();

				this.options.app.router.navigate('documents/page/'+(Number(this.collection.currentPage)+1)+
					(selectedMuseum != 'all' ? '/museum/'+selectedMuseum : '')+
					(selectedType != 'all' ? '/type/'+selectedType : '')+
					(searchQuery != '' ? '/search/'+searchQuery : ''),
				{
					trigger: true
				});
			}
		},

		viewModeClick: function(event) {
			this.setViewMode($(event.currentTarget).data('viewmode'));
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

		setViewMode: function(viewMode) {
			console.log('- setViewMode -');
			console.log(this.options);
			this.viewMode = viewMode;
			localStorage.viewMode = this.viewMode;

			if (this.viewMode == 'grid') {
				this.uiTemplateName = 'documentGridViewTemplate';
			}
			else {
				this.uiTemplateName = 'documentListViewTemplate';
			}

			this.renderUI();
			this.render();
			console.log(this.options);
			console.log('-');
		},

		updateOptions: function() {
			this.$el.find('.footer-toolbar .search-museum-select').val(this.options.museum ? this.options.museum : 'all');
			this.$el.find('.footer-toolbar .search-type-select').val(this.options.type ? this.options.type : 'all');
		},

		uiSearch: function() {
			var selectedMuseum = this.$el.find('.search-museum-select').find(":selected").val();
			var selectedType = this.$el.find('.search-type-select').find(":selected").val();
			var searchQuery = this.$el.find('.footer-toolbar .search-input').val();

			if (selectedMuseum == 'all' && selectedType == 'all' && searchQuery == '') {
				this.collection.getPage(1);

				this.options.app.router.navigate('documents/page/1', {
					trigger: true
				});
			}
			else {
				this.options.app.router.navigate('documents/page/1'+
					(selectedMuseum != 'all' ? '/museum/'+selectedMuseum : '')+
					(selectedType != 'all' ? '/type/'+selectedType : '')+
					(searchQuery != '' ? '/search/'+searchQuery : ''),
				{
					trigger: true
				});
			}
		},

		afterRenderUI: function() {
			this.$el.find('.floating-toolbar .viewmode-button').click(_.bind(this.viewModeClick, this));

			this.$el.find('.footer-toolbar .search-input').keydown(_.bind(function(event) {
				if (event.keyCode == 13) {
					this.uiSearch();
				}
			}, this));

			this.$el.find('.footer-toolbar select').change(_.bind(function(event) {
				this.uiSearch();
			}, this));

			this.museumsCollection = new Backbone.Collection();
			this.museumsCollection.url = config.publicApiUrl+'/museums';
			this.museumsCollection.on('reset', _.bind(function() {
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

			this.typeCollection = new Backbone.Collection();
			this.typeCollection.url = config.publicApiUrl+'/types';
			this.typeCollection.on('reset', _.bind(function() {
				_.each(this.typeCollection.models, _.bind(function(model) {
					this.$el.find('.footer-toolbar .search-type-select').append('<option>'+model.get('value')+'</option>');
				}, this));
				if (this.options.type && this.options.type != '') {
					this.$el.find('.footer-toolbar .search-type-select').val(this.options.type);
				}
			}, this));
			this.typeCollection.fetch({
				reset: true
			});
		},

		render: function() {
			this.renderList();

			return this;
		},

		renderList: function() {
			console.log('DocumentsListView: renderList');
			var template = _.template($(this.viewMode == 'grid' ? "#documentGridTemplate" : "#documentListTemplate").html());
			this.$el.find('.list-container').html(template({
				models: this.collection.models
			}));
			this.$el.find('.item-check').click(_.bind(this.placeCheckClick, this));
			this.placeCheckClick();
		}
	});
});