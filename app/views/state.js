export default Ember.View.extend({
  tagName: 'section',
  classNames: ['state'],
  classNameBindings: ['flipped'],

  flipped: Ember.computed.alias('controller.flipped')
});
