export default Ember.Component.extend({
  classNames: ['code-editor'],
  editor: undefined,
  code: '',
  didInsertElement: function() {
    var textarea = this.$('textarea')[0];
    var editor = CodeMirror.fromTextArea(textarea, {
      mode: "text/javascript"
    });

    this.set('editor', editor);
  }
});
