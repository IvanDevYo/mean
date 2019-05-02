const mongoose = require('mongoose');
const Loc = mongoose.model('Location')

const sendJSONResponse = function(res, status, content) {
    res.status(status)
    res.json(content)
}

const theEarth = (function() {
    console.log('theEarth');
    const earthRadius = 6371; // km, miles is 3959
  
    const getDistanceFromRads = function(rads) {
      return parseFloat(rads * earthRadius);
    };
  
    const getRadsFromDistance = function(distance) {
        console.log(parseFloat(distance / earthRadius))
      return parseFloat(distance / earthRadius);
    };
  
    return {
      getDistanceFromRads: getDistanceFromRads,
      getRadsFromDistance: getRadsFromDistance
    };
  })();
  
  /* GET list of locations */
  module.exports.locationsListByDistance = function(req, res) {
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const maxDistance = parseFloat(20000000000000000000);
    const point = {
      type: "Point",
      coordinates: [lng, lat]
    };
    const geoOptions = {
      spherical: true,
      maxDistance: theEarth.getRadsFromDistance(maxDistance),
      num: 10
    };
    if ((!lng && lng!==0) || (!lat && lat!==0) || ! maxDistance) {
      sendJSONResponse(res, 404, {
        "message": "lng, lat and maxDistance query parameters are all required"
      });
      return;
    } else {
      Loc.aggregate(
        [{
          '$geoNear': {
            'near': point,
            'spherical': true,
            'distanceField': 'dist.calculated',
            'maxDistance': maxDistance
          }
        }],
        function(err, results) {
          if (err) {
            sendJSONResponse(res, 404, err);
          } else {
            locations = buildLocationList(req, res, results);
            sendJSONResponse(res, 200, locations);
          }
        }
      )
    };
  };
  
  const buildLocationList = function(req, res, results) {
    const locations = [];
    results.forEach(function(doc) {
        locations.push({
          distance: doc.dist.calculated,
          name: doc.name,
          address: doc.address,
          rating: doc.rating,
          facilities: doc.facilities,
          _id: doc._id
        });
    });
    return locations;
  };

  module.exports.locationsCreate = function(req, res) {
    Loc.create({
      name: req.body.name,
      address: req.body.address,
      facilities: req.body.facilities.split(","),
      coords: [parseFloat(req.body.lng),
        parseFloat(req.body.lat)],
      openingTimes: [{
        days: req.body.days1,
        opening: req.body.opening1,
        closing: req.body.closing1,
        closed: req.body. closed1
      }, {
        days: req.body.days2,
        opening: req.body.opening2,
        closing: req.body.closing2,
        closed: req.body. closed2
      }]
    }, function(err, location) {
      if(err) {
        sendJSONResponse(res, 400, err);
      } else {
        sendJSONResponse(res, 201, location);
      }
    });
  }
  
  module.exports.locationsReadOne = function(req, res) {
    if(req.params && req.params.locationid) {
      Loc
      .findById(req.params.locationid)
      .exec(function(err, location) {
        if(!location) {
          sendJSONResponse(res, 404, {
            "message": "location not found"
          });
          return;
        } else if(err) {
          sendJSONResponse(res, 404, err);
          return;
        }
  
        sendJSONResponse(res, 200, location);
      });
    } else {
      sendJSONResponse(res, 404, {
        "message": "No locationid in request"
      });
    }
    
  }
  
  module.exports.locationsUpdateOne = function(req, res) {
    if(!req.params.locationid) {
      sendJSONResponse(res, 404, {
        "message": "locationid not found"
      });
      return;
    }
    Loc
      .findById(req.params.locationid)
      .select('-reviews - rating')
      .exec(function(err, location) {
        if(!location) {
          sendJSONResponse(res, 404, {
            "message": "location not found"
          });
          return;
        } else if(err) {
          sendJSONResponse(res, 400, err);
          return;
        }
        location.name = req.body.name;
        location.address = req.body.address;
        location.facilities = req.body.facilities.split(",");
        location.coords = [parseFloat(req.body.lng),
          parseFloat(req.body.lat)];
        location.openingTimes = [{
          days: req.body.days1,
          opening: req.body.opening1,
          closing: req.body.closing1,
          closed: req.body. closed1
        }, {
          days: req.body.days2,
          opening: req.body.opening2,
          closing: req.body.closing2,
          closed: req.body. closed2
        }];
        location.save(function(err, location) {
          if(err) {
            sendJSONResponse(res, 404, err);
          } else {
            sendJSONResponse(res, 200, location);
          }
        });
      });
  }
  
  module.exports.locationsDeleteOne = function(req, res) {
    const locationid = req.params.locationid;
    if(locationid) {
      Loc
        .findByIdAndRemove(locationid)
        .exec(function(err, location) {
          if(err) {
            sendJSONResponse(res, 404, err);
            return;
          }
          sendJSONResponse(res, 204, null);
        })
    } else {
      sendJSONResponse(res, 404, {
        "message": "No locationid"
      });
    }
}