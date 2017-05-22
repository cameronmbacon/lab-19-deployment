'use strict';

const expect = require('chai').expect;
const superagent = require('superagent');
const debug = require('debug')('pokegram:pic-router-test');
const awsMocks = require('./lib/aws-mocks');

const Image = require('../models/image');
const User = require('../models/user');
const Gallery = require('../models/gallery');

const serverToggle = require('./lib/server-toggle');
const server = require('../server');

const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'cameron',
  password: 'bacon',
  email: 'cameron@bacon.yum',
};

const testGallery = {
  name: 'test pokemon gallery',
  desc: 'gallery should contain pokemon',
};

const testImage = {
  name: 'charizard',
  desc: 'should be an image of charizard',
  image: `${__dirname}/assets/6.png`,
};

const testImageModel = {
  name: 'test image model',
  desc: 'test image model description',
  imageURI: awsMocks.uploadMock.Location,
  filename: awsMocks.uploadMock.Key,
  created: new Date(),
};

describe('Image Routes', function() {
  debug('#image-routes-test');
  before(done => {
    serverToggle.serverOn(server, done);
  });

  after(done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done => {
    Promise.all([
      Image.remove({}),
      User.remove({}),
      Gallery.remove({}),
    ])
    .then(() => done())
    .catch(done);
  });

  describe('POST: /api/gallery/:id/image', function() {
    describe('with a valid token and valid data', function() {
      before(done => {
        new User(testUser)
        .generatePasswordHash(testUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then(token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });
      before( done => {
        testGallery.userId = this.tempUser._id.toString();
        new Gallery(testGallery).save()
        .then(gallery => {
          this.tempGallery = gallery;
          done();
        })
        .catch(done);
      });
      after(done => {
        delete testGallery.userId;
        done();
      });

      it('should return an image', done => {
        superagent.post(`${url}/api/gallery/${this.tempGallery._id}/image`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .field('name', testImage.name)
        .field('desc', testImage.desc)
        .attach('image', testImage.image)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body.name).to.equal(testImage.name);
          expect(res.body.desc).to.equal(testImage.desc);
          expect(res.body.galleryId).to.equal(this.tempGallery._id.toString());
          expect(res.body.imageURI).to.equal(awsMocks.uploadMock.Location);
          done();
        });
      });
    });
  });
});
