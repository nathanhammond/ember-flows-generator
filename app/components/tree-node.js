export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['tree-node'],
  classNameBindings: ['focused'],

  dragging: false,

  getBaselineRatio: function() {
    var container = document.createElement('div');
    var small = document.createElement('span');
    var large = document.createElement('span');

    container.style.visibility = "hidden";
    small.style.fontSize = "0px";
    large.style.fontSize = "1800px";

    small.innerHTML = "X";
    large.innerHTML = "X";

    container.appendChild(small);
    container.appendChild(large);

    document.body.appendChild(container);
    var smalldims = small.getBoundingClientRect();
    var largedims = large.getBoundingClientRect();
    var baselineposition = smalldims.top - largedims.top;
    var height = largedims.height;
    document.body.removeChild(container);

    return 1 - (baselineposition / height);
  },

  dragproxy: function() {
    var minradius = 40;
    var radiuspadding = 5;

    var svgnamespace = 'http://www.w3.org/2000/svg';
    var name = this.get('node.value.name');
    var splits = name.split(/([\.\_\-]{1})/);
    splits = splits.map(function(item) { return '<tspan style="text-anchor: middle;">' + item + "</tspan>"; });

    var dragproxy = document.createElementNS(svgnamespace, "svg");
    dragproxy.setAttribute("version", "1.1");
    dragproxy.setAttribute('class', 'dragproxy');

    var circle = document.createElementNS(svgnamespace, 'circle');
    circle.setAttribute('fill', 'green');

    var text = document.createElementNS(svgnamespace, 'text');
    text.innerHTML = splits.join('');

    // Much easier than instantiating them individually. :)
    var tspans = [].slice.call(text.getElementsByTagName('tspan'));

    dragproxy.appendChild(circle);
    dragproxy.appendChild(text);

    document.body.appendChild(dragproxy);

    /* Now that it's real, let's do some calculations on it to lay it out correctly. */
    var absoluteminheight = tspans[0].getBoundingClientRect().height;
    var absolutemaxheight = absoluteminheight * tspans.length;

    var absolutemaxwidth = text.getBoundingClientRect().width;
    var absoluteminwidth = tspans.reduce(function(previousmin, elem) {
      return Math.min(previousmin, elem.getBoundingClientRect().width);
    }, absolutemaxwidth);

    var baselineshift = this.getBaselineRatio() * absoluteminheight;

    var radius, numrows;
    if (tspans.length === 1) {
      // Account for the fact that the tspan is rectangular, not linear.
      var a = absolutemaxwidth / 2;
      var b = absolutemaxheight / 2;
      radius = Math.sqrt(a*a+b*b);
      numrows = 1;
    } else {
      // FIXME: Make this actually search through the space.
      // FIXME: Account for the fact that the tspan is rectangular, not linear.
      var searchrange = {
        min: Math.min(absoluteminwidth, absoluteminheight),
        max: Math.max(absolutemaxwidth, absolutemaxheight)
      }

      var a = absolutemaxwidth / 2;
      var b = absolutemaxheight / 2;
      radius = Math.sqrt(a*a+b*b);
      numrows = 1;
    }

    if (radius + radiuspadding > minradius) {
      // Add the padding at the right scale.
      radius += radiuspadding * radius / minradius;
    } else {
      // Enforce the minimum radius.
      radius = minradius;
    }

    // Vertically centering the tspans in the circle means knowing how tall they are.
    var topspace = ((radius * 2) - (numrows * absoluteminheight))/2;

    circle.setAttribute('cx', radius);
    circle.setAttribute('cy', radius);
    circle.setAttribute('r', radius);
    text.setAttribute('x', 0);
    text.setAttribute('y', topspace + absoluteminheight - baselineshift);

    tspans.forEach(function(tspan, index) {
      tspan.setAttribute('x', radius);
      if (index) {
        tspan.setAttribute('dy', absoluteminheight);
      }
    });

    document.body.removeChild(dragproxy);

    dragproxy.setAttribute('width', (radius*2)+'px');
    dragproxy.setAttribute('height', (radius*2)+'px')
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
