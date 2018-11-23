const path = require('path');
const Utils = require('./utils');

module.exports = (data, dir) => {
  Utils.logTask('Updating package.json');

  return new Promise((resolve, reject) => {
    const FILEPATH = path.join(dir, 'package.json');

    Utils.readFile(FILEPATH).then(package => {
      package.version = Utils.release;

      Utils.writeFile(FILEPATH, package).then(() => {
        Utils.logTaskInfo(`Updated package.json`);
        resolve();
      }).catch(reject);
    }).catch(reject);
  });
}
