define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	return Backbone.Collection.extend({
		url: 'http://localhost:3000/documents',

		initialize: function() {
			this.metadata = new Backbone.Model();
		},

		parse: function(data) {
			if (data.metadata) {			
				this.metadata.set({
					page: data.metadata.page,
					total: data.metadata.total
				});
			}
			return data.documents;
		},

		search: function(query) {
			this.searchQuery = query;
			this.url = this.urlBase+'/search/'+query;
			this.fetch({
				reset: true
			});
		},

		byBundle: function(bundle, page, showAll) {
			this.searchQuery = '';
			this.currentPage = page;

			this.fetch({
				reset: true,
				data: {
					page: this.currentPage,
					bundle: bundle,
					showAll: showAll ? true : false
				}
			});
		},

		getPage: function(page, order, orderDir, showAll) {
			this.searchQuery = '';
			this.order = order == undefined ? '' : order;
			this.orderDir = orderDir == undefined ? '' : orderDir;
			this.currentPage = page;

			this.fetch({
				reset: true,
				data: {
					page: this.currentPage,
					showAll: showAll ? true : false
				}
			});
		}
	});
});