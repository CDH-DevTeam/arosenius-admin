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
				this.router.navigate('documents', {
					trigger: true
				});
			}, this));
			this.router.on('route:documents', _.bind(function(page, museum, type, searchQuery, insertId) {
				this.showDocumentsListView(page, museum, type, searchQuery, insertId);
			}, this));
			this.router.on('route:document', _.bind(function(documentId) {
				this.showDocumentView(documentId);
			}, this));
			this.router.on('route:bundles', _.bind(function(page, museum, searchQuery) {
				this.showBundlesListView(page, museum, searchQuery);
			}, this));
			this.router.on('route:bundle', _.bind(function(bundleId) {
				this.showBundleView(bundleId);
			}, this));
			this.router.on('route:newbundle', _.bind(function(documentIds) {
				this.showNewBundleView(documentIds);
			}, this));
			this.router.on('route:combinedocuments', _.bind(function(documentIds) {
				this.showCombineDocumentsView(documentIds);
			}, this));
			Backbone.history.start();
		},

		showMessage: function(msg) {
			this.$el.find('.overlay-container').html('<div class="message">'+msg+'</div>');
			setTimeout(_.bind(function() {
				this.$el.find('.overlay-container').html('');
			}, this), 1500);
		},

		showDocumentsListView: function(page, museum, type, searchQuery, insertId) {
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
					museum: museum == undefined ? '' : museum,
					type: type == undefined ? '' : type,
					searchQuery: searchQuery == undefined ? '' : searchQuery,
					insertId: insertId == undefined ? '' : insertId,
					app: this
				});
			}
			else {
				this.mainView.options.page = page;
				this.mainView.options.museum = museum;
				this.mainView.options.type = type;
				this.mainView.options.searchQuery = searchQuery;
				this.mainView.options.insertId = insertId;
				this.mainView.updateOptions();

				this.mainView.collection.getPage(page == undefined ? 1 : page, museum, type, searchQuery, insertId);
			}
		},

		showBundlesListView: function(page, museum, searchQuery) {
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
					museum: museum == undefined ? '' : museum,
					searchQuery: searchQuery == undefined ? '' : searchQuery,
					app: this
				});
			}
			else {
				this.mainView.options.page = page;
				this.mainView.options.museum = museum;
				this.mainView.options.searchQuery = searchQuery;
				this.mainView.updateOptions();

				this.mainView.collection.getPage(page == undefined ? 1 : page, museum, searchQuery);
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
			else {
				this.mainView.getDocument(documentId);
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

		showNewBundleView: function(documentIds) {
			if (this.currentView != 'NewBundleView') {
				this.currentView = 'NewBundleView';

				var NewBundleView = require('views/NewBundleView');
				if (this.mainView != undefined) {
					this.mainView.destroy();
				}
				this.mainView = new NewBundleView({
					el: this.$el.find('.view-container'),
					documentIds: documentIds,
					router: this.router,
					app: this
				});
			}
		},

		showCombineDocumentsView: function(documentIds) {
			if (this.currentView != 'CombineDocumentsView') {
				this.currentView = 'CombineDocumentsView';

				var CombineDocumentsView = require('views/CombineDocumentsView');
				if (this.mainView != undefined) {
					this.mainView.destroy();
				}
				this.mainView = new CombineDocumentsView({
					el: this.$el.find('.view-container'),
					documentIds: documentIds,
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