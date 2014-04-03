export default Ember.Controller.extend({
  stateFlipped: false,
  routerFlipped: false,

  stateCode: 'Ember.Object.extend();',
  routerCode: 'Router.map(function() {});',

  actions: {
    flipState: function() {
      this.toggleProperty('stateFlipped');
    },
    flipRouter: function() {
      this.toggleProperty('routerFlipped');
    }
  }
})
