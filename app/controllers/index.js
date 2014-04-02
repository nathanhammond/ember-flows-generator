export default Ember.Controller.extend({
  stateFlipped: false,
  routerFlipped: false,

  actions: {
    flipState: function() {
      this.toggleProperty('stateFlipped');
    },
    flipRouter: function() {
      this.toggleProperty('routerFlipped');
    }
  }
})
