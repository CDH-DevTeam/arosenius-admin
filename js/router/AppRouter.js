define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	return Backbone.Router.extend({
		routes: {
			"": "default",
			"places/search/:query": "placesearch",
			"documents(/page/:page)(/museum/:museum)(/search/:search)": "documents",
			"document/:id": "document",
			"bundles(/page/:page)(/museum/:museum)(/search/:search)": "bundles",
			"bundle/:bundle": "bundle",
			"map": "map"
		}
	});
});