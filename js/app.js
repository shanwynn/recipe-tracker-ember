App = Ember.Application.create({
  LOG_TRANSITIONS: true
});

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
	firebase: new Firebase('https://dazzling-torch-1926.firebaseio.com')
});

App.CATEGORIES = [
  { id: '1', name: 'Main Dish'},
  { id: '2', name: 'Side Dish'},
  { id: '3', name: 'Bread'},
  { id: '4', name: 'Dessert'}
];

App.Router.map(function() {
  this.route ('recipe', {path: 'recipes/:id'});
  this.route ('edit_recipe', {path: 'recipes/:id/edit'});
  this.route ('new_recipe', {path: 'recipes/new'});
  this.route ('ingredients', {path: 'ingredients'});
  this.route ('ingredient', {path: 'ingredients/:id'});
  this.route ('new_ingredient', {path: 'ingredients/new'});
  this.route ('category', {path: 'recipes'});
});

App.Recipe = DS.Model.extend({
  name:        DS.attr('string'),
  description: DS.attr('string'),
  category:    DS.attr('string'),
  imageURL:    DS.attr('string'),
  ingredients: DS.attr('string'),
  directions:  DS.attr('string')
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('recipe');
  }
});

App.NewRecipeController = Ember.Controller.extend({
  actions: {
    save: function() {
      var recipe = this.store.createRecord('recipe', {
        name:        this.get('name'),
        description: this.get('description'),
        imageURL:    this.get('imageURL'),
        ingredients: this.get('ingredients'),
        directions:  this.get('directions')
      });
      recipe.save();
      this.transitionToRoute('index');
    }
  }
});

App.RecipeRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('recipe', params.id);
  }
});

App.RecipeController = Ember.ObjectController.extend({
  ingredientCount: Ember.computed.alias('splitIngredients.length'),
  directionCount: Ember.computed.alias('splitDirections.length'),

  showIngredients: true,
  showDirections: true,

  splitDirections: function () {
    return this.get('directions').split(',');
  }.property('directions'),

  splitIngredients: function () {
    return this.get('ingredients').split(',');
  }.property('ingredients'),

  markedDescription: function () {
    return marked(this.get('description') || '');
  }.property('description'),

  categoryName: function () {
    var category = App.CATEGORIES.findBy('id', this.get('category'));
    if (category)
      return category.name;
  }.property('category'),

  actions: {
    toggleDirections: function() {
      this.toggleProperty('showDirections');
    },
    toggleIngredients: function () {
      this.toggleProperty('showIngredients');
    },
    destroy: function () {
      if (confirm('Are you sure you want to delete this recipe?')) {
      this.get('model').deleteRecord();
      this.get('model').save();
      this.transitionToRoute('index');
      }
    }
  }
});

App.EditRecipeRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('recipe', params.id);
  }
});

App.EditRecipeController = Ember.ObjectController.extend({
  markedDescription: function () {
    return marked(this.get('description') || '');
  }.property('description'),

  actions: {
    update: function () {
      this.model.save();
      this.transitionToRoute('recipe', this.get('id'));
    }
  }
});

App.CategoryRoute = Ember.Route.extend({
  model: function (params) {
    return this.store.find('recipe');
  }
});

App.CategoryController = Ember.ArrayController.extend({
  queryParams: ['category'],
  category: null,

  moreThanOne: function () {
    return this.get('filteredRecipes').length > 1;
  }.property('filteredRecipes'),

  filteredRecipes: function () {
    var category = this.get('category');
    var recipes = this.get('model');

    if (category && category !== 'all') {
      return recipes.filterBy('category', category);
    }else{
      return recipes;
    }
  }.property('category', 'model')
});

/*
App.Ingredient = DS.Model.extend({
  item:        DS.attr('string'),
  description: DS.attr('string'),
  imageURL:    DS.attr('string'),
});

App.IngredientRoute = Ember.Route.extend({
  model: function (params) {
    return this.store.find('ingredient', params.id);
  }
});

App.IngredientsRoute = Ember.Route.extend({
  model: function () {
    return this.store.find('ingredient');
  }
});

App.IngredientController = Ember.ObjectController.extend({
  actions: {
    destroy: function () {
      this.get('model').deleteRecord();
      this.get('model').save();
      this.transitionToRoute('index');
    }
  }
});

App.NewIngredientController = Ember.Controller.extend({
  actions: {
    save: function () {
      var ingredient = this.store.createRecord('ingredient', {
        item:        this.get('item'),
        description: this.get('description'),
        imageURL:    this.get('imageURL'),
      });
      ingredient.save();
      this.transitionToRoute('ingredients');
    }
  }
});
*/
App.NewRecipeIndexRoute = App.Route.extend({
    model: function () {
        return this.store.find('ingredient');
    }
});
