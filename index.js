#! /usr/bin/env node
const async = require('async');
const path = require('path');
const Utils = require('./lib/Utils');

const github = require('./lib/github');
const changelog = require('./lib/changelog');
const package = require('./lib/package');

if(!RegExp(/\d\.\d\.\d$/).test(Utils.release)) {
  return Utils.exit(`Invalid release number passed (${Utils.release}), expect a full semver in the format: MAJOR.MINOR.PATCH`);
}
Utils.logWelcome();

github().then(data => {
  Promise.all([
    changelog(data),
    package(data)
  ]).then(() => Utils.exit(null, `Preparations for ${Utils.release} made successfully!`), Utils.exit);
}).catch(Utils.exit);
