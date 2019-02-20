const axios = require('axios');
const express = require('express');
const path = require('path');

const changelog = require('../lib/changelog');
const github = require('../lib/github');
const package = require('../lib/package');
const Utils = require('../lib/Utils');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.static('app/public'));
app.use('/api', initAPI());

app.listen(port, () => console.log(`aat-releaser listening on port ${port}`));

function initAPI() {
  return express.Router()
    .get('/milestones', getMilestones)
    .get('/data', getData)
}

function getMilestones(req, res, next) {
  Utils.fetchGitHubData('milestones').then(data => res.json(data.map(m => m.title)));
}

function getData(req, res, next) {
  if(!req.query.v.match(/^\d\.\d\.\d/)) {
    res.status(400).json({ message: `Invalid release version passed '${req.query.v}'` });
  }
  // TODO need to actually wait for these to finish...
  Utils.fetchData('https://raw.githubusercontent.com/adaptlearning/adapt_authoring/master/package.json').then(data => {
    Utils.writeFile('./app/public/package.json', data);
  });
  Utils.fetchData('https://raw.githubusercontent.com/adaptlearning/adapt_authoring/master/CHANGELOG.md').then(data => {
    Utils.writeFile('./app/public/CHANGELOG.md', data);
  });
  process.env.RELEASE = req.query.v;
  process.env.CWD = path.join(process.cwd(), 'app', 'public');
  
  github().then(githubData => {
    Promise.all([
      changelog(githubData),
      package(githubData)
    ]).then(() => res.json(githubData));
  }).catch(e => {
    res.status(500).json({ message: e.message });
  });
}
