const path = require('path');
const Utils = require('./utils');

const FILEPATH = path.join(Utils.cwd, 'package.json');
let package, authors;

module.exports = data => {
  Utils.logTask('Updating package.json');

  return new Promise((resolve, reject) => {
    Promise.all([
      Utils.readFile(FILEPATH),
      Utils.getAuthors()
    ]).then(data => {
      const updatedPackage = Object.assign(data[0], {
        version: Utils.release,
        contributors: Object.keys(data[1]).map(key => `${data[1][key]} <${key}>`)
      });
      Utils.writeFile(FILEPATH, updatedPackage).then(() => {
        Utils.logTaskInfo(`Updated package.json`);
        resolve();
      }).catch(reject);

    }).catch(reject);
  });
}
