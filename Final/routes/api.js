const express = require('express')
const router = express.Router()
const yelpconfig = require('../config/Yelp')
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/cs411')
const authorized = require('./authCheck')

const db = mongoose.connection
db.once('open', function () {
    console.log('Connection successful.')
})
const tokens = {
    accesstoken: yelpconfig.ACCESS_TOKEN
}


//the schema of weather and restaurant
const Schema = mongoose.Schema
const weatherSchema = new Schema({
    city: String,
    temperature: String,
    humidity: String,
    day: String
})

const restaurantSchema = new Schema({
    name: String,
    address: String,
    price: String,
    url: String
   // category: String
})

const Res = mongoose.model('restaurant', restaurantSchema);
const Wea = mongoose.model('weather', weatherSchema)




//routes to get all the weathers and restaurants in the database protected by Twitter Oauth
router.get('/allwea', function (req, res, next) {
    if (!req.cookies.authStatus) {
        console.log('Please log in.')
        res.send('Please log in.')
    }
    else {

        Wea.find({}, function (err, results) {
           res.json(results);
        });
    }
});
router.get('/allres', function (req, res, next) {
    if (!req.cookies.authStatus) {
        console.log('Please log in.')
        res.send('Please log in.')
    }
    else {
        Res.find({}, function (err, results) {
            res.json(results);
        });
    }

});


//routes and methods to update weathers protected by Twitter Oauth
let findByWea = function (checkName) {
    return new Promise(function (resolve, reject) {
        Wea.find({city: checkName}, function (err, results) {
            if (results.length > 0) {
                resolve({found: results})
            }
            else {
                reject({found: false})
            }
        })
    })
}
router.get('/weatherupdate/:string', function (req, res, next) {
    if (!req.cookies.authStatus) {
        console.log('Please log in.')
        res.send('Please log in.')
    }
    else {
        var request = require("request");

        var options = {
            method: 'GET',
            url: 'https://weathers.co/api.php?city=' + req.params.string,
        }

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            let result = JSON.parse(body);
            findByWea(result.data.location)
                .then(function (status) {
                    Wea.findOneAndUpdate({city: result.data.location}, {
                        temperature: result.data.temperature,
                        humidity: result.data.humidity,
                        day: result.data.day
                    }, function (err, result) {
                        {
                            res.json({message: 'success'});
                        }
                    })
                })
                .catch(function (status) {

                    let aWeather = new Wea({
                        city: result.data.location,
                        temperature: result.data.temperature,
                        humidity: result.data.humidity,
                        day: result.data.day
                    });
                    aWeather.save();
                    res.json(status)

                })

        });
    }
});




//routes and methods to update restaurants protected by Twitter Oauth
let findByRes = function (checkName) {
    return new Promise(function (resolve, reject) {
        Res.find({name: checkName}, function (err, results) {
            if (results.length > 0) {
                resolve({found: results})
            }
            else {
                reject({found: false})
            }
        })
    })
}

router.get('/findres/:string', function (req, res, next) {
    if (!req.cookies.authStatus) {
        console.log('Please log in.')
        res.send('Please log in.')
    }
    else {
        var request = require("request");
        var options = {
            method: 'GET',
            url: 'https://weathers.co/api.php?city=' + req.params.string,
        }
        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            let result = JSON.parse(body);
            if (result.data.humidity > 30 && result.data.humidity < 60) {
                var request = require("request");

                var options = {
                    method: 'GET',
                    url: 'https://api.yelp.com/v3/businesses/search?location=' + result.data.location + "&term=food",
                    headers: {'Authorization': 'Bearer ' + tokens.accesstoken}
                };
                request(options, function (error, response, body) {
                    if (error) throw new Error(error);
                    let result = JSON.parse(body);
                    let result1 = result.businesses;
                    result1.forEach(function (element) {
                        let aRestaurant = new Res({
                            name: element.name,
                            address: element.location.address1,
                            price: element.price,
                            url: element.url
                        });
                        aRestaurant.save();
                    });

                    res.send('saved successfully');


                    console.log(body);
                });
            }
            else if (result.data.humidity > 70) {
                var request = require("request");

                var options = {
                    method: 'GET',
                    url: 'https://api.yelp.com/v3/businesses/search?location=' + result.data.location + "&term=delis",
                    headers: {'Authorization': 'Bearer ' + tokens.accesstoken}
                };
                request(options, function (error, response, body) {
                    if (error) throw new Error(error);
                    let result = JSON.parse(body);
                    let result1 = result.businesses;
                    result1.forEach(function (element) {
                        let aRestaurant = new Res({
                            name: element.name,
                            address: element.location.address1,
                            price: element.price,
                            url: element.url
                        });
                        aRestaurant.save();
                    });

                    res.send('saved successfully');


                    console.log(body);
                });
            }
            else {
                let aRestaurant = new Res({name: 'not found'});
                aRestaurant.save();
            }

        });
    }
})


//routes to delete collections in database
router.delete('/removeres', function (req, res, next) {
    if (!req.cookies.authStatus) {
        console.log('Please log in.')
        res.send('Please log in.')
    }
    else {
        mongoose.connection.db.dropCollection('restaurants', function (err, result) {
            if (err) {
                res.json({message: 'Error deleting'});
            }
            else {
                res.json(result);
            }

        })
    }
});
router.delete('/removewea', function (req, res, next) {
    if (!req.cookies.authStatus) {
        console.log('Please log in.')
        res.send('Please log in.')
    }
    else {
        mongoose.connection.db.dropCollection('weathers', function (err, result) {
            if (err) {
                res.json({message: 'Error deleting'});
            }
            else {
                res.json(result);
            }

        })
    }
});


module.exports = router;