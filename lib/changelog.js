const path = require('path');
const Utils = require('./utils');

function generateReleaseNotes(data) {
  const t = i => `- ${i.title} ([\#${i.number}](${i.html_url}))\n`;
  const filteredBugs = data.bugs.filter(i => !i.ignore).reduce((s, i) => s += t(i), '');
  const filteredFeatures = data.features.filter(i => !i.ignore).reduce((s, i) => s += t(i), '');
  let str = `## [${Utils.release}] - ${new Date().toJSON().slice(0,10)}\n\n` +
    `${data.milestone.description || 'TODO: RELEASE NOTES HERE!'}\n\n`;

  if(filteredBugs.length) str += `### Fixed\n${filteredBugs}\n`;
  if(filteredFeatures.length) str += `### Added\n${filteredFeatures}\n`;

  return str;
}

function generateReleaseAnchor(prevRelease, thisRelease) {
  return `[${thisRelease}]: https://github.com/adaptlearning/adapt_authoring/compare/v${prevRelease}...v${thisRelease}\n`;
}

module.exports = data => {
  Utils.logTask('Writing new CHANGELOG');
  return new Promise((resolve, reject) => {
    if(!Utils.isValidRelease()) {
      return reject(`Invalid release number passed (${Utils.release}), expect a full semver in the format: MAJOR.MINOR.PATCH`);
    }
    const headerRE = RegExp(/##\s\[\d{1,3}\.\d{1,3}.\d{1,3}]\s-\s\d\d\d\d-\d\d-\d\d/);
    const anchorRE = RegExp(/\[(\d{1,3}\.\d{1,3}.\d{1,3})\]:\shttps:\/\/github.com\/adaptlearning\/adapt_authoring\/compare\/v\d{1,3}\.\d{1,3}.\d{1,3}\.\.\.v\d{1,3}\.\d{1,3}.\d{1,3}/);
    const FILEPATH = path.join(Utils.cwd, 'CHANGELOG.md');

    Utils.readFile(FILEPATH).then(contents => {
      const onError = () => reject(`Unexpected CHANGELOG file ${FILEPATH}.`);
      let file = contents.slice();

      const hMatch = file.match(headerRE);
      if(!hMatch) return onError();
      file = Utils.stringSplice(file, hMatch.index, generateReleaseNotes(data));
      
      const aMatch = file.match(anchorRE);
      if(!aMatch) return onError();
      file = Utils.stringSplice(file, aMatch.index, generateReleaseAnchor(aMatch[1], Utils.release));

      Utils.writeFile(FILEPATH, file).then(() => {
        Utils.logTaskInfo(`New CHANGELOG written to ${FILEPATH}`);
        resolve();
      }).catch(reject);
    }).catch(reject);
  });
}
