export default Ember.Controller.extend({
  stateFlipped: false,
  routerFlipped: false,

  stateCode: 'Ember.Object.extend();',
  routerCode: "var Router = Ember.Router.extend({\n  rootURL: ENV.rootURL,\n  location: 'auto'\n});\n\nRouter.map(function() {\n  this.route('asdf');\n});\n\nexport default Router;",

  routerChangeCount: 0,

  routerTranspiledCode: function() {
    this.incrementProperty('routerChangeCount');

    var Compiler = ModuleTranspiler.Compiler;
    var compiler = new Compiler(this.get('routerCode'), 'router' + this.get('routerChangeCount'), {imports: []});
    var code = compiler.toAMD();
    code = loopProtect.rewriteLoops(code);
    return code;
  }.property('routerCode'),

  nodeCache: [],

  routerNodes: function() {
    var results = [];
    // TODO: Figure out how to overwrite already-defined modules.
    // FIXME: Make this just define("router").
    try {
      eval(this.get('routerTranspiledCode'));
      var router = require('router' + this.get('routerChangeCount')).default;
      var routeNames = router.create().router.recognizer.names;

      var output;
      for (var x in routeNames) {
        if (!routeNames.hasOwnProperty(x)) { continue; }
        if (x == 'application') { continue; }

        output = routeNames[x].handlers.mapBy('handler').join('.');
        results.push(output);
      }
      this.set('nodeCache', results);
      return results;
    } catch(error) {
      console.log(error);
      return this.get('nodeCache');
    }
  }.property('routerTranspiledCode'),

  actions: {
    flipState: function() {
      this.toggleProperty('stateFlipped');
    },
    flipRouter: function() {
      this.toggleProperty('routerFlipped');
    }
  }
})
