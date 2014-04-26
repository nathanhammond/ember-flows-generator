ember-flows-generator
=====================

Easily build complicated route traversal patterns in Ember.


Reasoning
---------

In a directed graph there are two possible representations: an adjacency matrix and an adjacency list. [ember-flows](https://github.com/nathanhammond/ember-flows) uses an adjacency list. However, manually generating the adjacency list for your application is tedious and prone to error.


Implementation
--------------

This is an Ember application which you can use to generate flows for your Ember application.


Building
--------

```sh
# Bower
npm install -g bower

# ember-cli
git clone git@github.com:stefanpenner/ember-cli.git
cd ember-cli
git checkout 63e9dd584ff39ea7665b833debd5a49171e4f52e
npm link
cd ..

# ember-flows-generator
git clone git@github.com:nathanhammond/ember-flows-generator.git
cd ember-flows-generator
./install.sh
ember server
```


License
-------

ember-flows-generator is [MIT Licensed](https://github.com/nathanhammond/ember-flows-generator/blob/master/LICENSE.md).
