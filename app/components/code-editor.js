export default Ember.Component.extend({
  classNames: ['code-editor'],
  editor: undefined,
  code: '',
  didInsertElement: function() {
    var textarea = this.$('textarea')[0];
    var editor = CodeMirror.fromTextArea(textarea, {
      mode: "text/javascript",
      lineNumbers: true
    });

    this.set('editor', editor);
  }
});
