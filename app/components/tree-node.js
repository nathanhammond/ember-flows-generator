export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['tree-node'],
  classNameBindings: ['focused'],

  dragging: false,

  dragproxy: function() {
    var name = this.get('node.value.name');
    var splits = name.split(/([\.\_\-]{1})/);
    splits = splits.map(function(item) { return "<tspan>" + item + "</tspan>"; });

    var dragproxy = document.createElement('svg');
    dragproxy.setAttribute("version", "1.1");
    dragproxy.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    dragproxy.className = 'dragproxy';

    dragproxy.innerHTML = "<text>"+ splits.join('') +"</text>"

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

      var x = e.pageX - (dims.width/2) + 'px';
      var y = e.pageY - (dims.height/2) + 'px'

      dragproxy.style.webkitTransform = "translate("+x+", "+y+")";
      dragproxy.style.transform = "translate("+x+", "+y+")";
    }.bind(this);

    var mouseUpHandler = function(e) {
      e.preventDefault();
      document.body.removeEventListener('mousemove', mouseMoveHandler);
      document.body.removeEventListener('mouseup', mouseUpHandler);
      document.body.classList.remove('dragging');


      // Clean up
      document.body.removeChild(dragproxy);
      dragproxy.style.webkitTransform = '';
      dragproxy.style.transform = '';

      this.set('dragging', false);
    }.bind(this);

    document.body.addEventListener('mousemove', mouseMoveHandler);
    document.body.addEventListener('mouseup', mouseUpHandler);
  }
});
