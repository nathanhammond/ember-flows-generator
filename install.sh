#!/usr/bin/env bash

rm -rf vendor node_modules tmp
bower install
npm install
cp node_modules/es6-module-transpiler/dist/es6-module-transpiler.js vendor/es6-module-transpiler.js
cp vendor/normalize-css/normalize.css app/styles/normalize.scss
cp vendor/codemirror/lib/codemirror.css app/styles/components/code-editor/codemirror.scss

cd vendor/escodegen
npm install
npm run-script build
rm -rf node_modules
cd ../../

git checkout vendor
