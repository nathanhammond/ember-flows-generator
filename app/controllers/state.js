export default Ember.Controller.extend({
  flipped: false,
  code: "Ember.Object.extend();",

  actions: {
    flip: function() {
      this.toggleProperty('flipped');
    }
  }
})
