const mongoose = require('mongoose');
const Loc = mongoose.model('Location')

const sendJSONResponse = function(res, status, content) {
    res.status(status)
    res.json(content)
}

const theEarth = (function() {
    console.log('theEarth');
    var earthRadius = 6371; // km, miles is 3959
  
    var getDistanceFromRads = function(rads) {
      return parseFloat(rads * earthRadius);
    };
  
    var getRadsFromDistance = function(distance) {
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
    console.log('locationsListByDistance:');
    const lng = parseFloat(req.query.lng);
    const lat = parseFloat(req.query.lat);
    const maxDistance = parseFloat(20000000000000000000);
    const point = {
      type: "Point",
      coordinates: [lng, lat]
    };
    console.log('point: ' + point)
    const geoOptions = {
      spherical: true,
      maxDistance: theEarth.getRadsFromDistance(maxDistance),
      num: 10
    };
    console.log('geoOptions: ' + geoOptions);
    if ((!lng && lng!==0) || (!lat && lat!==0) || ! maxDistance) {
      console.log('locationsListByDistance missing params');
      sendJSONResponse(res, 404, {
        "message": "lng, lat and maxDistance query parameters are all required"
      });
      return;
    } else {
      console.log('locationsListByDistance running...');
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
    console.log('buildLocationList:');
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
    sendJSONResponse(res, 200, {"status": "success"})
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
    
}

module.exports.locationsDeleteOne = function(req, res) {
    
}