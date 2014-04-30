var permute = (function() {
  function permute(splits, depth, windowsize) {
    windowsize = windowsize || splits.length
    depth = depth || 0;

    // Handle all but the "1" case.
    var results = [];
    for (var i = windowsize; i > 1; i--) {
      var result = process(splits, depth, i);
      results = [].concat(results, result);
    }

    // Handle the "1" case.
    results.push(splits);

    // Flatten things unless it's the first.
    if (results.length === 1 && depth !== 0) {
      results = results[0];
    }

    // FIXME: Guarantee unique values.
    return results;
  }

  function process(splits, depth, windowsize) {
    var shifts = splits.length - windowsize;

    var results = [];

    // We're going to try this once, no matter what.
    for (var offset = 0; offset <= shifts; offset++) {
      var result = {
        before: [],
        current: [],
        after: []
      };

      // If there is space before the sliding window, permute it.
      if (offset !== 0) { result.before = permute(splits.slice(0, offset), depth + 1); }

      // Save the current sliding window every time.
      result.current = [ splits.slice(offset, offset + windowsize) ];

      // If there is space after the sliding window, permute it.
      if (offset + windowsize < splits.length) { result.after = permute(splits.slice(offset + windowsize), depth + 1); }

      // Flatten the results.
      if (result.before.length && result.after.length) {
        for (var beforeoption in result.before) {
          if (!result.before.hasOwnProperty(beforeoption)) { continue; }
          for (var afteroption in result.after) {
            if (!result.after.hasOwnProperty(afteroption)) { continue; }
            results.push([].concat(result.before[beforeoption], result.current, result.after[afteroption]));
          }
        }
      } else if (result.before.length) {
        for (var beforeoption in result.before) {
          if (!result.before.hasOwnProperty(beforeoption)) { continue; }
          results.push([].concat(result.before[beforeoption], result.current));
        }
      } else if (result.after.length) {
        for (var afteroption in result.after) {
          if (!result.after.hasOwnProperty(afteroption)) { continue; }
          results.push([].concat(result.current, result.after[afteroption]));
        }
      } else {
        results.push(result.current);
      }

    }

    return results;
  }

  return permute;
})();

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
    var minradius = 30;
    var radiuspadding = 5;
    var defaultcombinedradius = minradius + radiuspadding;

    var svgnamespace = 'http://www.w3.org/2000/svg';
    var name = this.get('node.value.name');

    var splits = name.split(/([\.\_\-]+)/);

    // Rejoin the leading item with the split character(s).
    for (var i = 1; i < splits.length; i++) {
      splits[i-1] = splits[i-1] + splits[i];
      splits.splice(i, 1);
    }

    var dragproxy = document.createElementNS(svgnamespace, "svg");
    dragproxy.setAttribute("version", "1.1");
    dragproxy.setAttribute('class', 'dragproxy');

    var g = document.createElementNS(svgnamespace, 'g');
    g.setAttribute('id', 'route-'+btoa(name).replace("=","-"));

    var circle = document.createElementNS(svgnamespace, 'circle');
    circle.setAttribute('fill', 'green');

    var text = document.createElementNS(svgnamespace, 'text');

    var tspans = splits.map(function(split) {
      var tspan = document.createElementNS(svgnamespace, 'tspan');
      tspan.style.textAnchor = "middle";
      tspan.appendChild(document.createTextNode(split));
      return tspan;
    });
    tspans.forEach(function(tspan) {
      text.appendChild(tspan);
    });

    dragproxy.appendChild(g);
    g.appendChild(circle);
    g.appendChild(text);

    document.body.appendChild(dragproxy);

    /* Now that it's real, let's do some calculations on it to lay it out correctly. */
    /* Use the text element to work around: https://bugzilla.mozilla.org/show_bug.cgi?id=1002044 */
    var tspanheight = text.getBoundingClientRect().height;
    var baselineshift = this.getBaselineRatio() * tspanheight;

    // Workaround for Firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=1001804
    // if (/firefox/i.test(navigator.userAgent)) { baselineshift = 0; }

    var permutations = permute(tspans);
    var radius, numrows, solution;

    permutations.forEach(function(permutation) {
      var radii = [];
      var rows = permutation.length;

      var a, b, multiplier, tspan;
      for (var row = 0; row < rows; row++) {

        // A will be the height of the number of rows from center.
        multiplier = rows/2 - row;
        multiplier = multiplier > 0 ? multiplier : Math.abs(multiplier-1);
        a = multiplier * tspanheight;

        // B will be half the horizontal width.
        if (permutation[row] instanceof Array) {
          b = permutation[row].reduce(function(previous, tspan) {
            /* Chrome has a bug where it can't accurately get SVG width using getBoundingClientRect(). */
            /* Firefox returns undefined for offsetWidth on SVG elements. */
            /* Firefox SVG tspan size is off by devicePixelRatio? https://bugzilla.mozilla.org/show_bug.cgi?id=1002044 */
            /* When these powers combine: */
            var width = tspan.offsetWidth || tspan.getBoundingClientRect().width * window.devicePixelRatio;
            return width + previous;
          }, 0) / 2;
        } else {
          tspan = permutation[row];
          b = (tspan.offsetWidth || tspan.getBoundingClientRect().width * window.devicePixelRatio) / 2;
        }

        radii.push(Math.sqrt(a*a+b*b));
      }

      var largest = Math.max.apply(Math, radii);
      if (!radius || radius >= largest) {
        radius = largest;
        numrows = permutation.length;
        solution = permutation;
      }
    });

    // Process the solution and merge the tspans.
    tspans.forEach(function(tspan) {
      text.removeChild(tspan);
    });

    for (var row = 0; row < numrows; row++) {
      if (solution[row] instanceof Array) {
        splits.splice(row, solution[row].length, splits.slice(row, row + solution[row].length).join(''));
      }
    }

    var tspans = splits.map(function(split) {
      var tspan = document.createElementNS(svgnamespace, 'tspan');
      tspan.style.textAnchor = "middle";
      tspan.appendChild(document.createTextNode(split));
      return tspan;
    });
    tspans.forEach(function(tspan) {
      text.appendChild(tspan);
    });

    // Enforce the minimum radius.
    if (radius < minradius) {
      radius = minradius;
    }

    // Add the padding at the right scale.
    if (radius > minradius) {
      radiuspadding = radiuspadding * radius / minradius;
    }

    var combinedradius = radius + radiuspadding;

    // Vertically centering the tspans in the circle means knowing how tall they are.
    var topspace = ((combinedradius * 2) - (numrows * tspanheight))/2;

    circle.setAttribute('cx', combinedradius);
    circle.setAttribute('cy', combinedradius);
    circle.setAttribute('r', combinedradius);
    text.setAttribute('x', 0);
    text.setAttribute('y', topspace + tspanheight - baselineshift);

    tspans.forEach(function(tspan, index) {
      tspan.setAttribute('x', combinedradius);
      if (index) {
        tspan.setAttribute('dy', tspanheight);
      }
    });

    document.body.removeChild(dragproxy);

    dragproxy.setAttribute('width', defaultcombinedradius*2+'px');
    dragproxy.setAttribute('height', defaultcombinedradius*2+'px');
    g.setAttribute('transform','scale('+defaultcombinedradius/combinedradius+')');
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
