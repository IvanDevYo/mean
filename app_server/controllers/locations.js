const request = require('request');
const localeConfig = require('../../config/locale')
const apiOptions = {
	server: "http://localhost:3000"
}

const renderHomepage = function(req, res, responseBody) {
	let message;
	if(!(responseBody instanceof Array)) {
		message = "Ошибка обращения к API";
		responseBody = [];
	} else {
		if(!responseBody.length) {
			message = "Нет мест поблизости";
		}
	}
	res.render('locations-list', {
		title: 'Loc8r - Найдите место для работы рядом!',
		pageHeader: {
			title: 'Loc8r',
			strapline: 'Найдите место для работы рядом!'
		},
		sidebar: "Ищете хорошее место для отдыха? Loc8r поможет вам найти место" 
		+ "по душе где вы сможете удобно поработать. Возможно с кофе, пироженным или пиццей. Loc8r поможет найти " 
		+ "вам любое место",
		locations: responseBody,
		message: message
	});
}

const _formatDistance = function(distance) {
	let numDistance, unit;
	if(distance > 1000) {
		numDistance = parseFloat(distance/1000).toFixed(1);
		unit = ' км';
	} else {
		numDistance = parseInt(distance);
		unit = ' м';
	}
	return numDistance + unit;
}

module.exports.homelist = function(req, res) {
	let requestOptions, path;
	path = '/api/locations';
	requestOptions = {
		url: apiOptions.server + path,
		method: 'GET',
		json: {},
		qs: {
			lng: 59.9749045,
			lat: 30.4715074
		}
	};
	request(requestOptions, function(err, response, body) {
		let i, data;
		data = body;
		if(response.statusCode == 200 && data.length) {
			for(i = 0; i < data.length; i++) {
				data[i].distance = _formatDistance(data[i].distance);
			}
		}
		renderHomepage(req, res, data);
	});
};

const renderDetailPage = function(req, res, locDetail) {
	res.render('location-info', {
		title: locDetail.name,
		pageHeader: {title: locDetail.name},
		sidebar: {
			context: 'Сушия на Loc8r потому что это прекрасное время где можно провести время и заняться продуктивной работой.',
			callToAction: 'Если вы здесь были и вам понравилось, ну или нет - пожалуйста оставьте отзыв, чтобы помочь другим пользователям.'
		},
		location: locDetail,
		config: localeConfig
	});
}

module.exports.locationInfo = function(req, res) {
	getLocationInfo(req, res, function(req, res, responseData) {
		renderDetailPage(req, res, responseData);
	});
};

const _showError = function(req, res, status) {
	let title, content;
	if(status == 404) {
		title = '404, страница не найдена';
		content = 'Кажется мы не можем найти то, что вы искали';
	} else {
		title = status + ", что-то пошло не так.";
		content = "Где-то что-то пошло не так";
	}
	res.status(status);
	res.render('generic-text', {
		title: title,
		content: content
	});
}

const getLocationInfo = function(req, res, callback) {
	let requestOptions, path;
	path = "/api/locations/" + req.params.locationid;
	requestOptions = {
		url: apiOptions.server + path,
		method: 'GET',
		json: {}
	};
	request(
		requestOptions,
		function(err, response, body) {
			var data = body;
			if(response.statusCode === 200) {
				if(!data.reviews) {
					data.reviews = [];
				}
				data.coords = {
					lng: body.coords[0],
					lat: body.coords[1]
				}
				callback(req, res, data);
			} else {
				_showError(req, res, response.statusCode);
			}
		});
}

const renderReviewForm = function(req, res, locDetail) {
	res.render('location-review-form', {
		title: 'Добавить обзор на ' + locDetail.name + ' на Loc8r',
		pageHeader: {title: 'Добавить обзор на ' + locDetail.name},
		error: req.query.err
	});
}

module.exports.addReview = function(req, res) {
	getLocationInfo(req, res, function(req, res, responseData) {
		renderReviewForm(req, res, responseData);
	});
};

module.exports.doAddReview = function(req, res) {
	let requestOptions, path, locationid, postdata;
	locationid = req.params.locationid;
	path = "/api/locations/" + locationid + '/reviews';
	postdata = {
		author: req.body.name,
		rating: parseInt(req.body.rating, 10),
		reviewText: req.body.review
	};
	requestOptions = {
		url: apiOptions.server + path,
		method: 'POST',
		json: postdata
	};
	if(!postdata.author || !postdata.rating || !postdata.reviewText) {
		res.redirect('/location/' + locationid + '/reviews/new?err=val');
	} else {
		request(requestOptions, function(err, response, body) {
			if(response.statusCode === 201) {
				res.redirect('/location/' + locationid);
			} else if(response.statusCode === 400 && body.name && body.name === "ValidationError") {
				res.redirect('/location/' + locationid + '/reviews/new?err=val');
			} else {
				_showError(req, res, response.statusCode);
			}
		})
	}
};