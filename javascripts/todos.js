var TODOS = TODOS || {};

TODOS.namespace = function (ns_string) {

	var parts = ns_string.split("."),
		parent = TODOS,
		i;

	if (parts[0] === "TODOS") {
		parts = parts.slice(1);
	}

	for (i = 0; i < parts.length; i += 1) {
		if (typeof parent[parts[i]] === "undefined") {
			parent[parts[i]] = {};
		}
		parent = parent[parts[i]];
	}
	return parent;

}

TODOS.namespace("TODOS.util.activateTab");
TODOS.util.activateTab = function ($tab) {
	var $activeTab = $tab.closest('dl').find('dd.active'),
	    contentLocation = $tab.children('a').attr("href") + 'Tab';

	// Strip off the current url that IE adds
	contentLocation = contentLocation.replace(/^.+#/, '#');

	// Strip off the current url that IE adds
	contentLocation = contentLocation.replace(/^.+#/, '#');

	//Make Tab Active
	$activeTab.removeClass('active');
	$tab.addClass('active');

	var id = $tab.children("a").attr("href");

	//Show Tab Content
	$(contentLocation).closest('.tabs-content').children('li').hide();
	$(contentLocation).css('display', 'block');
}

TODOS.namespace("TODOS.App");
TODOS.App = function () {

	var Task = Backbone.Model.extend({
		defaults: {
			completed: false
		}
	});

	var TaskView = Backbone.View.extend({
		tagName: "li",
		className: "task",
		elTemplate: $("#todo-task-tpl").html(),
		render: function () {
			this.$el.append(_.template(this.elTemplate, {
				cid: this.model.cid,
				name: this.model.get("name")
			}));
			return this;
		}
	});

	var TaskList = Backbone.Collection.extend({
		model: Task
	});

	var TaskListView = Backbone.View.extend({
		tagName: "li",
		elTemplate: $("#todo-tasks-tpl").html(),
		events: {
			"click .button": "addTask",
			"keypress input[type='text']": "keypress"
		},
		initialize: function () {
			_.bindAll(this, "createTaskView", "renderTaskView");
			this.$el.attr("id", this.model.cid + "Tab");
			this.taskViews = {};
			this.collection.each(this.createTaskView);
			this.collection.on("add", this.createTaskView);
			this.collection.on("add", this.renderTaskView);
		},
		render: function () {
			this.$el.append(_.template(this.elTemplate));
			this.collection.each(this.renderTaskView);
			return this;
		},
		createTaskView: function (task) {
			this.taskViews[task.cid] = new TaskView({model: task});
		},
		renderTaskView: function (task) {
			var taskView = this.taskViews[task.cid];
			this.$(".tasks li:last").before(taskView.render().el);
		},
		addTask: function () {
			var $input = this.$("input");
			var name = $input.val();
			if (name) {
				$input.val("");

				var task = new Task({name: name});
				this.collection.add(task);
			}
			return false;
		},
		keypress: function (e) {
	        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
	            this.addTask();
	        }
		}
	});

	var TodoTabView = Backbone.View.extend({
		tagName: "dd",
		elTemplate: $("#todo-tab-tpl").html(),
		render: function () {
			this.$el.append(_.template(this.elTemplate, {
				cid: this.model.cid,
				name: this.model.get("name")
			}));
			return this;
		}
	});

	var Todo = Backbone.Model.extend({
		defaults: {
			name: "Untitled"
		}
	});

	var Todos = Backbone.Collection.extend({
		model: Todo
	});

	var TodosView = Backbone.View.extend({
		initialize: function () {
			_.bindAll(this, "createTodoView", "renderTodoView");
			this.todoViews = {};
			this.collection.each(this.createTodoView);
			this.collection.on("add", this.createTodoView);
			this.collection.on("add", this.renderTodoView);
		},
		render: function () {
			this.collection.each(this.renderTodoView);
			return this;
		},
		createTodoView: function (todo) {
			this.todoViews[todo.cid] = {
				tab: new TodoTabView({
					model: todo
				}),
				tasks: new TaskListView({
					model: todo,
					collection: new TaskList()
				})
			}
		},
		renderTodoView: function (todo) {
			var todoView = this.todoViews[todo.cid];
			this.$(".tabs").append(todoView.tab.render().el);
			this.$(".tabs-content").append(todoView.tasks.render().el);
			TODOS.util.activateTab(todoView.tab.$el);
		},
		addTodo: function (name) {
			var todo = new Todo({name: name});
			this.collection.add(todo);
		}
	});

	var todos = new Todos();
	var todosView = new TodosView({
		el: "#tabsWrapper",
		collection: todos
	});

	return todosView.render();

};

$(function() {
	var todos = new TODOS.App();
	todos.addTodo("test");
	todos.addTodo("bob");

	$('dl.tabs dd a').on('click.fndtn', function (event) {
		TODOS.util.activateTab($(this).parent('dd'));
	});

	if (window.location.hash) {
		TODOS.util.activateTab($('a[href="' + window.location.hash + '"]').parent());
		$.foundation.customForms.appendCustomMarkup();
	}

	/* PLACEHOLDER FOR FORMS ------------- */
	/* Remove this and jquery.placeholder.min.js if you don't need :) */
	$('input, textarea').placeholder();

});
