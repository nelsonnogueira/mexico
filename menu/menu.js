(function () {
	// General configuration options
	var config = {
		"currency": "£",
		"courseName": "<h2>{{courseName}}</h2>",
		"dishName": "<span class=\"dish\" data-course-name=\"{{courseName}}\" data-dish-name=\"{{dishName}}\" \
			data-dish-price=\"{{price}}\" data-dish-stock=\"{{stock}}\">{{dishName}} - {{displayPrice}}</span>",
		"dinerName": "<h1>{{dinerName}}</h1>",
		"bill": "Total bill amount: {{total}}",
		"error": "<li>{{error}}</li>"
	}

	/*
	 * @constructor
	 * @name Diner
	 */
	var Diner = function (name) {
		this.name = name;
		this.selection = [];
	}
	Diner.prototype = (function () {
		return {
			constructor: Diner,

			getSelection: function () {
				return this.selection;
			},

			add: function (dish) {
				this.selection[dish.name] = dish;
			},

			remove: function (dish) {
				delete this.selection[dish.name];
			},

			getId: function () {
				return this.name.toLowerCase().replace(/ /g, '-');
			},

			clearErrors: function (errors) {
				document.getElementById(this.getId() + "-errors").innerHTML = "";
			},

			appendErrors: function (errors) {
				document.getElementById(this.getId() + "-errors").innerHTML += errors;
			}
		}
	})();

	/*
	 * @constructor
	 * @name Menu
	 */
	this.Menu = function () {
		this.diners = [new Diner('Diner 1'), new Diner('Diner 2')];

		this.render();
	}
	this.Menu.prototype = (function () {
		// The list of available courses
		var courses = [{
			"name": "Starters",
			"dishes": [{
				"name": "Soup of the day",
				"price": 3
			}, {
				"name": "Pâté",
				"price": 5
			}, {
				"name": "Bruschetta",
				"price": 4.5
			}, {
				"name": "Prawn cocktail",
				"price": 6
			}]
		}, {
			"name": "Main Course",
			"dishes": [{
				"name": "Steak",
				"price": 18
			}, {
				"name": "Meatballs",
				"price": 11.5
			}, {
				"name": "Salmon fillet",
				"price": 14
			}, {
				"name": "Vegetarian lasagna",
				"price": 12
			}]
		}, {
			"name": "Desserts",
			"dishes": [{
				"name": "Sticky toffee pudding",
				"price": 4
			}, {
				"name": "Tiramisu",
				"price": 4.5
			}, {
				"name": "Cheesecake",
				"price": 4,
				"stock": 1
			}, {
				"name": "Ice cream",
				"price": 3.5
			}]
		}]

		// Validation rules
		var rules = {
			"minCourses": 2,
			"maxDishesPerCourse": 1,
			"excludedCombinations": [
				["Prawn cocktail", "Salmon fillet"]
			]
		}

		var validateMinCourses = function (diner) {
			var courses = {};
			var numCourses = 0;
			var dinerSelection = diner.getSelection();

			for (var i in dinerSelection) {
				var course = dinerSelection[i].course;

				if (typeof courses[course] === "undefined") {
					courses[course] = 1;
					numCourses++;
				}
			}

			if (numCourses >= rules.minCourses) {
				return true;
			} else {
				diner.appendErrors(config.error
					.replace("{{error}}", "Diner '" + diner.name + "': Please select at least " + rules.minCourses + " course(s)."));

				return false;
			}
		}

		var validateMaxDishesPerCourse = function (diner, course) {
			var courses = {};
			var dinerSelection = diner.getSelection();

			for (var item in dinerSelection) {
				var course = dinerSelection[item].course;

				if (typeof courses[course] === "undefined") {
					courses[course] = 1;
				} else {
					courses[course]++;

					if (courses[course] > rules.maxDishesPerCourse) {
						diner.appendErrors(config.error
							.replace("{{error}}", "Diner '" + diner.name + "': You may only select " + rules.maxDishesPerCourse + " dish(es) per course."));

						return false;
					} else {
						courses[course]++;
					}
				}
			}

			return true;
		}

		var validateQuantity = function (dishData, diner) {
			// TODO

			return false;
		}

		var validateExcludedCombinations = function (diner) {
			// TODO

			return false;
		}

		return {
			constructor: this.Menu,

			render: function () {
				var output = "";

				for (var i in courses) {
					var course = courses[i];

					output += config.courseName
						.replace("{{courseName}}", course.name);

					for (var j in course.dishes) {
						var dish = course.dishes[j];

						output += config.dishName
							.replace(/{{dishName}}/g, dish.name)
							.replace("{{courseName}}", course.name)
							.replace("{{price}}", dish.price)
							.replace("{{displayPrice}}", config.currency + dish.price)
							.replace("{{stock}}", dish.stock);
					}
				}

				for (var person in this.diners) {
					var diner = this.diners[person];
					var id = diner.getId();

					document.getElementById(id).innerHTML = config.dinerName.replace('{{dinerName}}', diner.name + output);
				}

				this.hookEvents();
			},

			hookEvents: function () {
				var self = this;

				for (var i = 0, iLength = this.diners.length; i < iLength; i++) {
					var diner = this.diners[i];
					var id = diner.getId();

					var elements = document.getElementById(id).childNodes;

					for (var j = 0, jLength = elements.length; j < jLength; j++) {
						if (elements[j].className === 'dish') {
							elements[j].onclick = (function (e) {
								var currentDiner = diner;

								return function () {
									self.toggleSelection(this, currentDiner);
								}
							})();
						}
					}
				}
			},

			toggleSelection: function (dish, diner) {
				diner.clearErrors();

				var success = false;
				var dishData = {
					"name": dish.getAttribute("data-dish-name"),
					"course": dish.getAttribute("data-course-name"),
					"price": dish.getAttribute("data-dish-price"),
					"quantity": dish.getAttribute("data-dish-stock") === 'undefined' ? -1 : dish.getAttribute("data-dish-stock")
				}

				if (dish.className.indexOf("selected") === -1) {
					diner.add(dishData);
					dish.className = dish.className + " selected";
				} else {
					diner.remove(dishData);
					dish.className = dish.className.replace(" selected", "");
				}

                // Run validations
				validateMinCourses(diner);
				validateMaxDishesPerCourse(diner, dishData.course);
				validateQuantity(dishData, diner);
				validateExcludedCombinations(diner);

                document.getElementById("bill").innerHTML =
                    config.bill.replace("{{total}}", config.currency + this.calculateTotal().toString());
            },

            calculateTotal: function () {
                var total = 0;

                for (var person in this.diners) {
                    var diner = this.diners[person];
                    var dinerSelection = diner.getSelection();

                    for (var selection in dinerSelection) {
                        var dish = dinerSelection[selection];

                        total += parseInt(dish.price);
                    }
                }

                return total;
            }
		}
	})();

	this.myMenu = new Menu();
})();