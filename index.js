#! /usr/bin/env node
const Utils = require('./lib/Utils');
const github = require('./lib/github');
const changelog = require('./lib/changelog');
const package = require('./lib/package');

Utils.validateRelease();
Utils.logWelcome();

github().then(data => {
  Promise.all([
    changelog(data),
    package(data)
  ]).then(() => Utils.exit(null, `Preparations for ${Utils.release} made successfully!`), Utils.exit);
}).catch(Utils.exit);
