const path = require('path');
const Utils = require('./utils');

module.exports = data => {
  Utils.logTask('Updating package.json');

  return new Promise((resolve, reject) => {
    const FILEPATH = path.join(Utils.cwd, 'package.json');

    Utils.readFile(FILEPATH).then(data => {
      const updatedPackage = Object.assign(data, { version: Utils.release });
      
      Utils.writeFile(FILEPATH, updatedPackage).then(() => {
        Utils.logTaskInfo(`Updated package.json`);
        resolve();
      }).catch(reject);
    }).catch(reject);
  });
}
