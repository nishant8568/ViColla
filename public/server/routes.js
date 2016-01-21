/**
 * Created by nishant on 06.12.2015.
 */
var models = require('./models/user');
var upload = require('./config/multer');
var Moment = require('moment-timezone');
// app/routes.js
module.exports = function (app, passport) {

    app.post('/upload', function (req, res) {
        upload.single('file')(req, res, function (uploadErr) {
            if (!uploadErr) {
                models.User.findByIdAndUpdate(req.user._id, {$set: {logoFilename: '/img/' + req.body.filename}},
                    function (err, user) {
                        res.json({"success": true, "user": buildUserDict(user)});
                    });
            } else {
                res.json({"success": false, "error": uploadErr});
            }
        })
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.json({"message": "logout success"});
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/api/loginSuccess',
        failureRedirect: '/api/loginFailure'
    }));

    app.get('/loginSuccess', function (req, res) {
        res.json({
            "success": true,
            "user": buildUserDict(req.user)
        })
    });

    app.get('/loginFailure', function (req, res) {
        var response = req.flash();
        res.json({"success": false, "message": response.message[0]})
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/api/signupSuccess', // redirect to the secure profile section
        failureRedirect: '/api/signupFailure' // redirect back to the signup page if there is an error
        //failureFlash : true // allow flash messages
    }));

    app.get('/signupFailure', function (req, res, next) {
        var response = req.flash();
        res.json({"success": false, "message": response.message[0]})
    });

    app.get('/signupSuccess', function (req, res, next) {
        console.log("routes.js >> signupSuccess");
        console.log("routes.js >> signupSuccess >> request");
        console.log(req);
        console.log("routes.js >> signupSuccess >> response");
        console.log(res);
        res.json({"success": true});
    });

    app.get('/check/session', function (req, res, next) {
        if (isLoggedIn(req, res)) {
            res.json({"success": true, "user": buildUserDict(req.user)})
        } else {
            res.json({"success": false})
        }
    });

    app.get('/videoCalling', function (req, res, next) {
        if (isLoggedIn(req, res)) {
            models.User.find({'_id': req.query.userId}).exec(function (err, users) {
                if (err) {
                    res.json({
                        "success": false,
                        "message": "Error while getting user data. Please refresh the page and try again"
                    });
                } else {
                    //console.log("userData:"+users);
                    res.json({"success": true, "videoChat": users});
                }
            })
        }
    });

    app.get('/contacts', function (req, res, next) {
        if (isLoggedIn(req, res)) {
            models.User.find({})
                .where("_id")
                .ne(req.user._id)
                .sort('-firstName')
                .select('_id firstName lastName username status designation tags')
                .exec(function (err, users) {
                    if (err) {
                        res.json({
                            "success": false,
                            "message": "Error while getting contacts. Please refresh the page and try again"
                        });
                    } else {
                        res.json({"success": true, "contacts": users});
                    }
                })
        }
    });

    app.get('/clear/user/mongo', function (req, res, next) {
        models.User.remove({}, function (err) {
            if (err) res.json({"message": err});

            models.CallHistory.remove({}, function (err) {
                if (err) res.json({"message": err});
                res.json({"message": "collections cleard"});
            });
        });
    });

    app.get('/call/history', function (req, res, next) {
        if (isLoggedIn(req, res)) {
            models.CallHistory.find({
                    $or: [
                        {_caller: req.query.userId},
                        {_receiver: req.query.userId}
                    ]
                },
                function (err, histories) {
                    if (err) {
                        res.json({
                            "success": false,
                            "message": "Error while getting call history. Please refresh the page and try again"
                        });
                    }
                    else {
                        res.json({"success": true, "callHistory": histories});
                    }
                });
        }
    });

    app.post('/callHistory', function (req, res, next) {
        if (isLoggedIn(req, res)) {
            models.CallHistory.find({$or: [{_caller: req.user._id}, {_receiver: req.user._id}]}, function (err, callhistory) {
                if (err) {
                    res.json({"success": false, "message": "Error while storing called data."});
                } else {
                    var callingData = new models.CallHistory();
                    callingData._caller = req.body._caller;
                    callingData._receiver = req.body._receiver;
                    callingData.callerFirstName = req.body.callerFirstName;
                    callingData.callerLastName = req.body.callerLastName;
                    callingData.callername = req.body.callername;
                    callingData.receivername = req.body.receivername;
                    callingData.receiverFirstName = req.body.receiverFirstName;
                    callingData.receiverLastName = req.body.receiverLastName;
                    callingData.status = req.body.status;
                    callingData.startDate = Moment.utc().format();
                    callingData.duration = req.body.duration;
                    callingData.callerDesignation = req.body.callerDesignation;
                    callingData.receiverDesignation = req.body.receiverDesignation;
                    callingData.receiverLogoFilename = req.body.receiverLogoFilename;
                    callingData.callerLogoFilename = req.body.callerLogoFilename;
                    callingData.save(function (err, getCallersInfo) {
                        if (err) {
                            res.json({success: false, message: "Unable to save call details to call logs"});
                        }
                        res.json({"success": true, "callHistory": getCallersInfo});
                    });
                }
            });
        }
    });

    app.post('/save/image', function (req, res, next) {
        if (isLoggedIn(req, res)) {

            var image = new models.ImageSnapshot();
            image.duration = req.body.imageInfo.duration;
            image.playbackTime = req.body.imageInfo.playbackTime;
            image.description = req.body.imageInfo.description;
            image.videoName = req.body.imageInfo.videoName;
            image.dataURL = req.body.imageInfo.dataURL;

            image.save(function (err) {
                if (err)
                    res.json({success: false, message: "Unable to save your image. Please try again"});
                res.json({success: true, message: "Image successfully saved.", id: image._id});
            });
        }
    });

    app.post('/update/image', function (req, res, next) {
        if (isLoggedIn(req, res)) {
            console.log("updating..............");
            console.log(req.body.imageInfo.imageId);
            console.log(req.body.imageInfo.duration);
            console.log(req.body.imageInfo.description);
            models.ImageSnapshot.update({_id: req.body.imageInfo.imageId}, {
                $set: {
                    duration: req.body.imageInfo.duration,
                    description: req.body.imageInfo.description
                }
            }, function (err, updatedInfo) {
                if (err) {
                    res.json({
                        "success": false,
                        "message": "Error while updating snapshot."
                    });
                }
                else {
                    res.json({
                        "success": true,
                        "updatedInfo": updatedInfo
                    });
                }
            })
        }
    });

    app.post('/remove/image', function (req, res, next) {
        if (isLoggedIn(req, res)) {
            models.ImageSnapshot.find({_id: req.body.imageId}).remove(function (err, removed) {
                if (err) {
                    res.json({
                        "success": false,
                        "message": "Error while removing snapshot."
                    });
                }
                else {
                    res.json({
                        "success": true,
                        "removedSnapshots": removed
                    });
                }
            });
        }
    });

    app.get('/images', function (req, res, next) {
        if (isLoggedIn(req, res)) {
            models.ImageSnapshot.find({videoName: req.query.videoName}, function (err, images) {
                if (err) {
                    res.json({success: false, message: "Unable to get other users images for this video"});
                } else {
                    res.json({success: true, images: images});
                }
            });
        }
    })
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    return !!req.isAuthenticated();
}

function buildUserDict(sessionUser) {
    return {
        id: sessionUser._id,
        firstName: sessionUser.firstName,
        lastName: sessionUser.lastName,
        email: sessionUser.email,
        username: sessionUser.username,
        designation: sessionUser.designation,
        isExpert: sessionUser.loginAsExpert,
        tags: sessionUser.tags,
        logoFilename: sessionUser.logoFilename,
        status: sessionUser.status
    };
}