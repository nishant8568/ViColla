/**
 * Created by nishant on 11/14/2015.
 */
'use strict';

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rimraf = require('gulp-rimraf'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglify'),
    rev = require('gulp-rev'),
    bowerFiles = require('main-bower-files'),
    gulpFilter = require('gulp-filter'),
    minifyCSS = require('gulp-minify-css'),
    runSequence = require('run-sequence'),
    streamqueue = require('streamqueue'),
    inject = require('gulp-inject'),
    replace = require('gulp-replace');

// build task
gulp.task('build', function (callback) {
    // runSequence is a cool way of choosing what must run sequentially, and what in parallel
    // here, the task clean will run first alone, then all the builds in parallel, then the copies in parallel, then the injection in html
    runSequence(
        'clean',
        ['build-scripts-bower', 'build-scripts', 'build-styles', 'build-styles-bower'],
        ['copy-assets', 'copy-client', 'copy-server', 'copy-server-file', 'copy-icons', 'copy-responsive-design'],
        'replace-photo-path',
        'build-html',
        callback);
});

// Clean task
gulp.task('clean', function () {
    gulp.src('./dist/**/*.*', {
            read: false
        }) // much faster
        .pipe(rimraf({
            force: true
        }));
});

// concatenate, annotate (for angular JS) and minify the js scripts into one single app.js file, then copy it to dist folder
//gulp.task('build-scripts', function() {
//    return gulp.src(['./public/client/app/**/*.js'])
//        .pipe(concat('app.js')) // concatenate all js files
//        .pipe(ngAnnotate()) // annotate to ensure proper dependency injection in AngularJS
//        //.pipe(uglify()) // minify js
//        .pipe(rev()) // add a unique id at the end of app.js (ex: app-f4446a9c.js) to prevent browser caching when updating the website
//        .pipe(gulp.dest('./dist/client/app')); // copy app-**.js to the appropriate folder
//});

/* Devsage */
gulp.task('build-scripts', function () {
    return gulp.src([
            './public/client/app/services/database-services.js',
            './public/client/app/app.module.js',
            './public/client/app/app.route.js',
            './public/client/app/app.landing.ctrl.js',
            './public/client/app/components/others/home/home-routes.conf.js',
            './public/client/app/components/others/home/home.ctrl.js',
            './public/client/app/services/auth-services.js',
            './public/client/app/components/others/register/register-routes.conf.js',
            './public/client/app/components/others/register/register.ctrl.js',
            './public/client/app/components/core/online-mode/online-mode.ctrl.js',
            './public/client/app/components/core/online-mode/online-mode.drv.js',
            './public/client/app/components/core/contacts/contacts.ctrl.js',
            './public/client/app/components/core/contacts/contacts.drv.js',
            './public/client/app/components/core/offline-mode/offline-mode.ctrl.js',
            './public/client/app/components/core/offline-mode/offline-mode.drv.js',
            './public/client/app/components/core/video-chat/video-chat.ctrl.js',
            './public/client/app/components/core/video-chat/video-chat.drv.js',
            './public/client/app/components/core/adapter.js',
            './public/client/app/components/core/config.js',
            './public/client/app/components/core/tools/tools.ctrl.js',
            './public/client/app/components/core/tools/tools.drv.js',
            './public/client/app/components/core/snapshotsAttributesDialog/snapshotsAttributesDialog.ctrl.js',
            './public/client/app/components/core/snapshots/snapshots.ctrl.js',
            './public/client/app/components/core/snapshots/snapshots.drv.js',
            './public/client/app/components/core/incomingCallDialog/incomingCall.ctrl.js',
            './public/client/app/components/core/video-chat/collaborate/collaborate-online.ctrl.js',
            './public/client/app/components/others/header/header.ctrl.js',
            './public/client/app/components/others/header/header.drv.js',
            './public/client/app/components/others/footer/footer.drv.js',
            './public/client/app/services/utility-service.js',
            './public/client/app/services/socket-services.js',
            './public/client/app/components/core/tabs/navigation-tabs.ctrl.js',
            './public/client/app/components/core/tabs/navigation-tabs.drv.js',
            './public/client/app/components/core/tabs/navigation-tabs-routes.conf.js',
            './public/client/app/components/core/tabs/navigation-tabs.services.js'])
        .pipe(concat('app.js')) // concatenate all js files
        .pipe(ngAnnotate()) // annotate to ensure proper dependency injection in AngularJS
        .pipe(uglify()) // minify js
        .pipe(rev()) // add a unique id at the end of app.js (ex: app-f4446a9c.js) to prevent browser caching when updating the website
        .pipe(gulp.dest('./dist/client/app')); // copy app-**.js to the appropriate folder
});

// same as above, with the bower files (no need to ngannotate)
//gulp.task('build-scripts-bower', function() {
//    return gulp.src(bowerFiles({paths: {bowerDirectory: './public/client/bower_components'}}))
//        .pipe(gulpFilter(['*.js', '!bootstrap-sass-official', '!bootstrap.js', '!json3', '!es5-shim']))
//        .pipe(concat('vendor.js'))
//        //.pipe(uglify())
//        .pipe(rev())
//        .pipe(gulp.dest('./dist/client/app'));
//});

/* Devsage */
gulp.task('build-scripts-bower', function () {
    return gulp.src(['./public/client/bower_components/angular/angular.js',
            './public/client/bower_components/jquery/dist/jquery.js',
            './public/client/bower_components/bootstrap/dist/js/bootstrap.js',
            './public/client/bower_components/angular-ui-router/release/angular-ui-router.js',
            './public/client/bower_components/angular-aria/angular-aria.js',
            './public/client/bower_components/angular-animate/angular-animate.js',
            './public/client/bower_components/angular-material/angular-material.js',
            './public/client/bower_components/lodash/lodash.js',
            './public/client/bower_components/moment/moment.js'])
        .pipe(concat('vendor.js'))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('./dist/client/app'));
});

// yet another concat/minify task, here for the CSS
gulp.task('build-styles', function () {
    return gulp.src(['./public/client/assets/css/**/*.css', './public/client/app/components/**/*.css'])
        .pipe(concat('app.css'))
        .pipe(minifyCSS())
        .pipe(rev())
        .pipe(gulp.dest('./dist/client/app'));
});

// and for vendor CSS
gulp.task('build-styles-bower', function () {
    return gulp.src(bowerFiles({
            paths: {
                bowerDirectory: './public/client/bower_components'
            }
        }))
        .pipe(gulpFilter(['*.css', '!bootstrap-sass-official', '!json3', '!es5-shim']))
        .pipe(concat('vendor.css'))
        .pipe(minifyCSS())
        .pipe(rev())
        .pipe(gulp.dest('./dist/client/app'));
});

// copying the assets (images, fonts, ...)
gulp.task('copy-assets', function () {
    return gulp.src('./public/client/assets/**/*.*')
        .pipe(gulp.dest('./dist/client/assets'));
});

gulp.task('copy-icons', function () {
    return gulp.src('./public/client/bower_components/material-design-icons/iconfont/*.*')
        .pipe(gulp.dest('./dist/client/bower_components/material-design-icons/iconfont/'));
});

gulp.task('copy-responsive-design', function () {
    return gulp.src('./public/client/bower_components/bootstrap/dist/**/*.*')
        .pipe(gulp.dest('./dist/client/bower_components/bootstrap/dist/'));
});

// copying the html files
gulp.task('copy-client', function () {
    return gulp.src('./public/client/**/**/*.+(html|txt|ico)')
        .pipe(gulp.dest('./dist/client/'));
});

// simple task to copy the server folder to dist/server
gulp.task('copy-server', function () {
    return gulp.src(['./public/server/**/*.*', '!./public/server/config/multer.js'])
        .pipe(gulp.dest('./dist/server'));
});

// copy the server file to dist
gulp.task('copy-server-file', function () {
    return gulp.src('./public/server.js')
        .pipe(gulp.dest('./dist'));
});

gulp.task('replace-photo-path', function(){
    gulp.src('./public/server/config/multer.js')
        .pipe(replace('./public/client/img/', './dist/client/img/'))
        .pipe(gulp.dest('dist/server/config'));
});

// queues app.js and vendor.js
function buildjs() {
    return streamqueue({
            objectMode: true
        },
        gulp.src('app/vendor*.js', {
            read: false,
            'cwd': __dirname + '/dist/client/'
        }),
        gulp.src('app/app*.js', {
            read: false,
            'cwd': __dirname + '/dist/client/'
        })
    );
}

// queues app.css and vendor.css
function buildcss() {
    return streamqueue({
            objectMode: true
        },
        gulp.src('app/vendor*.css', {
            read: false,
            'cwd': __dirname + '/dist/client/'
        }),
        gulp.src('app/app*.css', {
            read: false,
            'cwd': __dirname + '/dist/client/'
        })
    );
}

// injection of both js files and css files in index.html
gulp.task('build-html', function () {
    return gulp.src('./dist/client/index.html')
        .pipe(inject(buildjs(), {
            relative: true
        }))
        .pipe(inject(buildcss(), {
            relative: true
        }))
        .pipe(gulp.dest('./dist/client'));
});

gulp.task('watch', function () {
    // Watch our scripts
    gulp.watch(['./public/app/**/*.js'], [
        'build'
    ]);
});

// Setting up a server for hosting webpage
var express = require('express'),
    serverPort = 9000;

// Set up an express server (but not starting it yet)
var server = express();
// Use our 'dist' folder as rootfolder
server.use(express.static('./dist'));
// Because I like HTML5 pushstate .. this redirects everything back to our index.html
server.all('/*', function (req, res) {
    res.sendfile('index.html', {
        root: 'dist'
    });
});

// Serve task
gulp.task('serve', function () {
    // Start webserver
    server.listen(serverPort);
});

gulp.task('build-watch', ['build', 'watch'])
gulp.task('default', ['build', 'serve']);