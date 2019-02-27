const path = require('path');
const Utils = require('./utils');

function generateReleaseNotes(data) {
  const t = i => `- ${i.title} ([\#${i.number}](${i.html_url}))\n`;

  return `## [${Utils.release}] - ${new Date().toJSON().slice(0,10)}\n\n` +
    `${data.milestone.description || 'TODO: RELEASE NOTES HERE!'}\n\n` +
    `### Fixed\n${data.bugs.filter(i => !i.ignore).reduce((s, i) => s += t(i), '')}\n` +
    `### Added\n${data.features.filter(i => !i.ignore).reduce((s, i) => s += t(i), '')}\n`;
}

function generateReleaseAnchor(prevRelease, thisRelease) {
  return `[${thisRelease}]: https://github.com/adaptlearning/adapt_authoring/compare/v${prevRelease}...v${thisRelease}\n`;
}

module.exports = data => {
  Utils.logTask('Writing new CHANGELOG');
  return new Promise((resolve, reject) => {
    if(!RegExp(/\d\.\d\.\d$/).test(Utils.release)) {
      return reject(`Invalid release number passed (${Utils.release}), expect a full semver in the format: MAJOR.MINOR.PATCH`);
    }
    const headerRE = /##\s\[\d\.\d\.\d\]\s-\s\d\d\d\d-\d\d-\d\d/;
    const anchorRE = /\[(\d\.\d\.\d)\]:\shttps:\/\/github.com\/adaptlearning\/adapt_authoring\/compare\/v\d\.\d\.\d\.\.\.v\d\.\d\.\d/;

    const FILEPATH = path.join(Utils.cwd, 'CHANGELOG.md');

    Utils.readFile(FILEPATH).then(contents => {
      const onError = () => Utils.exit(`Unexpected CHANGELOG file ${FILEPATH}.`);
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
