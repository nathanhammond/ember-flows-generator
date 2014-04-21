export default Ember.Component.extend({
  tagName: 'li',
  classNameBindings: ['focused'],

  // node: undefined,
  // currentNode: undefined,

  focused: function() {
    return this.get('currentNode') == this.get('node');
  }.property('currentNode'),

  actions: {
    focus: function(node) {
      this.sendAction('focus', node);
    }
  }
});
