var app = app || {};

(function ($) {
	app.AppView = Backbone.View.extend({
		el: '#todoapp',
		statsTemplate: _.template( $('#stats-template').html() ),
		events: {
			'keypress #new-todo' : 'createOnEnter',
			'click #clear-completed' : 'clearCompleted',
			'click #toggle-all' : 'toggleAllComplete'
		},
		initialize: function () {
			this.allCheckbox = this.$('#toggle-all')[0];
			this.$input = this.$('#new-todo');
			this.$footer = this.$('#footer');
			this.$main = this.$('#main');
			
			
			//No parenthesis after method names because you're just telling
			//backbone what property to look for. Parenthesis would make
			//it run inline and fuck everything up.
			
			this.listenTo(app.Todos, 'add', this.addOne);
			this.listenTo(app.Todos, 'reset', this.addAll);
			this.listenTo(app.Todos, 'change:completed', this.filterOne);
			this.listenTo(app.Todos, 'filter', this.filterAll);
			this.listenTo(app.Todos, 'all', this.render);

			app.Todos.fetch();
		},
		render: function () {
			var completed = app.Todos.completed().length,
				remaining = app.Todos.remaining().length;
				
			if (app.Todos.length) {
				this.$main.show();
				this.$footer.show();
				
				this.$footer.html(this.statsTemplate({
					completed: completed,
					remaining: remaining
				}));
				
				this.$('#filters').find('a')
					.removeClass('selected')
					.filter('[href="#/' + (app.TodoFilter || '') + '"]' )
					.addClass('selected');

			} else {
				this.$footer.hide();
			}
			
		},
		addOne: function (todo) {
			var view = new app.TodoView({
				model: todo
			});
			$('#todo-list').append(view.render().el);
		},
		addAll: function () {
			this.$('#todo-list').html('');
			app.Todos.each(this.addOne, this);
		},
		filterOne: function ( todo ) {
			todo.trigger('visible');
			
		},
		filterAll: function () {
			app.Todos.each(this.filterOne, this);
		},
		newAttributes: function () {
			return {
				title: this.$input.val().trim(),
				order: app.Todos.nextOrder(),
				completed: false,
			}
		},
		createOnEnter: function (e) {
			if ( e.which !== ENTER_KEY || !this.$input.val().trim() ) {
				return;
			}
			
			app.Todos.create(this.newAttributes());
			this.$input.val('');
		},
		clearCompleted: function () {
			_.invoke( app.Todos.completed(), 'destroy' );
			return false;
		},
		toggleAllComplete: function () {
			var completed = this.allCheckbox.checked;
			console.log('completed ' + completed);
			
			app.Todos.each( function(todo) {
				todo.save({
					'completed' : completed
				})
			});
		}
	});
})(jQuery);