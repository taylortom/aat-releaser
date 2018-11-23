const Utils = require('./utils');

module.exports = (data, dir) => {
  Utils.logTask('Fetching GitHub data');
  return new Promise((resolve, reject) => Utils.fetchGitHubData().then(data => {
    Utils.logTaskInfo(`Fetch successful`);
    resolve(data);
  }).catch(reject));
}
