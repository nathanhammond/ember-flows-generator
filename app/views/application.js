export default Ember.View.extend({
  classNames: ['application'],

  resizing: false,
  resizingDirection: undefined,
  resizingElem: undefined,

  mouseDown: function(e) {
    if (e.target.classList.contains('resize')) {
      e.preventDefault();
      this.set('resizing', true);
      this.set('resizingDirection', e.target.parentNode.classList.contains('workspace') ? 'row' : 'column');
      this.set('resizingElem', e.target);
    }
  },
  mouseMove: function(e) {
    if (this.get('resizing')) {
      e.preventDefault();

      var dimension, measure, cursor;
      if (this.get('resizingDirection') == 'column') {
        dimension = "width";
        measure = "right";
        cursor = e.pageX;
      } else {
        dimension = "height";
        measure = "bottom";
        cursor = e.pageY;
      }

      var elem = this.get('resizingElem');
      var previous = elem.previousElementSibling;
      var next = elem.nextElementSibling;

      var previousrect = previous.getBoundingClientRect();
      var nextrect = next.getBoundingClientRect();

      var newpreviousdimension = previousrect[dimension] - (previousrect[measure] - cursor);
      var newnextdimension = nextrect[dimension] + (previousrect[measure] - cursor);

      previous.style[dimension] = newpreviousdimension + 'px';
      next.style[dimension] = newnextdimension + 'px';
    }
  },
  mouseUp: function(e) {
    this.set('resizing', false);
  }
});
