export default Ember.View.extend({
  tagName: 'section',
  classNames: ['router'],
  classNameBindings: ['flipped'],

  flipped: Ember.computed.alias('controller.flipped')
});
