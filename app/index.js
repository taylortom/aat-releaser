const axios = require('axios');
const express = require('express');
const path = require('path');

const changelog = require('../lib/changelog');
const github = require('../lib/github');
const package = require('../lib/package');
const Utils = require('../lib/utils');

const app = express();
const port = process.env.PORT || 5000;
const publicDir = path.join(process.cwd(), 'app', 'public');

app.use(express.static(publicDir));
app.use('/api', initAPI());

app.listen(port, () => console.log(`aat-releaser listening on port ${port}`));

function initAPI() {
  return express.Router()
    .get('/milestones', getMilestones)
    .get('/data', getData)
}

function getMilestones(req, res, next) {
  Utils.fetchGitHubData('milestones')
    .then(data => res.json(data.map(m => m.title)))
    .catch(e => {
      const { status, statusText, headers } = e.response;
      if(headers['x-ratelimit-remaining'] === '0') {
        console.log(new Date(headers['x-ratelimit-reset']));
      }
      res.status(status).json({ message: statusText })
    });
}

async function getData(req, res, next) {
  if(!Utils.isValidRelease(req.query.v)) {
    res.status(400).json({ message: `Invalid release version passed '${req.query.v}'` });
    return;
  }
  // TODO need to actually wait for these to finish...
  Utils.fetchData('https://raw.githubusercontent.com/adaptlearning/adapt_authoring/master/package.json').then(data => {
    Utils.writeFile('./app/public/package.json', data);
  });
  Utils.fetchData('https://raw.githubusercontent.com/adaptlearning/adapt_authoring/master/CHANGELOG.md').then(data => {
    Utils.writeFile('./app/public/CHANGELOG.md', data);
  });
  process.env.RELEASE = req.query.v;
  process.env.CWD = publicDir;

  try {
    const githubData = await github();
    await changelog(githubData);
    await package(githubData);
    res.json(githubData);
  } catch(e) {
    console.trace(e);
    res.status(500).json({ message: e.message });
  }
}
