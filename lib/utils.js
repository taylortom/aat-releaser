const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const semver = require('semver');
const spawn = require('child_process').spawn;

const GITHUB_API_PREFIX = 'https://api.github.com/repos/adaptlearning/adapt_authoring/';

class Utils {
  static get cwd() {
    return process.cwd();
  }

  static get release() {
    return process.argv[2];
  }

  static validateRelease() {
    try {
      const version = require(path.join(this.cwd, 'package.json')).version;

      if(!semver.valid(this.release)) {
        return this.exit(`Invalid release number passed (${this.release}), expected a full semver in the format: MAJOR.MINOR.PATCH`);
      }
      if(semver.lte(this.release, version)) {
        return this.exit(`You must specify a release greater than the current (${version})`);
      }
    } catch(e) {
      return this.exit(`Failed to determine current authoring tool version ${e}`);
    }
  }

  static logWelcome() {
    console.log(chalk.magenta(`\nMaking release preparations for ${this.release}, hang tight.`));
  }

  static logTask(task) {
    console.log(`\n${chalk.cyan(task)}`);
  }

  static logTaskInfo(message) {
    console.log(`- ${message}`);
  }

  static fetchGitHubData() {
    return new Promise((resolve, reject) => {
      axios.get(GITHUB_API_PREFIX + 'milestones').then(res => {
        const milestone = res.data.find(m => RegExp(`^v?${this.release}`).test(m.title));
        if(!milestone) {
          return reject(`Failed to find a GitHub milestone matching the release ${this.release}`);
        }
        axios.get(GITHUB_API_PREFIX + `issues?milestone=${milestone.number}`).then(res => {
          const bugs = [], features = [];

          res.data.forEach(i => {
            i.labels.find(l => {
              if(l.id === 60826010) {
                bugs.push(i);
                return true;
              }
              if(l.id === 60826012) {
                features.push(i);
                return true;
              }
            });
          });
          resolve({ milestone, bugs, features });

        }).catch(reject);

      }).catch(reject);
    });
  }

  static getAuthors() {
    return new Promise(function(resolve, reject) {
      const log = spawn('git', ['log', /*'--reverse',*/ '--format=Author: %aN <%aE>\n%b'], { stdio: ['inherit', 'pipe', 'inherit'] });
      const rl = readline.createInterface({ input: log.stdout });
      const names = {};
      const emails = {};
      const authorRe = /(^Author:|^Co-authored-by:)\s+(.+)\s\<(.+)\>/i;
      const blacklisted = [
        'badger@gitter.im',
        'thomas.taylor@kineo.com',
        '',
        '',
      ];
      rl.on('line', line => {
        const match = line.match(authorRe);

        if(!match) return;

        const author = match[2].replace(/\s{2,}/, ' ');
        const email = match[3];

        if(emails[email] || names[author] || author.split(' ').length === 1 || blacklisted.includes(email)) {
          return;
        }
        names[author] = email;
        emails[email] = author;
      });
      rl.on('close', () => resolve(emails));
    });
  }

  static stringSplice(oldString, index, newString) {
    return oldString.slice(0, index) + newString + oldString.slice(index);
  }

  static readFile(filepath) {
    return new Promise((resolve, reject) => {
      if(filepath.match(/.json$/)) {
        fs.readJson(filepath, (error, contents) => error && reject(error) || resolve(contents));
      }
      fs.readFile(filepath, (error, contents) => {
        if(error) return reject(error);
        resolve(contents.toString());
      });
    });
  }

  static writeFile(filepath, contents) {
    return new Promise((resolve, reject) => {
      const done = error => error && reject(error) || resolve();
      if(filepath.match(/.json$/)) {
        fs.writeJson(filepath, contents, { spaces: 2 }, done);
      }
      fs.writeFile(filepath, contents, done);
    });
  }

  static exit(error, message) {
    if(error) {
      console.log(`\n${chalk.red(error)}\n`);
      return process.exit(1);
    }
    if(message) {
      console.log(`\n${chalk.green(message)}\n`);
    }
    process.exit(0);
  }
}

module.exports = Utils;
