export default Ember.Component.extend({
  classNames: ['code-editor'],
  editor: undefined,
  code: '',
  didInsertElement: function() {
    var parent = this.$()[0];

    var editor = CodeMirror(parent, {
      mode: "text/javascript",
      tabSize: 2,
      value: this.get('code')
    });

    this.set('editor', editor);

    editor.on('change', function(editor) {
      this.set('code', editor.getValue());
    }.bind(this));
  }
});
