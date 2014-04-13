export default Ember.Controller.extend({
  stateFlipped: false,
  routerFlipped: false,

  stateCode: 'Ember.Object.extend();',
  routerCode: "var Router = Ember.Router.extend({ rootURL: ENV.rootURL, location: 'auto'});Router.map(function() { this.route('asdf'); });export default Router;",

  routerChangeCount: 0,

  routerTranspiledCode: function() {
    this.incrementProperty('routerChangeCount');

    var Compiler = ModuleTranspiler.Compiler;
    var compiler = new Compiler(this.get('routerCode'), 'router' + this.get('routerChangeCount'), {imports: []});
    var code = compiler.toAMD();
    return code;
  }.property('routerCode'),

  routerNodes: function() {
    // TODO: Figure out how to overwrite defined modules.
    // FIXME: Make this just define("router").
    eval(this.get('routerTranspiledCode'));
    var router = require('router' + this.get('routerChangeCount')).default;
    var routeNames = router.create().router.recognizer.names;
    var results = [];

    for (var x in routeNames) {
      if (!routeNames.hasOwnProperty(x)) { continue; }
      results.push(x);
    }
    return results;
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
