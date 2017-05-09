define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	return Backbone.Router.extend({
		routes: {
			"": "default",
			"places/search/:query": "placesearch",
			"documents/combine/:documents": "combinedocuments",
			"documents(/page/:page)(/museum/:museum)(/type/:type)(/search/:search)(/insert_id/:insert_id)": "documents",
			"document/:id": "document",
			"bundles/new/:documents": "newbundle",
			"bundles(/page/:page)(/museum/:museum)(/search/:search)": "bundles",
			"bundle/:bundle": "bundle",
			"map": "map"
		}
	});
});