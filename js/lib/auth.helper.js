define(function(require) {
	var Backbone = require('backbone');
	var _ = require('underscore');
	var $ = require('jquery');

	var config = require('config');

	return {
		authenticated: function() {
			return sessionStorage['username'] && sessionStorage['username'] != '' && sessionStorage['password'] && sessionStorage['password'] != '';
		},

		login: function(view, success) {
			console.log('do the login?');

			var template = _.template($("#loginTemplate").html());

			view.$el.find('.view-container').html(template());

			view.$el.find('#loginButton').click(_.bind(function() {
				$.ajax({
					url: config.apiUrl+'/login',
					type: 'GET',
					dataType: 'json',
					success: _.bind(function(data) {
						console.log('login success?');
						if (data.login == 'success') {
							sessionStorage['username'] = view.$el.find('#loginUserInput').val();
							sessionStorage['password'] = view.$el.find('#loginPasswordInput').val();

							success();
						}
					}, this),
					error: _.bind(function() {
						console.log('login error?')
					}, this),
					beforeSend: _.bind(function(xhr) {
						var user = view.$el.find('#loginUserInput').val();
						var pass = view.$el.find('#loginPasswordInput').val();

						var token = user.concat(":", pass);

						xhr.setRequestHeader('Authorization', ("Basic ".concat(btoa(token))));
					}, this)
				});
			}, this));

//			success();
		},

		sendAuthentication: function(xhr) {
			var user = sessionStorage['username'];
			var pass = sessionStorage['password'];

			var token = user.concat(":", pass);

			xhr.setRequestHeader('Authorization', ("Basic ".concat(btoa(token))));
		}
	}
});