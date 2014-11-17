App = Ember.Application.create();

Recipes.ApplicationAdapter = DS.LSAdapter.extend({
  namespace: 'recipes-emberjs'
});

App.Router.map(function() {
  this.route ('recipe', {path: 'recipes/:id'});
  this.route ('edit_recipe', {path: 'recipes/:id/edit'});
  this.route ('add_recipe', {path: 'recipes/add'});
  this.route ('delete_recipe', {path: 'recipes/:id/delete'})
});

Recipes.Recipe = DS.Model.extend({
  name: DS.attr('string'),
  imageURL: DS.attr('img'),
  ingredients: DS.attr('string'),
  directions: DS.attr('string')
});

var RECIPES = [{
  id: 1,
  name: 'Bacon',
  imageURL: 'http://img2.wikia.nocookie.net/__cb20110624171559/bacon/images/5/5f/Crispy_bacon_1-1-.jpg',
  ingredients: ['bacon'],
  directions: ['Cook it']
}];

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return RECIPES;
  }
});

App.RecipeRoute = Ember.Route.extend({
  model: function(params) {
    return RECIPES.findBy('id', Number(params.id));
  }
});

App.EditRecipeRoute = Ember.Route.extend({
  model: function(params) {
    return RECIPES.findBy('id', Number(params.id));
  }
});

App.DeleteRecipeRoute = Ember.Route.extend({
  model: function(params) {
    return RECIPES.findBy('id', Number(params.id));
  }
});

App.AddRecipeRoute = Ember.Route.extend({
  model: function() {
    return RECIPES;
  }
});

App.IndexController = Ember.Controller.extend({
  submitAction: function() {

  }
});
