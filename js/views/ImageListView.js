define(function(require){

	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	var authHelper = require('lib/auth.helper');
	var config = require('config');

	return Backbone.View.extend({
		initialize: function(options) {
			this.options = options;

			this.page = 0;
			this.pageSize = 100;

			this.collection = new Backbone.Collection();
			this.collection.url = config.publicApiUrl+'/image_file_list'
			this.collection.on('reset', this.render, this);
			this.collection.fetch({
				reset: true
			});

			this.renderUi();
		},

		events: {
			'click .list-container .item': 'imageItemClickHandler',
			'click .prev-button': 'prevButtonClickHandler',
			'click .next-button': 'nextButtonClickHandler',
			'click .upload-button': 'uploadButtonClickHandler',
			'click .close-button': 'closeButtonClickHandler',
			'keyup .search-input': 'searchHandler'
		},

		searchHandler: function(event) {
			var value = event.target.value;

			if (value.length > 2) {
				this.listFilter = value;

				this.renderList();
			}
			else {
				if (this.listFilter) {
					this.listFilter = undefined;

					this.renderList();
				}
			}
		},

		prevButtonClickHandler: function() {
			this.listFilter = undefined;
			this.$el.find('.search-input').val('');

			if (this.page > 0) {
				this.page--;
				this.render();
			}
		},

		nextButtonClickHandler: function() {
			this.listFilter = undefined;
			this.$el.find('.search-input').val('');

			this.page++;
			this.render();
		},

		uploadButtonClickHandler: function() {
			var picture = $('#uploadInput')[0].files[0]; 

			var data = new FormData();
			data.append('file', picture);

			$.ajax({
				url: config.apiUrl+'/upload',
				data: data,
				cache: false,
				contentType: false,
				processData: false,
				type: 'POST',
				beforeSend: authHelper.sendAuthentication,
				success: _.bind(function(data){
					console.log('success')
					console.log(data);

					if (data.success) {
						this.listFilter = data.filename.split('.')[0];

						this.$el.find('.search-input').val(this.listFilter);
			
						this.collection.fetch({
							reset: true
						});
					}
				}, this),
				error: function(data){
					console.log('error')
					console.log(data)
				}
			});
		},

		imageItemClickHandler: function(event) {
			event.preventDefault();

			if (this.options.onSelect) {
				this.options.onSelect(event.target.dataset.image);
			}
		},

		closeButtonClickHandler: function() {
			if (this.options.onClose) {
				this.options.onClose();
			}
		},

		renderUi: function() {
			var template = _.template($('#imageListViewTemplate').html());
			this.$el.html(template());
		},

		render: function() {
			this.renderList();

			return this;
		},

		renderList: function() {
			var template = _.template($('#imageListTemplate').html());
			this.$el.find('.list-container').html(template({
				models: this.listFilter ? _.filter(this.collection.models, _.bind(function(model) {
					return model.get('file').toLowerCase().indexOf(this.listFilter.toLowerCase()) > -1;
				}, this)) : this.collection.models.slice(this.page*this.pageSize, (this.page*this.pageSize)+this.pageSize)
			}));
		},

		destroy: function() {
			this.undelegateEvents();
			this.$el.removeData().unbind(); 
		}
	});
});