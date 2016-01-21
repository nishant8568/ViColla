/**
 * Created by nishant on 06.12.2015.
 */
// config/passport.js

// load all the things we need
var LocalStrategy = require('passport-local').Strategy;

// load up the user model
var models = require('../models/user');

// expose this function to our app using module.exports
module.exports = function (passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and deserialize users out of session

    /**
     * used to serialize the user for the session
     */
    passport.serializeUser(function (user, done) {
        var sessionObject = {userId: user.id, loginAsExpert: user.loginAsExpert};
        done(null, sessionObject);
    });

    /**
     * used to deserialize the user
     */
    passport.deserializeUser(function (sessionObject, done) {
        models.User.findById(sessionObject.userId, function (err, user) {
            user.loginAsExpert = sessionObject.loginAsExpert;
            done(err, user);
        });
    });

    /**
     * we are using named strategies since we have one for login and one for signup
     * by default, if there was no name, it would just be called 'local'
     */
    passport.use('local-login', new LocalStrategy({
        passReqToCallback: true
    }, function (req, username, password, done) {
        // check in mongo if a user with username exists or not
        models.User.findOne({username: username},
            function (err, user) {
                // In case of any error, return using the done method
                if (err)
                    return done(err);
                // Username does not exist, log error & redirect back
                if (!user) {
                    return done(null, false, req.flash('message', 'User Not found.'));
                }
                // User exists but wrong password, log the error
                if (!user.validPassword(password)) {
                    return done(null, false, req.flash('message', 'Invalid Password'));
                }
                user.loginAsExpert = req.body.loginAsExpert;
                return done(null, user);
            }
        );
    }));

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'userName',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass back the entire request to the callback
        },
        function (req, username, password, done) {

            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function () {

                // find a user whose email/username is the same as the forms email/username
                // we are checking to see if the user trying to login already exists
                models.User.findOne({$or: [{username: username}, {email: req.body.email}]}, function (err, user) {
                    // if there are any errors, return the error
                    if (err) {
                        return done(err, false, req.flash('message', 'Error while creating the account. Please refresh the page and try again.'));
                    }
                    if (user) {
                        var mess = (username == user.username) ? "The username is already taken" : "Already exist an account with that email address";
                        return done(null, false, req.flash('message', mess));
                    } else {
                        console.log("passport.js >> local-signup");
                        console.log(req);
                        var newUser = new models.User();
                        newUser.username = username;
                        newUser.password = newUser.generateHash(password);
                        newUser.email = req.body.email;
                        newUser.phone = req.body.phone;
                        newUser.address = req.body.address;
                        newUser.firstName = req.body.firstName;
                        newUser.lastName = req.body.lastName;
                        newUser.designation = req.body.designation;
                        newUser.tags = req.body.tags;
                        newUser.status=req.body.status;
                        if (req.body.birthDate != 'null') {
                            newUser.birthDate = req.body.birthDate;
                        }
                        // save the user
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });
        }));
};

