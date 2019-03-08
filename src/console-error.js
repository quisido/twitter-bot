const centered = (str, len) => {
  if (str.length >= len) {
    return str;
  }
  const pad = (len - str.length) / 2;
  return ' '.repeat(Math.floor(pad)) + str + ' '.repeat(Math.ceil(pad));
};

module.exports = function consoleError(description, err) {
  process.stdout.write('\n');
  const errorType =
    typeof err.code === 'number' ?
      `ERROR ${err.code}` :
      typeof err.code === 'string' ?
        err.code :
        'ERROR';
  const statusCode =
    Object.prototype.hasOwnProperty.call(err, 'statusCode') ?
      ` (Status Code ${err.statusCode})` :
      '';
  const errStr = `${errorType}: ${err.message}${statusCode}`;
  const maxLength = Math.max(description.length, errStr.length);
  const bar = '─'.repeat(maxLength);
  console.error(`┌─${bar}─┐`);
  console.error(`│ ${centered(description, maxLength)} │`);
  console.error(`│ ${centered(errStr, maxLength)} │`);
  console.error(`└─${bar}─┘`);
};
