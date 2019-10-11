const path = require('path');
const TWEETS_URL = require('./tweets-url');

module.exports = function getFilePath(file) {
  if (TWEETS_URL) {
    const url = TWEETS_URL.split('/');
    url.pop();
    url.push(file);
    return url.join('/');
  }
  return path.join(
    process.cwd(),
    'tweets',
    file
  );
};
