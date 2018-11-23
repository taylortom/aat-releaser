const async = require('async');
const path = require('path');
const Utils = require('./lib/Utils');

const github = require('./lib/github');
const changelog = require('./lib/changelog');
const package = require('./lib/package');

const DIR = process.cwd();

module.exports = (() => {
  if(!RegExp(/\d\.\d\.\d$/).test(Utils.release)) {
    return reject(`Invalid release number passed (${Utils.release}), expect a full semver in the format: MAJOR.MINOR.PATCH`);
  }
  Utils.logWelcome();

  github().then(data => {
    changelog(data, DIR).then(() => {
      package(data, DIR).then(() => {
        Utils.exit(null, `Preparations for ${Utils.release} made successfully!`);
      }).catch(Utils.exit);
    }).catch(Utils.exit);
  }).catch(Utils.exit);
})();
