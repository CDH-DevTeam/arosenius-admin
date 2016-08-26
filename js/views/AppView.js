define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	var AppRouter = require('router/AppRouter');

	var authHelper = require('lib/auth.helper');

	return Backbone.View.extend({
		initialize: function() {
			this.render();

			if (!authHelper.authenticated()) {
				authHelper.login(this, _.bind(this.initializeReady, this));
			}
			else {
				this.initializeReady();
			}
		},

		initializeReady: function() {

			this.router = new AppRouter();
			this.router.on('route:default', _.bind(function() {
				this.showDocumentsListView();
			}, this));
			this.router.on('route:documents', _.bind(function(page, orderDir) {
				this.showDocumentsListView(page, orderDir);
			}, this));
			this.router.on('route:placesearch', _.bind(function(searchQuery) {
				this.showPlaceListView(undefined, undefined, undefined, searchQuery);
			}, this));
			this.router.on('route:document', _.bind(function(documentId) {
				this.showDocumentView(documentId);
			}, this));
			this.router.on('route:bundles', _.bind(function(page, orderDir) {
				this.showBundlesListView(page, orderDir);
			}, this));
			this.router.on('route:bundle', _.bind(function(bundleId) {
				this.showBundleView(bundleId);
			}, this));
			Backbone.history.start();
		},

		showMessage: function(msg) {
			this.$el.find('.overlay-container').html('<div class="message">'+msg+'</div>');
			setTimeout(_.bind(function() {
				this.$el.find('.overlay-container').html('');
			}, this), 1500);
		},

		showDocumentsListView: function(page, order, orderDir, searchQuery) {
			console.log('page :'+page);
			if (this.currentView != 'DocumentsListView') {
				this.currentView = 'DocumentsListView';

				var DocumentsListView = require('views/DocumentsListView');
				if (this.mainView != undefined) {
					this.mainView.destroy();
				}

				this.mainView = new DocumentsListView({
					el: this.$el.find('.view-container'),
					router: this.router,
					page: page == undefined ? 1 : page,
					order: order == undefined ? '' : order,
					orderDir: orderDir == undefined ? '' : orderDir,
					searchQuery: searchQuery == undefined ? '' : searchQuery,
					app: this
				});
			}
			else {
				this.mainView.collection.getPage(page == undefined ? 1 : page);
			}
		},

		showBundlesListView: function(page, order, orderDir, searchQuery) {
			if (this.currentView != 'BundleListView') {
				this.currentView = 'BundleListView';

				var BundleListView = require('views/BundleListView');
				if (this.mainView != undefined) {
					this.mainView.destroy();
				}

				this.mainView = new BundleListView({
					el: this.$el.find('.view-container'),
					router: this.router,
					page: page == undefined ? 1 : page,
					order: order == undefined ? '' : order,
					orderDir: orderDir == undefined ? '' : orderDir,
					searchQuery: searchQuery == undefined ? '' : searchQuery,
					app: this
				});
			}
			else {
				this.mainView.collection.getPage(page == undefined ? 1 : page);
			}
		},

		showDocumentView: function(documentId) {
			if (this.currentView != 'DocumentView') {
				this.currentView = 'DocumentView';

				var DocumentView = require('views/DocumentView');
				if (this.mainView != undefined) {
					this.mainView.destroy();
				}
				this.mainView = new DocumentView({
					el: this.$el.find('.view-container'),
					documentId: documentId,
					router: this.router,
					app: this
				});
			}
		},

		showBundleView: function(bundleId) {
			if (this.currentView != 'BundleView') {
				this.currentView = 'BundleView';

				var BundleView = require('views/BundleView');
				if (this.mainView != undefined) {
					this.mainView.destroy();
				}
				this.mainView = new BundleView({
					el: this.$el.find('.view-container'),
					bundleId: bundleId,
					router: this.router,
					app: this
				});
			}
		},

		render: function() {
			var template = _.template($("#appTemplate").html());

			this.$el.html(template());
			return this;
		}
	});
});