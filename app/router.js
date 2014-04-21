var Router = Ember.Router.extend({
  rootURL: ENV.rootURL,
  location: 'hash'
});

Router.map(function() {
  this.route('state');
  this.route('stepper');
  this.route('router');
  this.route('canvas');
  this.route('details');
});

export default Router;
