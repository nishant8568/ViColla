/**
 * Created by nishant on 10.12.2015.
 */

var multer = require('multer');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/client/img/');
    },
    filename: function (req, file, cb) {
        var filename = Date.now() + '.jpg';
        req.body.filename = filename;
        cb(null, filename);
    }
});

var upload = multer({
    storage: storage
});

module.exports = upload;