const axios = require('axios');
const chalk = require('chalk');
const fs = require('fs-extra');

const GITHUB_API_PREFIX = 'https://api.github.com/repos/adaptlearning/adapt_authoring/';

class Utils {
  static get release() {
    return process.argv[2];
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
