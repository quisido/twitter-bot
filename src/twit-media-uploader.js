const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const consoleError = require('./console-error');

const fsReadFile = promisify(fs.readFile);

const file2mediaData = file => {
  process.stdout.write(`Reading ${file}`);
  return fsReadFile(file, { encoding: 'base64' })
    .then(media_data => {
      process.stdout.write(' -- SUCCESS\n');
      return media_data;
    })
    .catch(err => {
      consoleError('Read file failed.', err);
      throw null;
    });
};

const filePath = file =>
  path.join(
    process.cwd(),
    file
  );

module.exports = class TwitMediaUploader {

  constructor(T) {
    this._fileMediaIds = new Map();
    this.setTwit(T);
    this.uploadChunkedMedia = this.uploadChunkedMedia.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.uploadMedia = this.uploadMedia.bind(this);
    this.uploadMetadata = this.uploadMetadata.bind(this);
  }

  getFileMediaId(file) {
    return this._fileMediaIds.get(file);
  }

  hasFileMediaId(file) {
    return this._fileMediaIds.has(file);
  }

  setFileMediaId(file, media_id) {
    this._fileMediaIds.set(file, media_id);
    return media_id;
  }

  setTwit(T) {
    this._postMediaChunked = promisify(T.postMediaChunked).bind(T);
    this._T = T;
  }

  uploadFile(file, alt_text) {
    const file_path = filePath(file);

    // If this file has already been uploaded, return the media_id.
    if (this.hasFileMediaId(file_path)) {
      return Promise.resolve(this.getFileMediaId(file_path));
    }

    /*
    return file2mediaData(file_path)
      .then(this.uploadMedia)
    */
    return this.uploadChunkedMedia(file_path)
      .then(media_id => this.uploadMetadata(media_id, alt_text))
      .then(media_id => this.setFileMediaId(file_path, media_id));
  }

  uploadChunkedMedia(file_path) {
    process.stdout.write(`Uploading chunked media ${file_path}`);
    return this._postMediaChunked({ file_path })
      .then(result => {
        process.stdout.write(result.data);
        process.stdout.write('\n');
        return result.data.media_id_string;
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
        process.stdout.write(result.data);
        process.stdout.write('\n');
        return result.data.media_id_string;
      })
      .catch(err => {
        consoleError('Media upload failed.', err);
        throw null;
      });
  }

  uploadMetadata(media_id, alt_text) {
    process.stdout.write(`Uploading metadata ${alt_text}`);
    return this._T.post('media/metadata/create', {
      media_id,
      alt_text: {
        text: alt_text
      }
    })
      .then(result => {
        process.stdout.write(result.data);
        process.stdout.write('\n');
        return media_id;
      })
      .catch(err => {
        consoleError('Metadata upload failed.', err);
        throw null;
      });
  }
}
