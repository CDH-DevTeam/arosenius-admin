define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	return Backbone.Router.extend({
		routes: {
			"": "default",
			"places/search/:query": "placesearch",
			"documents(/:page)": "documents",
			"document/:id": "document",
			"bundles(/:page)": "bundles",
			"bundle/:bundle": "bundle",
			"map": "map"
		}
	});
});