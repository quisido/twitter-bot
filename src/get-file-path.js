const path = require('path');

module.exports = function getFilePath(file) {
  return path.join(
    process.cwd(),
    'tweets',
    file
  );
};
