const fs = require('fs');
const fetch = require('node-fetch');
const path = require('path');
const TWEETS_URL = require('./tweets-url');

const TWEETS_DIR = path.join(process.cwd(), 'tweets');
const INDEX_JS = path.join(TWEETS_DIR, 'index.js');
const INDEX_JSON = path.join(TWEETS_DIR, 'index.json');

module.exports = async function getTweetsIndex() {
  if (TWEETS_URL) {
    const response = await fetch(TWEETS_URL);
    return await response.json();
  } else {
    // Import either JS or JSON.
    const INDEX_PATH =
      fs.existsSync(INDEX_JS) ?
        INDEX_JS :
        INDEX_JSON;
    const tweetsIndex = require(INDEX_PATH);
    delete require.cache[require.resolve(INDEX_PATH)];
    return tweetsIndex;
  }
};
