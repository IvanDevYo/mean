const express = require('express');
const router = express.Router();
const ctrlLocations = require('../controllers/locations')
const ctrlOther = require('../controllers/other')

/* GET home page. */
router.get('/', ctrlLocations.homelist);
router.get('/location/:locationid', ctrlLocations.locationInfo);
router.get('/location/:locationid/reviews/new', ctrlLocations.addReview);
router.post('/location/:locationid/reviews/new', ctrlLocations.doAddReview);

router.get('/about', ctrlOther.about);

module.exports = router;
