/*

buildSubTree and arrayizeChildren taken from:
https://github.com/emberjs/ember-inspector/blob/ecc3a4b8c91b2b0ab0d68a3a8ad4518bb8fe8159/ember_debug/route_debug.js

License:
https://github.com/emberjs/ember-inspector/blob/c5234b84ce03699fb23f3115d07798edcdf5afdf/LICENSE

*/

function buildSubTree(routeTree, route) {
  var handlers = route.handlers;
  var subTree = routeTree
  var item;

  for (var i = 0; i < handlers.length; i++) {
    item = handlers[i];
    var handler = item.handler;
    if (subTree[handler] === undefined) {

      subTree[handler] = {
        value: {
          name: handler
        }
      };

      if (i === handlers.length - 1) {
        // it is a route, get url
        subTree[handler].value.type = 'route';
      } else {
        // it is a resource, set children object
        subTree[handler].children = {};
        subTree[handler].value.type = 'resource';
      }

    }
    subTree = subTree[handler].children;
  }
}

function arrayizeChildren(routeTree) {
  var obj = { value: routeTree.value };

  if (routeTree.children) {
    var childrenArray = [];
    for(var i in routeTree.children) {
      var route = routeTree.children[i];
      childrenArray.push(arrayizeChildren(route));
    }
    obj.children = childrenArray;
  }

  return obj;
}

export default Ember.Controller.extend({
  stateFlipped: false,
  routerFlipped: false,

  stateCode: 'Ember.Object.extend();',
  routerCode: "var Router = Ember.Router.extend({\n  rootURL: ENV.rootURL,\n  location: 'auto'\n});\n\nRouter.map(function() {\n  this.route('asdf');\n});\n\nexport default Router;",

  routerChangeCount: 0,

  routeTree: function() {
    var compiler, transpiledCode, router;

    var code = this.get('routerCode');
    this.incrementProperty('routerChangeCount');

    try {
      compiler = new ModuleTranspiler.Compiler(code, 'router' + this.get('routerChangeCount'), {imports: []});
      transpiledCode = compiler.toAMD();
      transpiledCode = loopProtect.rewriteLoops(transpiledCode);
      eval(transpiledCode);
      router = require('router' + this.get('routerChangeCount')).default;
    } catch (e) {
      return e;
    }

    var routeNames = router.create().router.recognizer.names;
    var routeTree = {};
    var route = undefined;

    for (var routeName in routeNames) {
      if (!routeNames.hasOwnProperty(routeName)) { continue; }
      route = routeNames[routeName];
      buildSubTree.call(this, routeTree, route);
    }

    this.set('currentRoute', undefined);

    return arrayizeChildren({ children: routeTree }).children[0];
  }.property('routerCode'),

  routeTreeError: function() {
    return this.get('routeTree') instanceof Error;
  }.property('routeTree'),

  currentRoute: undefined,

  actions: {
    flipState: function() {
      this.toggleProperty('stateFlipped');
    },
    flipRouter: function() {
      this.toggleProperty('routerFlipped');
    },
    focusRoute: function(route) {
      this.set('currentRoute', route);
    }
  }
})
