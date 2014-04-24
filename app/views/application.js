export default Ember.View.extend({
  classNames: ['application'],

  resizing: false,

  mouseDown: function(e) {
    if (!e.target.classList.contains('resize')) { return; }

    e.preventDefault();
    this.set('resizing', true);

    var elem = e.target;
    var dimension = elem.classList.contains('horizontal') ? 'width' : 'height';
    elem.classList.add('active');
    document.body.classList.add('resizing', 'resizing-'+dimension);

    var mouseMoveHandler = function(e) {
      e.preventDefault();

      var measure, cursor;

      if (dimension == 'width') {
        measure = "right";
        cursor = e.pageX;
      } else {
        measure = "bottom";
        cursor = e.pageY;
      }

      var previous = elem.previousElementSibling;
      var next = elem.nextElementSibling;

      var previousrect = previous.getBoundingClientRect();
      var nextrect = next.getBoundingClientRect();

      var newpreviousdimension = previousrect[dimension] - (previousrect[measure] - cursor);
      var newnextdimension = nextrect[dimension] + (previousrect[measure] - cursor);

      previous.style[dimension] = newpreviousdimension + 'px';
      next.style[dimension] = newnextdimension + 'px';
    }.bind(this);

    var mouseUpHandler = function(e) {
      e.preventDefault();

      document.body.removeEventListener('mousemove', mouseMoveHandler);
      document.body.removeEventListener('mouseup', mouseUpHandler);

      var sections = [].slice.call(elem.parentNode.childNodes).filter(function(element) {
        return element.nodeType === Node.ELEMENT_NODE && element.tagName.toLowerCase() === 'section';
      });
      var dimensions = [];

      sections.forEach(function(section) {
        dimensions.push(section.getBoundingClientRect()[dimension]);
      });
      var sum = dimensions.reduce(function(a, b) { return a + b; });
      var cumulative = 0;
      sections.forEach(function(section, index) {
        if (index === dimensions.length - 1) {
          section.style[dimension] = (100 - cumulative) + '%';
        } else {
          cumulative += dimensions[index]/sum*100;
          section.style[dimension] = (dimensions[index]/sum*100) + '%';
        }
      });

      elem.classList.remove('active');
      document.body.classList.remove('resizing', 'resizing-'+dimension);

      this.set('resizing', false);
    }.bind(this);

    document.body.addEventListener('mousemove', mouseMoveHandler);
    document.body.addEventListener('mouseup', mouseUpHandler);
  }
});
