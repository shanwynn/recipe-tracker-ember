App = Ember.Application.create({
  LOG_TRANSITIONS: true
});

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
	firebase: new Firebase('https://dazzling-torch-1926.firebaseio.com')
});

App.Router.map(function() {
  this.route ('recipe', {path: 'recipes/:id'});
  this.route ('edit_recipe', {path: 'recipes/:id/edit'});
  this.route ('new_recipe', {path: 'recipes/new'});
});

App.Recipe = DS.Model.extend({
  name:        DS.attr('string'),
  imageURL:    DS.attr('string'),
  ingredients: DS.attr('string'),
  directions:  DS.attr('string')
});

App.IndexRoute = Ember.Route.extend({
  model: function() {
    return this.store.find('recipe');
  }
});

App.RecipeRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('recipe', params.id);
  }
});

App.EditRecipeRoute = Ember.Route.extend({
  model: function(params) {
    return this.store.find('recipe', params.id);
  }
});

App.EditRecipeController = Ember.ObjectController.extend({
  actions: {
    update: function () {
      this.model.save();
      this.transitionToRoute('recipe', this.get('id'));
    }
  }
});

App.RecipeController = Ember.ObjectController.extend({
  splitDirections: function () {
    return this.get('directions').split(',');
  }.property('directions'),

  splitIngredients: function () {
    return this.get('ingredients').split(',');
  }.property('ingredients'),

  actions: {
    destroy: function () {
      this.get('model').deleteRecord();
      this.get('model').save();
      this.transitionToRoute('index');
    }
  }
});

App.NewRecipeController = Ember.ArrayController.extend({
  actions: {
    save: function() {
      var recipe = this.store.createRecord('recipe', {
        name:        this.get('name'),
        imageURL:    this.get('imageURL'),
        ingredients: this.get('ingredients'),
        directions:  this.get('directions')
      });
      recipe.save();
      this.transitionToRoute('index');
    }
  }
});
