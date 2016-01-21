/**
 * Created by nishant on 1/7/2016.
 */
collaborationModule.controller('collaborationController', ['$scope', function($scope) {
    function draw() {
        if (window.requestAnimationFrame) window.requestAnimationFrame(draw);
        // IE implementation
        else if (window.msRequestAnimationFrame) window.msRequestAnimationFrame(draw);
        // Firefox implementation
        else if (window.mozRequestAnimationFrame) window.mozRequestAnimationFrame(draw);
        // Chrome implementation
        else if (window.webkitRequestAnimationFrame) window.webkitRequestAnimationFrame(draw);
        // Other browsers that do not yet support feature
        else $timeout(draw, 16.7);
        DrawVideoOnCanvas();
    }

    draw();


    function DrawVideoOnCanvas() {
        var object,backgroundObject;

        // check the logic to detect if the user is expert
        if ($scope.appCtrl.isExpert) {
            object = document.getElementById("localVideo");
            backgroundObject = document.getElementById("remoteVideo");
        } else {
            object = document.getElementById("remoteVideo");
            backgroundObject = document.getElementById("localVideo");
        }

        var width = object.width;
        var height = object.height;
        var canvas = document.getElementById("helpCanvas");
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);

        if (canvas.getContext) {
            //console.log('printing .. ');
            var context = canvas.getContext('2d');
            context.drawImage(backgroundObject, 0, 0, width, height);
            var imgDataBackground = context.getImageData(0, 0, width, height);
            context.drawImage(object, 0, 0, width, height);
            var imgDataNormal = context.getImageData(0, 0, width, height);

            var imgData = context.createImageData(width, height);

            // Function to manipulate pixels of canvas
            var outputImgData = manipulateImageData(imgData, imgDataNormal, imgDataBackground);

            context.putImageData(outputImgData, 0, 0);

        }

        function manipulateImageData(imgData, imgDataNormal, imgDataBackground) {
            for (var i = 0; i < imgData.width * imgData.height * 4; i += 4) {
                var r = imgDataNormal.data[i + 0];
                var g = imgDataNormal.data[i + 1];
                var b = imgDataNormal.data[i + 2];
                var a = imgDataNormal.data[i + 3];

                // compare rgb levels for gray and set alphachannel to 0;
                var selectedR = 10;
                var selectedG = 120;
                var selectedB = 60;
                if (r <= selectedR || g >= selectedG) {
                    a = 0;
                }
                if (a != 0) {
                    imgData.data[i + 0] = r;
                    imgData.data[i + 1] = g;
                    imgData.data[i + 2] = b;
                    imgData.data[i + 3] = a;
                }

            }

            for (i = 0; i < imgData.width * imgData.height * 4; i += 4) {
                var a = imgData.data[i + 3];
                if (a == 0) {
                    imgData.data[i + 0] = imgDataBackground.data[i + 0];
                    imgData.data[i + 1] = imgDataBackground.data[i + 1];
                    imgData.data[i + 2] = imgDataBackground.data[i + 2];
                    imgData.data[i + 3] = imgDataBackground.data[i + 3];
                }
            }
            return imgData;
        }
    }
}]);