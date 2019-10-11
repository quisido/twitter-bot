const Twit = require('twit');
const consoleError = require('./console-error');
const getFilePath = require('./get-file-path');
const getTweetsIndex = require('./get-tweets-index');
const semiShuffle = require('./semi-shuffle');
const TwitMediaUploader = require('./twit-media-uploader');



/**
 * Require API tokens.
 */
const access_token = process.env.ACCESS_TOKEN || process.argv[4];
const access_token_secret = process.env.ACCESS_TOKEN_SECRET || process.argv[5];
const consumer_key = process.env.CONSUMER_KEY || process.argv[2];
const consumer_secret = process.env.CONSUMER_SECRET || process.argv[3];

if (!access_token || !access_token_secret || !consumer_key || !consumer_secret) {
  throw new Error('Required API keys are missing.');
}



/**
 * Establish constants.
 */
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

const T = new Twit({
  access_token,
  access_token_secret,
  consumer_key,
  consumer_secret,
  strictSSL: true,
  timeout_ms: 15000,
});

const TMediaUploader = new TwitMediaUploader(T);



/**
 * Define actions.
 */
const retweet = id => {
  process.stdout.write(`Retweeting #${id}`);
  return T.post('statuses/retweet/:id', { id })
    .then(result => {
      process.stdout.write(` -- ${result.data.created_at}`);
    })
    .catch(err => {
      consoleError('Retweet failed.', err);
    });
};

const updateStatus = (status, media_ids = []) => {
  process.stdout.write(status);
  return T.post('statuses/update', {
    media_ids,
    status
  })
    .then(result => {
      process.stdout.write(` -- ${result.data.created_at} (#${result.data.id})\n`);
    })
    .catch(err => {
      process.stdout.write('\n');
      consoleError('Status update failed.', err);
    });
};

const updateStatusWithMedia = (status, media) => {
  const promises = [];
  for (const [alt_text, file_path] of Object.entries(media)) {
    promises.push(TMediaUploader.uploadFile(getFilePath(file_path), alt_text));
  }
  return Promise.all(promises)
    .then(media_ids => updateStatus(status, media_ids))
    .catch(() => {});
}



/**
 * Execute actions.
 */
const tweet = async (indx = null) => {
  const tweetsIndex = await getTweetsIndex();
  const tweetsEntries = Object.entries(tweetsIndex);
  semiShuffle(tweetsEntries);
  const tweets = tweetsEntries.map(entry => entry[1]);

  // The first tweet should be random.
  const index =
    indx === null ?
      Math.floor(Math.random() * tweets.length) :
      indx;

  // Get the tweet metadata.
  const metadata =
    Array.isArray(tweets[index]) ?
      tweets[index][Math.floor(Math.random() * tweets[index].length)] :
      tweets[index];

  // If it's a status,
  if (metadata.status) {

    // If it contains an image,
    if (metadata.media) {
      updateStatusWithMedia(
        metadata.status,
        metadata.media,
      );
    }

    // If it doesn't contain an image,
    else {
      updateStatus(metadata.status);
    }
  }

  // If it's a retweet,
  else if (metadata.retweet) {

    // TODO:
    //   unretweet(metadata.retweet)
    //     .then(retweet)
    retweet(metadata.retweet);
  }

  // Tweet again in 11 hours.
  setTimeout(() => {
    tweet((index + 1) % tweets.length);
  }, 11 * HOUR);
};
tweet();

/**
 * Examples:
 *   retweet('1095062910815125505');
 *   updateStatus('This was posted by a bot!');
 *   updateStatusWithMedia('Force of Will by @AceQuisido', { 'Force of Will': './test.jpg' });
 */
