export default Ember.View.extend({
  classNames: ['application'],
  classNameBindings: ['resizing', 'resizingDimension'],

  resizing: false,
  resizingDimension: undefined,
  resizingElem: undefined,

  mouseDown: function(e) {
    if (e.target.classList.contains('resize')) {
      e.preventDefault();
      e.target.classList.add('active');

      this.set('resizing', true);
      this.set('resizingDimension', e.target.parentNode.classList.contains('workspace') ? 'height' : 'width');
      this.set('resizingElem', e.target);
    }
  },
  mouseMove: function(e) {
    if (this.get('resizing')) {
      e.preventDefault();

      var dimension = this.get('resizingDimension'),
          measure, cursor;

      if (dimension == 'width') {
        measure = "right";
        cursor = e.pageX;
      } else {
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
    if (this.get('resizing')) {
      var elem = this.get('resizingElem');

      var dimension = this.get('resizingDimension');

      var sections = [].slice.call(elem.parentNode.childNodes).filter(function(element) {
        return element.nodeType === Node.ELEMENT_NODE && element.tagName.toLowerCase() === 'section';
      });
      var dimensions = [];

      sections.forEach(function(section) {
        dimensions.push(section.getBoundingClientRect()[dimension]);
      });
      sections.forEach(function(section, index) {
        section.style[dimension] = dimensions[index] + 'px';
      });

      elem.classList.remove('active');
      this.set('resizing', false);
      this.set('resizingDimension', undefined);
      this.set('resizingElem', undefined);
    }

    // FIXME: Recalculate on window resize.
  }
});
