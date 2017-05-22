'use strict';

const debug = require('debug')('pokegram:gallery-controller');
const createError = require('http-errors');
const Gallery = require('../models/gallery');

module.exports = exports = {};

exports.createGallery = function(body) {
  debug('#createGallery');

  return new Gallery(body).save();
};

exports.fetchUserGallery = function(id, userId) {
  debug('#fetchUserGallery');

  return Gallery.findById(id)
  .then(gallery => {
    if (gallery.userId.toString() !== userId.toString()) {
      return Promise.reject(createError(401, 'Invalid user'));
    }
    return Promise.resolve(gallery);
  })
  .catch(() => Promise.reject(createError(404, 'gallery not found')));
};

exports.updateGallery = function(id, userId, body) {
  debug('#updateGallery');

  return Gallery.findByIdAndUpdate(id, body, {new: true})
  .then(gallery => {
    if (gallery.userId.toString() !== userId.toString()) {
      return Promise.reject(createError(401, 'Invalid user'));
    }
    return Promise.resolve(gallery);
  })
  .catch(() => Promise.reject(createError(404, 'gallery not found')));
};

exports.deleteGallery = function(id, userId) {
  debug('#deleteGallery');

  Gallery.findById(id)
  .then(gallery => {
    if (gallery.userId.toString() !== userId.toString()) {
      return Promise.reject(createError(401, 'Invalid user'));
    }
  })
  .catch(err => Promise.reject(err));

  return Gallery.findByIdAndRemove(id);
};
