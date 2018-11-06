requirejs.config({
	urlArgs: "bust=" + (new Date()).getTime(),
	baseUrl: 'js/',
	paths: {
		jquery: 'lib/jquery-1.11.3.min',				
		backbone: 'lib/backbone-min',
		epoxy: 'lib/backbone.epoxy.min',
		underscore: 'lib/underscore-min',
		leaflet: 'lib/leaflet',
		markercluster: 'lib/leaflet.markercluster'
	},
	shim: {
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},

		'underscore': {
			exports: '_'
		},

		'jquery': {
			exports: '$'
		},

		'markercluster': {
			deps: ['leaflet']
		},

		'epoxy': {
			deps: ['backbone']
		}
	}
});

require(['js/views/AppView.js'],function(AppView) {
	$(function() {
		if ($('#appView').length > 0) {
			window.appView = new AppView({
				el: $('#appView')
			});
		}
	});
});
