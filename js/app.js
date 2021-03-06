App = Ember.Application.create({
  LOG_TRANSITIONS: true
});
App.Firebase = new Firebase('https://dazzling-torch-1926.firebaseio.com');

App.ApplicationAdapter = DS.FirebaseAdapter.extend({
	firebase: App.Firebase
});

App.ApplicationController = Ember.Controller.extend({
    // used to show, or not show, the log out button
    isLoggedIn: false,
    // when a user enters the app unauthenticated, the transition
    // to where they are going is saved off so it can be retried
    // when they have logged in.
    savedTransition: null,

    login: function() {
      this.setProperties({ savedTransition: null, isLoggedIn: true });
    },

    logout: function() {
      this.set('isLoggedIn', false);
    }
});

App.ApplicationRoute = Ember.Route.extend({
  beforeModel: function(transition) {
    var applicationController = this.controllerFor('application');
    if (localStorage.authToken) {
      this.controllerFor('application').login();
    } else {
      this.controllerFor('application').logout();
    }
  },
  actions: {
    logout: function() {
      this.controllerFor('application').logout();
      delete localStorage.authToken;
      this.transitionTo('login');
    }
  }
});

App.AuthenticatedRoute = Ember.Route.extend({
  beforeModel: function(transition) {
    var applicationController = this.controllerFor('application');
    if (localStorage.authToken !== App.Firebase.getAuth().token) {//Yay! actual verification
      applicationController.set('savedTransition', transition);
      this.transitionTo('login');
    } else {
      this.controllerFor('application').login();
    }
  }
});

App.LoginRoute = Ember.Route.extend({
    actions: {
        login: function () {
            var loginController = this.controllerFor('login');
            var username = loginController.get('username');
            var password = loginController.get('password');
            var that = this;
            App.Firebase.authWithPassword({
                email: username,
                password: password
            }, function (error, authData) {
                console.log(authData);
                if (authData) {
                    localStorage.authToken = authData.token;
                    that.transitionTo('index');
                } else {
                    console.warn(error);
                    loginController.set('error', error.message);
                }
            });
        }
    }
});

App.CATEGORIES = [
  { id: '1', name: 'Main Dish'},
  { id: '2', name: 'Side Dish'},
  { id: '3', name: 'Bread'},
  { id: '4', name: 'Dessert'}
];

App.RecipeFormComponent = Ember.Component.extend({
  markedDescription: function () {
    return marked((this.get('recipe.description')) || '');
  }.property('recipe.description')
});

App.Router.map(function() {
  this.route ('recipe', {path: 'recipes/:id'}, function () {
    this.route('new_comment');
  });
  this.route ('edit_recipe', {path: 'recipes/:id/edit'});
  this.route ('new_recipe', {path: 'recipes/new'});
  this.route ('category', {path: 'categories'});
  this.route ('login', {path: 'login'});
});

App.Recipe = DS.Model.extend({
  name:        DS.attr('string'),
  description: DS.attr('string'),

  markedDescription: function () {
    return marked(this.get('description') || '');
  }.property('description'),

  category:    DS.attr('string'),
  imageURL:    DS.attr('string'),
  ingredients: DS.attr('string'),
  directions:  DS.attr('string'),
  rank:        DS.attr('number'),
  comments:    DS.hasMany('comment', {async: true})
});

App.IndexRoute = App.ApplicationRoute.extend({
  model: function() {
    return this.store.find('recipe');
  }
});

App.IndexController = Ember.ArrayController.extend({
  sortProperties: ['rank', 'name'],
  sortAscending: false,
  actions: {
    sortToggle: function (prop) {
      if(prop == 'name') {
        this.set('sortProperties', ['name', 'rank']);
      }else{
        this.set('sortProperties', ['rank', 'name']);
      }
      this.set('sortAscending', !this.get('sortAscending'));
    },
    upvote: function (recipe) {
      recipe.incrementProperty('rank');
      recipe.save();
    },
    downvote: function (recipe) {
      recipe.decrementProperty('rank');
      recipe.save();
    }
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

App.RecipeRoute = App.ApplicationRoute.extend({
  model: function(params) {
    return this.store.find('recipe', params.id);
  }
});

App.RecipeController = Ember.ObjectController.extend({
  needs: ['application'],
  isLoggedIn: Ember.computed.alias ('controllers.application.isLoggedIn'),
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

App.EditRecipeRoute = App.AuthenticatedRoute.extend({
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

App.CategoryRoute = App.ApplicationRoute.extend({
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

App.NewRecipeIndexRoute = App.AuthenticatedRoute.extend({
    model: function () {
        return this.store.find('ingredient');
    }
});

App.Comment = DS.Model.extend({
  name: DS.attr('string'),
  date: DS.attr('string'),
  text: DS.attr('string'),
  markedText: function () {
    return marked(this.get('text') || '');
  }.property('text'),
  recipe: DS.belongsTo('recipe', {async: true})
});

App.RecipeNewCommentController = Ember.ObjectController.extend({
  markedText: function () {
    return marked(this.get('text') || '');
  }.property('text'),

  needs: ['recipe'],
  actions: {
    save: function () {
      if (!this.get('text')) { return;}
      var comment = this.store.createRecord('comment', {
        name: this.get('name'),
        date: (new Date()).toDateString(),
        text: this.get('text')
      });
      comment.save();

      var recipe = this.get('controllers.recipe.model');
      recipe.get('comments').pushObject(comment);
      recipe.save();

      this.transitionToRoute('recipe', recipe.id);
    }
  }
});
