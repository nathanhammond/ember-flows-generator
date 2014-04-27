import Resolver from 'ember/resolver';
import loadInitializers from 'ember/load-initializers';

Ember.MODEL_FACTORY_INJECTIONS = true;

var App = Ember.Application.extend({
  modulePrefix: 'ember-flows-generator',
  Resolver: Resolver
});

loadInitializers(App, 'ember-flows-generator');

export default App;
