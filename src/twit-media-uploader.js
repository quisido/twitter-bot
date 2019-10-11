const crypto = require('crypto');
const fs = require('fs');
const fetch = require('node-fetch');
const { promisify } = require('util');
const consoleError = require('./console-error');

const MILLISECONDS_PER_SECOND = 1000;

/*
const fs = require('fs');
const fsReadFile = promisify(fs.readFile);
const getMediaData = file_path => {
  process.stdout.write(`Reading ${file}`);
  return fsReadFile(file_path, 'base64')
    .then(media_data => {
      process.stdout.write(' -- SUCCESS\n');
      return media_data;
    })
    .catch(err => {
      consoleError('Read file failed.', err);
      throw null;
    });
};
*/

if (!fs.existsSync('./tmp')) {
  fs.mkdirSync('./tmp');
}

const md5 = crypto.createHash('md5');

module.exports = class TwitMediaUploader {

  constructor(T) {
    this._fileMediaIds = new Map();
    this.setTwit(T);
    this.uploadChunkedMedia = this.uploadChunkedMedia.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.uploadMedia = this.uploadMedia.bind(this);
    this.uploadMetadata = this.uploadMetadata.bind(this);
  }

  deleteFileMediaId(file_path) {
    this._fileMediaIds.delete(file_path);
  }

  getFileMediaId(file_path) {
    return this._fileMediaIds.get(file_path);
  }

  hasFileMediaId(file_path) {
    return this._fileMediaIds.has(file_path);
  }

  setFileMediaExpiration(file_path, expires_after_secs) {
    setTimeout(
      () => {
        if (this.hasFileMediaId(file_path)) {
          this.deleteFileMediaId(file_path);
        }
      },
      expires_after_secs * MILLISECONDS_PER_SECOND
    );
  }

  setFileMediaId(file, media_id) {
    this._fileMediaIds.set(file, media_id);
  }

  setTwit(T) {
    this._postMediaChunked = promisify(T.postMediaChunked).bind(T);
    this._T = T;
  }

  async uploadFile(file_path, alt_text) {

    // If this file has already been uploaded, return the media_id.
    if (this.hasFileMediaId(file_path)) {
      return this.getFileMediaId(file_path);
    }

    let filePath = file_path;
    if (/^http/.test(file_path)) {
      filePath = `./tmp/${md5.digest(file_path)}.${file_path.split('.').pop()}`;
      const response = await fetch(file_path);
      const data = await response.text();
      fs.writeFileSync(filePath, data);
    }

    /*
    return getMediaData(file_path)
      .then(this.uploadMedia)
    */
   
    const { expires_after_secs, media_id } = await this.uploadChunkedMedia(filePath);
    this.setFileMediaExpiration(filePath, expires_after_secs);
    this.setFileMediaId(filePath, media_id);
    await this.uploadMetadata(media_id, alt_text);
    return media_id;
  }

  uploadChunkedMedia(file_path) {
    process.stdout.write(`Uploading chunked media ${file_path}`);
    return this._postMediaChunked({ file_path })
      .then(result => {
        process.stdout.write(` -- #${result.media_id_string}\n`);
        return {
          expires_after_secs: result.expires_after_secs,
          media_id: result.media_id_string
        };
      })
      .catch(err => {
        consoleError('Chunked media upload failed.', err);
        throw null;
      });
  }

  uploadMedia(media_data) {
    process.stdout.write('Uploading media');
    return this._T.post('media/upload', { media_data })
      .then(result => {
        process.stdout.write(` -- #${result.data.media_id_string}\n`);
        return {
          expires_after_secs: result.data.expires_after_secs,
          media_id: result.data.media_id_string
        };
      })
      .catch(err => {
        consoleError('Media upload failed.', err);
        throw null;
      });
  }

  uploadMetadata(media_id, alt_text) {
    process.stdout.write(`Uploading metadata ${alt_text}`);
    return this._T.post('media/metadata/create', {
      alt_text: {
        text: alt_text,
      },
      media_id,
    })
      .then(() => {
        process.stdout.write(' -- SUCCESS\n');
        return {
          alt_text,
          media_id,
        };
      })
      .catch(err => {
        consoleError('Metadata upload failed.', err);
        throw null;
      });
  }
}
