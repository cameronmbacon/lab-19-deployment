'use strict';

const multer = require('multer');
const dataDir = `${__dirname}/../data`;
const upload = multer({dest: dataDir});
const debug = require('debug')('pokegram:image-routes');
const bearerAuth = require('../lib/bearer-auth-middleware');

const imageController = require('../controllers/image-controller');

module.exports = function(router) {

  router.post('/gallery/:id/image', bearerAuth, upload.single('image'), (req, res) => {
    debug('#POST /gallery/:id/image');

    return imageController.createImage(req)
    .then(image => res.json(image))
    .catch(err => res.send(err));
  });

  router.get('/image/:id', bearerAuth, (req, res) => {
    debug('#GET /image/:id');

    return imageController.fetchImage(req)
    .then(image => res.json(image))
    .catch(err => res.status(err.status).send(err.message));
  });

  router.delete('/gallery/:id/image/:imageId', bearerAuth, (req, res) => {
    debug('#DELETE /gallery/:id/image/:imageId');

    return imageController.deleteImage(req)
    .then(() => res.sendStatus(204))
    .catch(err => res.status(err.status).send(err.message));
  });

  return router;
};
