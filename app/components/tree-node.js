export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['tree-node'],
  classNameBindings: ['focused'],

  dragging: false,

  dragproxy: function() {
    var dragproxy = document.createElement('div');
    dragproxy.className = 'dragproxy'
    dragproxy.innerHTML = this.get('node.value.name');
    return dragproxy;
  }.property(),

  // node: undefined,
  // currentNode: undefined,

  focused: function() {
    return this.get('currentNode') == this.get('node');
  }.property('currentNode'),

  actions: {
    focus: function(node) {
      this.sendAction('focus', node);
    }
  },

  mouseDown: function(e) {
    if (e.target !== this.$('> .target')[0]) { return; }

    e.preventDefault();

    var dragproxy = this.get('dragproxy');

    document.body.appendChild(dragproxy);
    var dims = dragproxy.getBoundingClientRect();

    var mouseMoveHandler = function(e) {
      e.preventDefault();

      this.set('dragging', true);
      document.body.classList.add('dragging');

      dragproxy.style.top = e.pageY - (dims.height/2) + 'px';
      dragproxy.style.left = e.pageX - (dims.width/2) + 'px';
    }.bind(this);

    var mouseUpHandler = function(e) {
      e.preventDefault();
      document.body.removeEventListener('mousemove', mouseMoveHandler);
      document.body.removeEventListener('mouseup', mouseUpHandler);
      document.body.classList.remove('dragging');


      // Clean up
      document.body.removeChild(dragproxy);
      dragproxy.style.top = '';
      dragproxy.style.left = '';

      this.set('dragging', false);
    }.bind(this);

    document.body.addEventListener('mousemove', mouseMoveHandler);
    document.body.addEventListener('mouseup', mouseUpHandler);
  }
});
