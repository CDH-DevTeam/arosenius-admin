define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	var config = require('config');

	var authHelper = require('lib/auth.helper');

	return Backbone.Collection.extend({
		url: config.apiUrl+'/bundles',

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
			return data.bundles;
		},

		search: function(query) {
			this.searchQuery = query;
			this.url = this.urlBase+'/search/'+query;
			this.fetch({
				beforeSend: authHelper.sendAuthentication,
				reset: true
			});
		},

		getPage: function(page, museum, searchQuery) {
			this.currentPage = page;

			var searchParams = {
				page: this.currentPage
			};

			if (museum) {
				searchParams['museum'] = museum;
			}
			if (searchQuery) {
				searchParams['search'] = searchQuery;
			}

			this.fetch({
				reset: true,
				beforeSend: authHelper.sendAuthentication,
				data: searchParams
			});
		}
	});
});