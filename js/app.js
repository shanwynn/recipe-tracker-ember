App = Ember.Application.create();

App.Router.map(function() {
  this.route ('recipe', {path: 'recipes/:id'});
  this.route ('edit_recipe', {path: 'recipes/:id/edit'});
});

var RECIPES = [{
  id: 1,
  name: 'name',
  imageURL: 'imgURL',
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
    return RECIPES.find(function(recipe){
      return recipe.id === params.id;
    });
  }
});

App.EditRecipeRoute = Ember.Route.extend({
  model: function(params) {
    return RECIPES.find(function(recipe){
      return recipe.id === params.id;
    });
  }
});
