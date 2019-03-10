module.exports = function semiShuffle(arr) {
  let i = 0;
  arr.sort(([ a ], [ b ]) => {
    i++;
    if (a.charAt(i % a.length) < b.charAt(i % b.length)) {
      return -1;
    }
    return 1;
  });
};
