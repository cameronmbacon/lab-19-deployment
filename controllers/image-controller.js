'use strict';

const fs = require('fs');
const del = require('del');
const path = require('path');
const AWS = require('aws-sdk');
const dataDir = `${__dirname}/../data`;
const debug = require('debug')('pokegram:image-controller');
const createError = require('http-errors');
const Image = require('../models/image');
const Gallery = require('../models/gallery');

AWS.config.setPromisesDependency(require('bluebird'));
const s3 = new AWS.S3();

function s3UploadProm(params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

function s3DeleteProm(params) {
  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
}

module.exports = exports = {};

exports.createImage = function(wreck) {
  debug('#createImage');

  if (!wreck.file) return createError(400, 'Resource required');
  if (!wreck.file.path) return createError(500, 'File not saved');

  let ext = path.extname(wreck.file.originalname);
  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${wreck.file.filename}${ext}`,
    Body: fs.createReadStream(wreck.file.path),
  };

  return Gallery.findById(wreck.params.id)
  .then(() => s3UploadProm(params))
  .then(s3Data => {
    del([`${dataDir}/*`]);
    let imgData = {
      name: wreck.body.name,
      desc: wreck.body.desc,
      userId: wreck.user._id,
      galleryId: wreck.params.id,
      imageURI: s3Data.Location,
      objectKey: s3Data.Key,
    };
    return new Image(imgData).save();
  });
};

exports.fetchImage = function(wreck) {
  debug('#fetchImage');

  return Image.findById(wreck.params.id)
  .then(image => {
    if (image.userId.toString() !== wreck.user._id.toString()) {
      return Promise.reject(createError(401, 'Invalid user'));
    }
    return Promise.resolve(image);
  })
  .catch(() => Promise.reject(createError(404, 'Image not found')));
};

exports.deleteImage = function(wreck) {
  debug('#deleteImage');
  let params = {};

  return Image.findById(wreck.params.imageId)
  .then(image => {
    if (image.galleryId.toString() !== wreck.params.id.toString()) {
      return Promise.reject(createError(401, 'image not associated with this gallery'));
    }
    if (image.userId.toString() !== wreck.user._id.toString()) {
      return Promise.reject(createError(401, 'Invalid user'));
    }

    params = {
      Bucket: process.env.AWS_BUCKET,
      Key: image.objectKey,
    };
  })
  .then(() => s3DeleteProm(params))
  .then(() => {
    return Image.findByIdAndRemove(wreck.params.imageId);
  })
  .catch(err => Promise.reject(createError(404, err.message)));
};
