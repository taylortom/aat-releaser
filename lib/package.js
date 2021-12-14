const path = require('path');
const Utils = require('./utils');

module.exports = data => {
  Utils.logTask('Updating package.json');

  return new Promise((resolve, reject) => {
    const FILEPATH = path.join(Utils.cwd, 'package.json');
    
    Utils.readFile(FILEPATH).then(data => {
      Utils.writeFile(FILEPATH, { ...data, version: Utils.release }).then(() => {
        Utils.logTaskInfo(`Updated package.json`);
        resolve();
      }).catch(reject);
    }).catch(reject);
  });
}
