const express = require('express');
const router = express.Router();
const ctrlMain = require('../controllers/main')
const ctrlLocations = require('../controllers/locations')
const ctrlOther = require('../controllers/other')

/* GET home page. */
router.get('/', ctrlLocations.homelist);
router.get('/location', ctrlLocations.locationInfo);
router.get('/location/review/new', ctrlLocations.addReview);

router.get('/about', ctrlOther.about);

module.exports = router;
