'use strict';

require('dotenv').load();

const express = require('express');
const cors = require('cors');
const debug = require('debug')('pokegram:server');
const morgan = require('morgan');
const Promise = require('bluebird');
const errorHandler = require('./lib/error-middleware');
const authRoutes = require('./routes/auth-routes');
const galleryRoutes = require('./routes/gallery-routes');
const imageRoutes = require('./routes/image-routes');
const bodyParser = require('body-parser').json();
const mongoose = require('mongoose');

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/pokegram-env';

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.use(morgan('dev'));
app.use(errorHandler);
app.use(cors());
app.use(bodyParser);
app.use('/api', authRoutes(router));
app.use('/api', galleryRoutes(router));
app.use('/api', imageRoutes(router));

const server = module.exports = app.listen(PORT, () => debug(`Listening on ${PORT}`));

server.isRunning = true;
