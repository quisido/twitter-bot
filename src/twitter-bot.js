const Twit = require('twit');
const consoleError = require('./console-error');
const TwitMediaUploader = require('./twit-media-uploader');

const access_token = process.env.ACCESS_TOKEN || process.argv[4];
const access_token_secret = process.env.ACCESS_TOKEN_SECRET || process.argv[5];
const consumer_key = process.env.CONSUMER_KEY || process.argv[2];
const consumer_secret = process.env.CONSUMER_SECRET || process.argv[3];

if (!access_token || !access_token_secret || !consumer_key || !consumer_secret) {
  throw new Error('Required API keys are missing.');
}

const T = new Twit({
  access_token,
  access_token_secret,
  consumer_key,
  consumer_secret,
  strictSSL: true,
  timeout_ms: 15000,
});

const TMediaUploader = new TwitMediaUploader(T);



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

const updateStatusWithMedia = (status, file, alt_text) =>
  TMediaUploader.uploadFile(file, alt_text)
    .then(media_id => updateStatus(status, [ media_id ]))
    .catch(() => {});

// retweet('1095062910815125505');
updateStatusWithMedia('Force of Will by @AceQuisido', './test.jpg', 'Force of Will');
