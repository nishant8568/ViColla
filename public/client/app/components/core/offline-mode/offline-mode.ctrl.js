/**
 * Created by nishant on 11/21/2015.
 */
offlineModeModule.controller('offlineModeController',
    ['$scope', '$window', '$mdUtil', '$mdSidenav', '$log', '$mdDialog', '$compile', 'databaseService', 'utilityService', '$timeout',
        function ($scope, $window, $mdUtil, $mdSidenav, $log, $mdDialog, $compile, databaseService, utilityService, $timeout) {
            'use strict';
            $scope.max = 3;
            $scope.selectedIndex = 2;
            $scope.volumeStatus = "volume_mute";
            $scope.toggleLeft = buildToggler('left');
            $scope.openVideoButton = document.getElementById('openVideo');
            $scope.canvasElement = document.getElementById('outputCanvas');
            $scope.videoObject = document.getElementById("videoBackgrounddata");
            $scope.ctx = $scope.canvasElement.getContext('2d');
            $scope.currentTime = "00:00";
            $scope.duration = "00:00";
            $scope.playPlauseButton = "play_arrow";

            //$scope.ctx.canvas.width = parseInt(640);
            //$scope.ctx.canvas.height = parseInt(480);

            $scope.canvasElement.width = ($window.innerWidth) * 0.6;
            $scope.canvasElement.height = ($window.innerHeight) * 0.6;
            var playerControlsContainer = document.getElementById('playerControlsContainer');
            playerControlsContainer.style.maxWidth = $scope.canvasElement.width + 'px';
            playerControlsContainer.style.minWidth = $scope.canvasElement.width + 'px';
            $scope.ctx.canvas.width = parseInt($scope.canvasElement.width);
            $scope.ctx.canvas.height = parseInt($scope.canvasElement.height);

            //$scope.ctx.canvas.width = $scope.ctx.canvas.offsetWidth;
            //$scope.ctx.canvas.height = $scope.ctx.canvas.offsetHeight;

            // variable that decides if something should be drawn on mousemove
            $scope.drawing = false;

            // Drawing properties
            $scope.drawingStyle = "";
            $scope.strokeColor = "red";
            $scope.brushThickness = 1;

            // Drawing styles data structures
            $scope.penStrokes = [];
            $scope.penStrokeTemp = [];
            $scope.drawnLines = [];
            $scope.drawnRectangles = [];
            $scope.drawnCircles = [];
            $scope.drawnTriangles = [];
            $scope.drawnText = [];

            // the last coordinates before the current move
            $scope.lastX;
            $scope.lastY;

            // snapshots
            $scope.savedSnapshotsData = [];

            // load annotated video
            $scope.loadedSnapshots = null;
            $scope.iterator = 0;
            $scope.iterator_backup = 0;
            $scope.disableShowAnnotationsIcon = false;
            $scope.nextSnapshotTime;
            $scope.nextImageElem;
            $scope.nextDuration;
            $scope.stopDrawing = false;

            // video status variables
            var isVideoReady = false;
            var videoEnded = false;
            var isVideoPaused = true;

            $scope.videoCache = [];

            $scope.fileNameChanged = function(element) {
                console.log("select file..........");
                console.log('files:::::: ', element.files);
                var src = window.URL.createObjectURL(element.files[0]);
                console.log('src:::::: ', src);
            };

            $scope.getExpertFlag = function () {
                return utilityService.getExpertFlag();
            };

            $scope.toggleAnnotations = function () {
                if ($scope.loadedSnapshots != null) {
                    if ($scope.iterator < $scope.loadedSnapshots.length) {
                        $scope.iterator_backup = $scope.iterator;
                        $scope.iterator = 9999;
                        $scope.disableShowAnnotationsIcon = true;
                    } else {
                        $scope.iterator = $scope.iterator_backup;
                        $scope.disableShowAnnotationsIcon = false;
                    }
                }
            };

            /**
             * Build handler to open/close a SideNav; when animation finishes
             * report completion in console
             */
            function buildToggler(navID) {
                var debounceFn = $mdUtil.debounce(function () {
                    $mdSidenav(navID)
                        .toggle()
                        .then(function () {
                            $log.debug("toggle " + navID + " is done");
                        });
                }, 300);

                return debounceFn;
            }

            $scope.formatDuration = function (timeString) {
                if (isNaN(timeString))
                    return "00:00:00";
                else
                    return utilityService.formatDuration(timeString);
            };

            $scope.$watch(function () {
                return $scope.videoFile
            }, function handleFooChange(newValue, oldValue) {
                console.log("video file changed, call get video file : ", newValue);
                if (newValue != oldValue) {
                    console.log("video file loaded.... : ", $scope.videoName);
                    $scope.getVideoFile();
                    console.log("video file name parsed to.... : ", $scope.videoName);
                    $scope.loadImages();
                }
            });

            var playAnnotatedVideo = function () {
                var annotatedVideoObject = document.getElementById("videoBackgrounddata");
                annotatedVideoObject.play();
            };

            /**
             * Get the video file to be played
             */
            $scope.getVideoFile = function () {
                var vFile = $scope.videoFile;
                $scope.videoName = $scope.openVideoButton.value;
                if ($scope.videoName != null) {
                    var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                    var is_android = navigator.userAgent.toLowerCase().indexOf("android") > -1;
                    if (is_firefox && is_android) {
                        var indexOfFirstMinus = $scope.videoName.indexOf('-');
                        var indexOfLastMinus = $scope.videoName.lastIndexOf('-');
                        var indexOfLastDot = $scope.videoName.lastIndexOf('.');
                        var extension = $scope.videoName.substr(indexOfLastDot);
                        var finalFileName;
                        if(indexOfFirstMinus != indexOfLastMinus) {
                            finalFileName = $scope.videoName.substring(indexOfFirstMinus + 1, indexOfLastMinus);
                        } else {
                            var leftGarbageRemoved = $scope.videoName.substr(indexOfFirstMinus + 1);
                            var firstDigit = leftGarbageRemoved.match(/\d/);
                            var indexOfFirstDigit = leftGarbageRemoved.indexOf(firstDigit);
                            finalFileName = leftGarbageRemoved.substr(0, indexOfFirstDigit);
                        }
                        finalFileName = finalFileName + extension;
                    } else {
                        var nameSplit = $scope.videoName.split("\\");
                        $scope.videoName = nameSplit[nameSplit.length - 1];
                    }
                    var videoNode = document.querySelector('video');
                    videoNode.src = window.URL.createObjectURL(vFile);
                    console.log(videoNode.src);
                    isVideoReady = true;
                    // trigger enable/disable tools in toolsController
                    //$scope.$broadcast('toggleDisable');
                    $scope.clearDrawings();
                    videoEnded = false;
                } else {
                    console.log("Invalid Video Selection");
                }
            };

            /**
             * Open file browser
             */
            $scope.openFileDialog = function () {
                $scope.openVideoButton.click();
            };

            /**
             * Close left sideNav
             */
            $scope.closeSideNav = function () {
                $mdSidenav('left').close()
                    .then(function () {
                        $log.debug("close LEFT is done");
                    });
            };

            /**
             * Mute/Unmute video
             */
            $scope.toggleVolumeStatus = function () {
                var videoObject = document.getElementById("videoBackgrounddata");
                if ($scope.volumeStatus == "volume_up") {
                    videoObject.muted = true;
                    $scope.volumeStatus = "volume_mute";
                }
                else {
                    videoObject.muted = false;
                    $scope.volumeStatus = "volume_up";
                }
            };

            /**
             * Add new video to video cache
             */
            var updateVideoCache = function () {
                var currentdate = new Date();
                var dateStr = currentdate.getDate() + "/"
                    + (currentdate.getMonth() + 1) + "/"
                    + currentdate.getFullYear();
                var timeStr = currentdate.getHours() + ":" + currentdate.getMinutes();
                var videoDetailsObj = {
                    title: $scope.videoName,
                    atDateTime: {
                        atDate: dateStr,
                        atTime: timeStr
                    }
                };
                $scope.videoCache.push(videoDetailsObj);
            };

            /**
             * Undo the latest drawing stroke
             */
            $scope.undo = function () {
                alert("undo");
            };

            var compare = function (a, b) {
                if (a.playbackTime < b.playbackTime)
                    return -1;
                else if (a.playbackTime > b.playbackTime)
                    return 1;
                else
                    return 0;
            };

            /**
             * Play video and draw over canvas
             */
            $scope.playVideo = function () {
                if (isVideoReady) {
                    var videoObject = document.getElementById("videoBackgrounddata");
                    //console.log("paused : " + videoObject.paused);
                    //console.log("ended : " + videoObject.ended);

                    //if (!utilityService.getExpertFlag() && $scope.iterator < $scope.loadedSnapshots.length) {
                    /*if ($scope.loadedSnapshots != null) {
                     if ($scope.loadedSnapshots.length > 0 && $scope.iterator < $scope.loadedSnapshots.length) {
                     $scope.nextSnapshotTime = $scope.loadedSnapshots[$scope.iterator].playbackTime;
                     $scope.nextImageElem = document.getElementById("canvasImg_" + $scope.loadedSnapshots[$scope.iterator]._id);
                     $scope.nextDuration = $scope.loadedSnapshots[$scope.iterator].duration;
                     }
                     }*/

                    $scope.savedSnapshotsData.sort(compare);
                    console.log("snapshots length:::::::: " + $scope.savedSnapshotsData.length);
                    if ($scope.savedSnapshotsData.length > 0 && $scope.iterator < $scope.savedSnapshotsData.length) {
                        $scope.nextSnapshotTime = $scope.savedSnapshotsData[$scope.iterator].playbackTime;
                        $scope.nextImageElem = document.getElementById($scope.savedSnapshotsData[$scope.iterator].imageId);
                        $scope.nextDuration = $scope.savedSnapshotsData[$scope.iterator].duration;
                    }
                    //}
                    if (videoObject.ended) {
                        //videoEnded = false;
                        videoObject.currentTime = '0';
                        videoObject.play();
                    }
                    if (videoObject.paused && !videoObject.ended) {
                        console.log("going to play video.....");
                        videoObject.play();
                        $scope.playPlauseButton = "pause_arrow";
                        // trigger enable/disable tools in toolsController
                        //$scope.$broadcast('toggleDisable');
                        //updateVideoCache();
                        drawCanvas();
                    } else {
                        videoObject.pause();
                        $scope.playPlauseButton = "play_arrow";
                        // trigger enable/disable tools in toolsController
                        //$scope.$broadcast('toggleDisable');
                        console.log("Video Paused. Stopping the video draw on canvas");
                    }
                    $scope.clearDrawings();
                }
            };
            var drawCanvas = function () {
                console.log("drawCanvas method...");
                if (!$scope.stopDrawing) {
                    var backgroundObject = document.getElementById("videoBackgrounddata");
                    if (!backgroundObject.ended && !backgroundObject.paused) {
                        if (window.requestAnimationFrame) window.requestAnimationFrame(drawCanvas);
                        // IE implementation
                        else if (window.msRequestAnimationFrame) window.msRequestAnimationFrame(drawCanvas);
                        // Firefox implementation
                        else if (window.mozRequestAnimationFrame) window.mozRequestAnimationFrame(drawCanvas);
                        // Chrome implementation
                        else if (window.webkitRequestAnimationFrame) window.webkitRequestAnimationFrame(drawCanvas);
                        // Other browsers that do not yet support feature
                        else setTimeout(drawCanvas, 16.7);
                        $scope.drawVideoOnCanvas();
                    }
                    else if (backgroundObject.ended) {
                        //$scope.videoEnded = true;
                        console.log("Video Ended. Stopping the video draw on canvas");
                        $scope.playPlauseButton = "play_arrow";
                        backgroundObject.currentTime = '0';
                        //$scope.$broadcast('toggleDisable');
                        if ($scope.iterator != 9999) {
                            $scope.iterator = 0;
                        }
                    }
                }
            };
            $scope.drawVideoOnCanvas = function () {
                console.log("drawVideoOnCanvas method...");
                var backgroundObject = document.getElementById("videoBackgrounddata");
                var width = ($scope.canvasElement.width);
                var height = ($scope.canvasElement.height);
                if ($scope.loadedSnapshots != null || $scope.savedSnapshotsData.length > 0) {
                    if (Math.abs(backgroundObject.currentTime - $scope.nextSnapshotTime) < 0.15
                        && $scope.iterator < $scope.savedSnapshotsData.length) {
                        console.log("snapshot coming for image : " + $scope.savedSnapshotsData[$scope.iterator].imageId +
                            " : at playback time... " + $scope.nextSnapshotTime);
                        backgroundObject.pause();
                        $scope.stopDrawing = true;
                        console.log("Drawing snapshot now....... ");
                        $scope.ctx.drawImage($scope.nextImageElem, 0, 0, width, height);
                        if ($scope.iterator < $scope.savedSnapshotsData.length - 1) {
                            $scope.iterator++;
                        }
                        $timeout(function () {
                            $scope.updateSnapshotDetails(backgroundObject);
                        }, $scope.nextDuration * 1000);
                    } else {
                        if ($scope.ctx) {
                            $scope.ctx.drawImage(backgroundObject, 0, 0, width, height);
                        }
                    }
                } else {
                    if ($scope.ctx) {
                        $scope.ctx.drawImage(backgroundObject, 0, 0, width, height);
                    }
                }
            };

            $scope.updateSnapshotDetails = function (backgroundObject) {
                //$scope.nextSnapshotTime = $scope.loadedSnapshots[$scope.iterator].playbackTime;
                //$scope.nextImageElem = document.getElementById("canvasImg_" + $scope.loadedSnapshots[$scope.iterator]._id);
                //$scope.nextDuration = $scope.loadedSnapshots[$scope.iterator].duration;
                $scope.stopDrawing = false;
                backgroundObject.currentTime = backgroundObject.currentTime + 0.3;
                $scope.playVideo();
            };

            /**
             * Draw text strokes
             */
            $scope.drawTextStrokes = function () {
                for (var i = 0; i < $scope.drawnText.length; i++) {
                    $scope.ctx.beginPath();
                    $scope.ctx.font = "10pt Arial";
                    $scope.ctx.fillStyle = $scope.drawnText[i].color;
                    $scope.ctx.fillText($scope.drawnText[i].value, $scope.drawnText[i].left, $scope.drawnText[i].top);
                }
            };

            // freehand pen drawing
            $scope.drawAllPenStrokes = function () {
                for (var i = 0; i < $scope.penStrokes.length; i++) {
                    var currentPen = $scope.penStrokes[i];
                    for (var j = 1; j < currentPen.length; j++) {
                        $scope.drawLine(currentPen[j - 1].posX, currentPen[j - 1].posY, currentPen[j].posX,
                            currentPen[j].posY, currentPen[j].thickness, currentPen[j].color);
                    }
                }
            };

            // lines
            $scope.drawLine = function (startX, startY, endX, endY, thickness, color) {
                $scope.ctx.beginPath();
                $scope.ctx.moveTo(startX, startY);
                $scope.ctx.lineTo(endX, endY);
                $scope.ctx.lineWidth = thickness;
                $scope.ctx.strokeStyle = color;
                $scope.ctx.stroke();
            };

            $scope.drawAllLines = function () {
                for (var i = 0; i < $scope.drawnLines.length; i++) {
                    var currentLine = $scope.drawnLines[i];
                    $scope.drawLine(currentLine.startX, currentLine.startY, currentLine.endX, currentLine.endY, currentLine.thickness, currentLine.color);
                }
            };

            // circles
            $scope.drawCircle = function (startX, startY, radius, thickness, color) {
                $scope.ctx.beginPath();
                $scope.ctx.arc(startX, startY, radius, 0, 2 * Math.PI, false);
                $scope.ctx.closePath();
                $scope.ctx.lineWidth = thickness;
                $scope.ctx.strokeStyle = color;//"#4bf";
                $scope.ctx.stroke();
            };

            $scope.drawAllCircles = function () {
                for (var i = 0; i < $scope.drawnCircles.length; i++) {
                    var currentCircle = $scope.drawnCircles[i];
                    $scope.drawCircle(currentCircle.startX, currentCircle.startY, currentCircle.radius, currentCircle.thickness, currentCircle.color);
                }
            };

            // triangles
            $scope.drawTriangle = function (startX, startY, endX, endY, thirdX, thirdY, thickness, color) {
                $scope.ctx.beginPath();
                $scope.ctx.moveTo(startX, startY);
                $scope.ctx.lineTo(endX, endY);
                $scope.ctx.lineTo(thirdX, thirdY);
                $scope.ctx.lineTo(startX, startY);
                $scope.ctx.lineWidth = thickness;
                $scope.ctx.strokeStyle = color;
                $scope.ctx.stroke();
            };

            $scope.drawAllTriangles = function () {
                for (var i = 0; i < $scope.drawnTriangles.length; i++) {
                    var currentTriangle = $scope.drawnTriangles[i];
                    $scope.drawTriangle(currentTriangle.startX, currentTriangle.startY, currentTriangle.endX, currentTriangle.endY,
                        currentTriangle.thirdX, currentTriangle.thirdY, currentTriangle.thickness, currentTriangle.color);
                }
            };

            // rectangles
            $scope.drawRectangle = function (startX, startY, width, height, thickness, color) {
                $scope.ctx.beginPath();
                $scope.ctx.rect(startX, startY, width, height);
                $scope.ctx.lineWidth = thickness;
                $scope.ctx.strokeStyle = color;
                $scope.ctx.stroke();
            };

            $scope.drawAllRectangles = function () {
                for (var i = 0; i < $scope.drawnRectangles.length; i++) {
                    var currentRectangle = $scope.drawnRectangles[i];
                    $scope.drawRectangle(currentRectangle.startX, currentRectangle.startY, currentRectangle.width, currentRectangle.height, currentRectangle.thickness, currentRectangle.color);
                }
            };

            $scope.drawUserDrawings = function () {
                $scope.drawAllTriangles();
                $scope.drawAllCircles();
                $scope.drawAllRectangles();
                $scope.drawAllLines();
                $scope.drawAllPenStrokes();
                $scope.drawTextStrokes();
            };

            $scope.clearDrawings = function () {
                $scope.drawnCircles = [];
                $scope.drawnTriangles = [];
                $scope.drawnLines = [];
                $scope.drawnRectangles = [];
                $scope.penClicks = [];
                $scope.penStrokeTemp = [];
                $scope.penStrokes = [];
                $scope.drawnText = [];
                if (videoEnded) {
                    $scope.drawVideoOnCanvas();
                }
            };

            $scope.createInputsForText = function (color, videoObject) {
                var idText = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for (var i = 0; i < 5; i++)
                    idText += possible.charAt(Math.floor(Math.random() * possible.length));
                var idContainer = idText + "_container";
                var idInputBox = idText + "_text";
                var idButton = idText + "_button";
                var leftPos = $scope.lastX;
                var topPos = $scope.lastY;
                var contentStyle = '{\"background\":\"transparent\", \"position\":\"absolute\",' +
                    '\"left\":\"' + leftPos + 'px\", \"top\":\"' + topPos + 'px\", \"width\":\"25%\", \"height\":\"25%\"}';
                var newElement =
                    "<md-content id=\"" + idContainer + "\" ng-style='" + contentStyle + "' layout-padding layout='row'>" +
                    "<md-input-container>" +
                    "<label ng-style='{\"color\":\"" + color + "\"}'>Text</label>" +
                    "<input id=\"" + idInputBox + "\" ng-style='{\"color\":\"" + color + "\"}'>" +
                    "</md-input-container>" +
                    "<md-button id=\"" + idButton + "\" ng-style='{\"color\":\"" + color + "\"}'>Apply</md-button></md-content>";
                var childNode = $compile(newElement)($scope);
                document.getElementById('canvasContainer').appendChild(childNode[0]);
                document.getElementById(idButton).onclick = function () {
                    $scope.applyText(idInputBox, idContainer, leftPos, topPos, color, videoObject);
                };
            };

            /**
             * Show snapshot attributes dialog and save snapshot
             */
            $scope.saveSnapshot = function () {
                var videoObject = document.getElementById("videoBackgrounddata");
                var durationSet = 3;
                var description = "";
                var playbackTime = videoObject.currentTime;
                $mdDialog.show({
                        controller: 'snapshotsAttributesController',
                        templateUrl: 'app/components/core/snapshotsAttributesDialog/snapshotsAttributesDialog.tpl.html',
                        locals: {
                            playbackTime: playbackTime,
                            duration: durationSet,
                            description: description
                        },
                        parent: angular.element(document.body)
                    })
                    .then(function (answer) {
                        //alert(answer[3]);
                        if (answer[3].indexOf("apply") > -1) {
                            durationSet = answer[0];
                            playbackTime = answer[1];
                            description = answer[2];
                            $scope.saveImage(playbackTime, durationSet, description);
                        } else if (answer[3].indexOf("cancel")) {
                            // do nothing
                            console.log("dialog closed");
                        }
                    }, function () {
                        console.log('text duration dialog closed');
                    });
            };
            $scope.saveImage = function (playbackTime, duration, description) {
                updateCanvas();
                var imgData = $scope.ctx.getImageData(0, 0, $scope.canvasElement.width, $scope.canvasElement.height);
                // clear strokes data from respective arrays
                $scope.clearDrawings();

                var dataURL = $scope.canvasElement.toDataURL();
                var newImage = {
                    description: description,
                    duration: duration,
                    playbackTime: playbackTime,
                    dataURL: dataURL,
                    videoName: $scope.videoName
                };
                databaseService.saveImage(newImage).then(function (data) {
                    if (data.success) {
                        var imageId = data.id;
                        appendImageToSnapshots(imageId, playbackTime, duration, description, dataURL);
                        var savedSnapshot = {
                            imageId: 'canvasImg_' + imageId,
                            playbackTime: playbackTime,
                            duration: duration,
                            description: description
                        };
                        $scope.savedSnapshotsData.push(savedSnapshot);
                    } else {
                        alert(data.message);
                    }
                });
            };

            $scope.loadImages = function () {
                console.log("loading snapshots for video : ", $scope.videoName);
                console.log(navigator.userAgent);
                console.log(navigator.platform);
                console.log(Date.now());
                databaseService.loadImages($scope.videoName).then(function (data) {
                    //databaseService.loadImages('hand.ogg').then(function (data) {
                    if (data.success) {
                        var snapshotsNode = document.getElementById("snapshots");
                        while (snapshotsNode.firstChild) {
                            snapshotsNode.removeChild(snapshotsNode.firstChild);
                        }
                        $scope.loadedSnapshots = data.images;
                        console.log("snapshots loaded .. : ", $scope.loadedSnapshots);
                        for (var i = 0; i < data.images.length; i++) {
                            var image = data.images[i];
                            $scope.loadedSnapshots[i].imageId = "canvasImg_" + data.images[i]._id;
                            appendImageToSnapshots(image._id, image.playbackTime, image.duration, image.description,
                                image.dataURL);
                        }
                        $scope.savedSnapshotsData.push.apply($scope.savedSnapshotsData, $scope.loadedSnapshots);
                        $scope.toggleLeft();
                        /*if (!utilityService.getExpertFlag()) {
                         $scope.playVideo();
                         }*/
                    }
                })
            };

            $scope.deleteSnapshot = function ($event) {
                var snapshotId = angular.element($event.currentTarget).parent().parent()[0].lastChild.id;
                snapshotId = snapshotId.split("_")[1];
                var indexInSavedSnapshotsArray = -1;
                for (var i = 0; i < $scope.savedSnapshotsData.length; i++) {
                    if ($scope.savedSnapshotsData[i].imageId == "canvasImg_" + snapshotId) {
                        indexInSavedSnapshotsArray = i;
                    }
                }
                //angular.element($event.currentTarget).parent().parent().html('');
                var playbackT = $scope.savedSnapshotsData[indexInSavedSnapshotsArray].playbackTime;
                var parent = document.getElementById("snapshots");
                var child = document.getElementById("snapshotsList_" + playbackT);
                parent.removeChild(child);
                databaseService.removeImage(snapshotId).then(function (data) {
                    if (data.success) {
                        console.log("Number of records deleted : " + data.removedSnapshots);
                        if (indexInSavedSnapshotsArray > -1) {
                            $scope.savedSnapshotsData.splice(indexInSavedSnapshotsArray, 1);
                        }
                    } else {
                        alert(data.message);
                    }
                });
            };

            $scope.editSnapshotElement = function ($event) {
                var snapshotElement = angular.element($event.currentTarget).parent().parent().parent();
                console.log(angular.element($event.currentTarget).parent().parent()[0]);
                console.log(angular.element($event.currentTarget).parent().parent()[0].lastChild.id);
                var snapshotId = angular.element($event.currentTarget).parent().parent()[0].lastChild.id;
                snapshotId = snapshotId.split("_")[1];
                var indexInSavedSnapshotsArray = -1;
                console.log("saved snapshots.........", $scope.savedSnapshotsData);
                for (var i = 0; i < $scope.savedSnapshotsData.length; i++) {
                    if ($scope.savedSnapshotsData[i].imageId == "canvasImg_" + snapshotId) {
                        console.log($scope.savedSnapshotsData[i].imageId);
                        indexInSavedSnapshotsArray = i;
                    }
                }
                var originalPlaybackTime = $scope.savedSnapshotsData[indexInSavedSnapshotsArray].playbackTime;
                var originalDuration = $scope.savedSnapshotsData[indexInSavedSnapshotsArray].duration;
                var originalDescription = $scope.savedSnapshotsData[indexInSavedSnapshotsArray].description;
                $mdDialog.show({
                        controller: 'snapshotsAttributesController',
                        templateUrl: 'app/components/core/snapshotsAttributesDialog/snapshotsAttributesDialog.tpl.html',
                        locals: {
                            playbackTime: originalPlaybackTime,
                            duration: originalDuration,
                            description: originalDescription
                        },
                        parent: angular.element(document.body)
                    })
                    .then(function (answer) {
                        var newDurationSet = answer[0];
                        var newPlaybackTime = answer[1];
                        var newDescription = answer[2];
                        document.getElementById('durationSection' + snapshotId).innerHTML = "Duration: " + newDurationSet;
                        document.getElementById('descriptionSection' + snapshotId).innerHTML = "Description: " + newDescription;
                        $scope.updateImageInfo(newPlaybackTime, newDurationSet, newDescription, snapshotId);
                    }, function () {
                        console.log('text duration dialog closed');
                    });
            };

            $scope.updateImageInfo = function (newPlaybackTime, newDurationSet, newDescription, snapshotId) {
                var imageInfo = {
                    imageId: snapshotId,
                    playbackTime: newPlaybackTime,
                    duration: newDurationSet,
                    description: newDescription
                };
                databaseService.updateImage(imageInfo).then(function (data) {
                    if (data.success) {
                        console.log("Updated records : " + data.updatedInfo);
                        for (var i = 0; i < $scope.savedSnapshotsData.length; i++) {
                            if ($scope.savedSnapshotsData[i].imageId == "canvasImg_" + snapshotId) {
                                $scope.savedSnapshotsData[i].duration = newDurationSet;
                                $scope.savedSnapshotsData[i].description = newDescription;
                            }
                        }
                    } else {
                        alert(data.message);
                    }
                });
            };

            var appendImageToSnapshots = function (imageId, playbackTime, duration, description, dataURL) {
                var snapshotElement =
                    "<md-grid-list layout-margin layout-fill layout-padding class='coverage_blue'" +
                    "id=\"snapshotsList_" + playbackTime + "\" md-cols=\"1\" md-row-height=\"" +
                    $scope.ctx.canvas.width + ":" + $scope.ctx.canvas.height + "\" " +
                    "style=\"border: 0px solid green\">" +
                    "<div style='height:30px;' layout=\"row\" layout-align='end center'>" +
                    "<md-button class=\"md-icon-button\" ng-click='editSnapshotElement($event)'>" +
                    "<md-icon>" +
                    "<i class=\"material-icons md-18\">edit</i>" +
                    "</md-icon>" +
                    "<md-tooltip>Edit</md-tooltip>" +
                    "</md-button>" +
                    "<md-button class='md-icon-button' ng-click='deleteSnapshot($event)'>" +
                    "<md-icon>" +
                    "<i class=\"material-icons md-18\">delete</i>" +
                    "</md-icon>" +
                    "<md-tooltip>Delete</md-tooltip>" +
                    "</md-button>" +
                    "</div>" +
                    "<md-grid-tile id=\"snapshot_" + imageId + "\">" +
                    "<img id=\"canvasImg_" + imageId + "\" " +
                    "style=\"position: relative; width: 100%; height: 100%;\">" +
                    "<md-grid-tile-footer layout=\"row\" layout-align=\"space-between center\">" +
                    "<h3 id=\"playbackTimeSection" + imageId + "\">Time : " + playbackTime + "</h3>" +
                    "<h3 id=\"durationSection" + imageId + "\">Duration : " + duration + "</h3>" +
                    "<h3 id=\"descriptionSection" + imageId + "\">Description : " + description + "</h3>" +
                    "</md-grid-tile-footer>" +
                    "</md-grid-tile>" +
                    "</md-grid-list>";
                var childNode = $compile(snapshotElement)($scope);
                document.getElementById('snapshots').appendChild(childNode[0]);
                // set canvasImg image src to dataURL so it can be saved as an image
                document.getElementById('canvasImg_' + imageId).src = dataURL;
            };

            var updateCanvas = function () {
                $scope.drawVideoOnCanvas();
                $scope.drawUserDrawings();
            };

            $scope.applyText = function (textId, containerId, leftPos, topPos, color, videoObject) {
                var textToWrite = {
                    value: document.getElementById(textId).value,
                    left: leftPos,
                    top: topPos,
                    color: color,
                    duration: durationSet
                };
                var durationSet = 3;
                $scope.drawnText.push(textToWrite);
                console.log("duration : " + durationSet);
                console.log("textToWrite : " + textToWrite.value);
                $scope.drawTextStrokes();
                document.getElementById(containerId).style.display = "none";
            };

            /**
             * mouseDown handler on canvas
             * @param $event
             */
            $scope.mouseDownHandler = function ($event) {
                console.log("mouse down with tool : " + $scope.drawingStyle);
                console.log("mouse down with color : " + $scope.strokeColor);
                var backgroundObject = document.getElementById("videoBackgrounddata");
                $scope.isVideoPaused = backgroundObject.paused;
                if (backgroundObject.paused) {
                    if ($event.offsetX !== undefined) {
                        $scope.lastX = ($scope.canvasElement.width / $event.currentTarget.offsetWidth) * $event.offsetX;
                        $scope.lastY = ($scope.canvasElement.height / $event.currentTarget.offsetHeight) * $event.offsetY;
                    } else {
                        $scope.lastX = ($scope.canvasElement.width / $event.currentTarget.offsetWidth) * $event.layerX;
                        $scope.lastY = ($scope.canvasElement.height / $event.currentTarget.offsetHeight) * $event.layerX;
                    }
                    console.log("X : " + $scope.lastX + " : Y : " + $scope.lastY);
                    var color = $scope.strokeColor;
                    var thickness = $scope.brushThickness;
                    if ($scope.drawingStyle.toLowerCase() == "pen") {
                        var penClick = {
                            posX: $scope.lastX,
                            posY: $scope.lastY,
                            drag: false,
                            color: color,
                            thickness: thickness
                        };
                        $scope.penStrokeTemp.push(penClick);
                    } else if ($scope.drawingStyle.toLowerCase() == "text") {
                        var videoObject = document.getElementById("videoBackgrounddata");
                        videoObject.pause();
                        $scope.createInputsForText(color, videoObject);
                    }
                    // begins new line
                    $scope.ctx.beginPath();
                    $scope.drawing = true;
                }
            };
            $scope.mouseMoveHandler = function ($event) {
                if ($scope.drawing) {

                    var currentX = 0;
                    var currentY = 0;
                    // get current mouse position
                    if ($event.offsetX !== undefined) {
                        currentX = ($scope.canvasElement.width / $event.currentTarget.offsetWidth) * $event.offsetX;
                        currentY = ($scope.canvasElement.height / $event.currentTarget.offsetHeight) * $event.offsetY;
                    } else {
                        currentX = ($scope.canvasElement.width / $event.currentTarget.offsetWidth) * $event.layerX;
                        currentY = ($scope.canvasElement.height / $event.currentTarget.offsetHeight) * $event.layerX;
                    }
                    //console.log("currentX : " + currentX + " : currentY : " + currentY);
                    var color = $scope.strokeColor;
                    var thickness = $scope.brushThickness;
                    if ($scope.drawingStyle.toLowerCase() == "pen") {
                        var penClick = {
                            posX: currentX,
                            posY: currentY,
                            drag: true,
                            color: color,
                            thickness: thickness
                        };
                        var index = $scope.penStrokeTemp.length;
                        if (index > 0) {
                            $scope.drawLine($scope.penStrokeTemp[index - 1].posX, $scope.penStrokeTemp[index - 1].posY, currentX, currentY, thickness, color)
                        }
                        $scope.penStrokeTemp.push(penClick);
                    } else if ($scope.drawingStyle.toLowerCase() == "rectangle") {
                        var width = currentX - $scope.lastX;
                        var height = currentY - $scope.lastY;
                        updateCanvas();
                        $scope.drawRectangle($scope.lastX, $scope.lastY, width, height, thickness, color);
                    } else if ($scope.drawingStyle.toLowerCase() == "line") {
                        updateCanvas();
                        $scope.drawLine($scope.lastX, $scope.lastY, currentX, currentY, thickness, color)
                    } else if ($scope.drawingStyle.toLowerCase() == "circle") {
                        updateCanvas();
                        var radius = Math.sqrt((Math.pow(Math.abs(currentX - $scope.lastX), 2) + Math.pow(Math.abs(currentY - $scope.lastY), 2)));
                        $scope.drawCircle($scope.lastX, $scope.lastY, radius, thickness, color);
                    } else if ($scope.drawingStyle.toLowerCase() == "triangle") {
                        updateCanvas();
                        var thirdX = $scope.lastX + 2 * (currentX - $scope.lastX);
                        var thirdY = $scope.lastY;
                        $scope.drawTriangle($scope.lastX, $scope.lastY, currentX, currentY, thirdX, thirdY, thickness, color);
                    }
                }
            };
            $scope.mouseUpHandler = function ($event) {
                // stop drawing
                $scope.drawing = false;
                var currentX = 0;
                var currentY = 0;
                if ($event.offsetX !== undefined) {
                    currentX = ($scope.canvasElement.width / $event.currentTarget.offsetWidth) * $event.offsetX;
                    currentY = ($scope.canvasElement.height / $event.currentTarget.offsetHeight) * $event.offsetY;
                } else {
                    currentX = ($scope.canvasElement.width / $event.currentTarget.offsetWidth) * $event.layerX;
                    currentY = ($scope.canvasElement.height / $event.currentTarget.offsetHeight) * $event.layerX;
                }
                var color = $scope.strokeColor;
                var thickness = $scope.brushThickness;
                if ($scope.drawingStyle.toLowerCase() == "pen") {
                    var penClick = {
                        posX: currentX,
                        posY: currentY,
                        drag: true,
                        color: color,
                        thickness: thickness
                    };
                    $scope.penStrokeTemp.push(penClick);
                    $scope.penStrokes.push($scope.penStrokeTemp);
                    $scope.penStrokeTemp = [];
                    updateCanvas();
                } else if ($scope.drawingStyle.toLowerCase() == "line") {
                    var drawnLine = {
                        startX: $scope.lastX,
                        startY: $scope.lastY,
                        endX: currentX,
                        endY: currentY,
                        color: color,
                        thickness: thickness
                    };
                    $scope.drawnLines.push(drawnLine);
                    updateCanvas();
                } else if ($scope.drawingStyle.toLowerCase() == "rectangle") {
                    var drawnRectangle = {
                        startX: $scope.lastX,
                        startY: $scope.lastY,
                        width: currentX - $scope.lastX,
                        height: currentY - $scope.lastY,
                        color: color,
                        thickness: thickness
                    };
                    $scope.drawnRectangles.push(drawnRectangle);
                    updateCanvas()
                } else if ($scope.drawingStyle.toLowerCase() == "circle") {
                    var drawnCircle = {
                        startX: $scope.lastX,
                        startY: $scope.lastY,
                        radius: Math.sqrt((Math.pow(Math.abs(currentX - $scope.lastX), 2) + Math.pow(Math.abs(currentY - $scope.lastY), 2))),
                        color: color,
                        thickness: thickness
                    };
                    $scope.drawnCircles.push(drawnCircle);
                    updateCanvas();

                } else if ($scope.drawingStyle.toLowerCase() == "triangle") {
                    var drawnTriangle = {
                        startX: $scope.lastX,
                        startY: $scope.lastY,
                        endX: currentX,
                        endY: currentY,
                        thirdX: $scope.lastX + 2 * (currentX - $scope.lastX),
                        thirdY: $scope.lastY,
                        color: color,
                        thickness: thickness
                    };
                    $scope.drawnTriangles.push(drawnTriangle);
                    updateCanvas();
                }
            };
        }]);