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
		elTemplate: $("#task-tpl").html(),
		events: {
			"mouseover": "mouseover",
			"mouseleave": "mouseleave",
			"click": "toggleCheck",
			"click .close": "close"
		},
		render: function () {
			this.$el.append(_.template(this.elTemplate, {
				cid: this.model.cid,
				name: this.model.get("name")
			}));
			return this;
		},
		mouseover: function (e) {
			this.$(".close").show();
		},
		mouseleave: function (e) {
			this.$(".close").hide();
		},
		close: function (e) {
			this.model.collection.remove(this.model);
			return false;
		},
		toggleCheck: function (e) {
			var completed = this.model.get("completed");
			if (completed) {
				this.model.set("completed", false);
				this.$(".taskName").removeClass("completed");
			} else {
				this.model.set("completed", true);
				this.$(".taskName").addClass("completed");
			}
		}
	});

	var TaskList = Backbone.Collection.extend({
		model: Task
	});

	var TaskListView = Backbone.View.extend({
		tagName: "li",
		elTemplate: "#task-list-tpl",
		emptyTemplate: "#task-list-empty-tpl",
		statusTemplate: "#task-list-status-tpl",
		events: {
			"click .button": "addTask",
			"keypress input[type='text']": "keypress"
		},
		initialize: function () {
			var $elTemplate = $(this.elTemplate),
				$emptyTemplate = $(this.emptyTemplate),
				$statusTemplate = $(this.statusTemplate);
			this.elTemplate = _.template($elTemplate.html());
			this.emptyTemplate = _.template($emptyTemplate.html());
			this.statusTemplate = _.template($statusTemplate.html());
			$elTemplate.remove();
			$emptyTemplate.remove();
			$statusTemplate.remove();

			_.bindAll(this, "createTaskView", "renderTaskView", "removeTask", "taskChange");
			this.$el.attr("id", this.model.cid + "Tab");
			this.taskViews = {};
			this.collection.each(this.createTaskView);
			this.collection.on("add", this.createTaskView);
			this.collection.on("add", this.renderTaskView);
			this.collection.on("remove", this.removeTask);
			this.collection.on("change:completed", this.taskChange);
		},
		render: function () {
			this.$el.append(this.elTemplate);
			this.collection.each(this.renderTaskView);
			if (this.isEmpty()) {
				this.$(".tasks").append(this.emptyTemplate);
			}
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
				if (this.isEmpty()) {
					this.$(".empty").remove();
					this.$(".tasks").append(this.statusTemplate);
				}
				$input.val("");
				var task = new Task({name: name});
				this.collection.add(task);
				this.changeStatus("plus");
			}
			return false;
		},
		removeTask: function (task) {
			var taskView = this.taskViews[task.cid];
			taskView.unbind();
			taskView.remove();
			if (this.isEmpty()) {
				this.$(".status").remove();
				this.$(".tasks").append(this.emptyTemplate);
			}
			this.changeStatus("minus");
		},
		keypress: function (e) {
	        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
	            this.addTask();
	        }
		},
		taskChange: function (task) {
			if (task.get("completed")) {
				this.changeStatus("minus");
			} else {
				this.changeStatus("plus");
			}
		},
		isEmpty: function () {
			return this.collection.length == 0;
		},
		changeStatus: function (action) {
			var $status = this.$(".status"),
				$count = $status.find(".count"),
				count = parseInt($count.html()),
				$grammar = $status.find(".grammar");
			if (action == "plus") {
				count += 1;
				$count.empty().html(count);
			} else if (action == "minus") {
				count -= 1;

			}
			if (count != 1 && $grammar.html() != "tasks") {
				$grammar.empty().html("tasks");
			} else if (count == 1 && $grammar.html() != "task"){
				$grammar.empty().html("task");
			}
			$count.empty().html(count);
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
	todos.addTodo("Todo List");

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
