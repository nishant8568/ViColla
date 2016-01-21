// videochatModule.config(function ($stateProvider) {
//     $stateProvider
//       .state('videoChatuser', {
//         url: '/videoChatuser',
//         templateUrl: 'app/components/core/video-chat/video-chat.tpl.html',
//         controller: 'videoChatController'
//       });
// });
videochatModule.controller('videoChatController', ['$scope', '$http', 'authService', 'databaseService', '$stateParams',
    '$location', '$window', '$timeout', 'config', '$mdDialog', 'socket', '$state',
    function ($scope, $http, authService, databaseService, $stateParams, $location,
              $window, $timeout, config, $mdDialog, socket, $state) {
        'use strict';
        var vm = this;
        var sendChannel;
        var isChannelReady = $scope.$parent.isChannelReady;
        var isInitiator = $scope.$parent.isInitiator;
        var room = $scope.$parent.room;
        var isStarted;
        var localStream;
        var pc = null;
        var remoteStream;
        var turnReady;
        var mediaRecorder;

        var username = localStorage.getItem('username');
        $scope.isExpert = $scope.$parent.isExpert;

        $scope.options = $scope.$parent.options;

        $scope.optionSelected = "call";
        $scope.isCollaborating = false;

        var object, backgroundObject, canvasWidth, canvasHeight, canvas, context;
        var selectedR = 10;
        var selectedG = 120;
        var selectedB = 60;
        // Collaboration Canvas related variables
        var initializeCollaborationEnvironment = function () {
            canvasWidth = ($window.innerWidth) * 0.5;
            canvasHeight = ($window.innerHeight) * 0.6;
            //canvasWidth = (document.getElementById("helperCanvas").offsetWidth) * 0.9;
            //canvasHeight = (document.getElementById("helperCanvas").offsetHeight) * 0.9;
            if ($scope.isExpert) {
                object = document.getElementById("localVideo");
                backgroundObject = document.getElementById("remoteVideo");
            } else {
                object = document.getElementById("remoteVideo");
                backgroundObject = document.getElementById("localVideo");
            }
            canvas = document.getElementById("helpCanvas");
            canvas.setAttribute('width', canvasWidth);
            canvas.setAttribute('height', canvasHeight);

            if (canvas.getContext) {
                context = canvas.getContext('2d');
            }
        };

        $scope.optionClicked = function (option) {
            switch (option.name) {
                case "call":
                    $scope.isCollaborating = false;
                    $scope.optionSelected = "call";
                    socket.emit('stopCollaborating', JSON.stringify(username));
                    //$state.go("tabs.onlineM.call");
                    break;
                case "collaborate":
                    $scope.isCollaborating = true;
                    $scope.optionSelected = "collaborate";
                    socket.emit('collaborating', JSON.stringify(username));
                    initializeCollaborationEnvironment();
                    draw();
                    //$state.go("tabs.onlineM.collaborate");
                    break;
                case "annotate":
                    $scope.optionSelected = "annotate";
                    //$state.go("tabs.onlineM.annotate");
                    break;
            }
            $scope.$parent.optionSelected = option.name;
        };

        socket.on('collaborate', function (caller) {
            var callerDetails = JSON.parse(caller);
            console.log("collaborating request from..... : " + callerDetails);
            console.log("username...... : " + username);
            if (callerDetails != username) {
                console.log("collaborating request from : " + callerDetails);
                $scope.isCollaborating = true;
                initializeCollaborationEnvironment();
                draw();

            }
        });

        socket.on('stopCollaboration', function (caller) {
            var callerDetails = JSON.parse(caller);
            console.log("End-collaboration request from..... : " + callerDetails);
            console.log("username...... : " + username);
            if (callerDetails != username) {
                console.log("end-collaboration request from : " + callerDetails);
                $scope.isCollaborating = false;
            }
        });

        var draw = function () {
            if ($scope.isCollaborating) {
                if (window.requestAnimationFrame) window.requestAnimationFrame(draw);
                // IE implementation
                else if (window.msRequestAnimationFrame) window.msRequestAnimationFrame(draw);
                // Firefox implementation
                else if (window.mozRequestAnimationFrame) window.mozRequestAnimationFrame(draw);
                // Chrome implementation
                else if (window.webkitRequestAnimationFrame) window.webkitRequestAnimationFrame(draw);
                // Other browsers that do not yet support feature
                else $timeout(draw, 16.7);
                drawVideosOnCanvas();
            } else {
                console.log("Drawing on canvas stopped. Collaboration stopped...");
            }
        };

        var drawVideosOnCanvas = function () {
            //var width = ($window.innerWidth) * 0.6;
            //var height = ($window.innerHeight) * 0.6;

            //if (canvas.getContext) {

            console.log('drawing .... ');
            context.drawImage(backgroundObject, 0, 0, canvasWidth, canvasHeight);
            var imgDataBackground = context.getImageData(0, 0, canvasWidth, canvasHeight);
            context.drawImage(object, 0, 0, canvasWidth, canvasHeight);
            var imgDataNormal = context.getImageData(0, 0, canvasWidth, canvasHeight);

            var imgData = context.createImageData(canvasWidth, canvasHeight);

            // Function to manipulate pixels of canvas
            manipulateImageData(imgData, imgDataNormal, imgDataBackground);
        };

        var manipulateImageData = function (imgData, imgDataNormal, imgDataBackground) {
            for (var i = 0; i < imgData.width * imgData.height * 4; i += 4) {
                var r = imgDataNormal.data[i + 0];
                var g = imgDataNormal.data[i + 1];
                var b = imgDataNormal.data[i + 2];
                var a = imgDataNormal.data[i + 3];
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
            context.putImageData(imgData, 0, 0);
        };

        $scope.endCall = function (callStatus) {
            var callEndDateTime = Date.now();
            var callerdetails = $scope.$parent.callerdetails;
            var callingData = {};
            callingData._caller = callerdetails.callerinfo.id;
            callingData._receiver = callerdetails.receiverinfo.id;
            callingData.callerFirstName = callerdetails.callerinfo.firstName;
            callingData.callerLastName = callerdetails.callerinfo.lastName;
            callingData.callername = callerdetails.callerinfo.username;
            callingData.receivername = callerdetails.receiverinfo.username;
            callingData.receiverFirstName = callerdetails.receiverinfo.firstName;
            callingData.receiverLastName = callerdetails.receiverinfo.lastName;
            callingData.status = callStatus;
            callingData.startDate = callerdetails.startDateTime;
            callingData.duration = callEndDateTime - callerdetails.startDateTime;
            callingData.callerDesignation = callerdetails.callerinfo.designation;
            callingData.receiverDesignation = callerdetails.receiverinfo.designation;
            callingData.receiverLogoFilename = callerdetails.receiverinfo.logoFilename;
            callingData.callerLogoFilename = callerdetails.callerinfo.logoFilename;


            alert("callend.. Sending POST request to save to call history.. : " + JSON.stringify(callingData));
            console.log(callerdetails);
            $http.post('/api/callHistory', callingData).success(function (calldetails) {
                alert(JSON.stringify(calldetails));
            });

            console.log("callend:", callingData);
            socket.emit('callending', JSON.stringify(callingData));
            hangup();
        };

        $scope.isoffercall = false;
        $scope.userlist = [];

        console.log("Setting ICE Server URL in pc_config : ", config.stunurl);
        var pc_config = {'iceServers': [{'urls': config.stunurl}]};

        /*var pc_config = webrtcDetectedBrowser === 'firefox' ?
         {'iceServers': [{'url': config.stunip}]} : // number IP
         {'iceServers': [{'url': config.stunurl}]};*/

        var pc_constraints = {
            'optional': [
                {'DtlsSrtpKeyAgreement': true},
                {'RtpDataChannels': true}
            ]
        };

        // Set up audio and video regardless of what devices are present.
        var sdpConstraints;
        if (navigator.mozGetUserMedia) {
            console.log("Setting sdpConstraints for firefox.....");
            sdpConstraints = {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true,
                mozDontOfferDataChannel: true
            };
        } else if (navigator.webkitGetUserMedia) {
            console.log("Setting sdpConstraints for chrome.....");
            sdpConstraints = {
                'mandatory': {
                    'OfferToReceiveAudio': true,
                    'OfferToReceiveVideo': true
                }
            };
        }

        /////////////////////////////////////////////

        $scope.busy = false;
        var answer = false;
        var modalCallShow = false;


        socket.on('full', function (room) {
            console.log('Room ' + room + ' is full');
        });

        ////////////////////////////////////////////////

        function sendMessage(message) {
            socket.emit('message', message);
        }


        socket.on('message', function (message) {
            console.log("received message", message);
            if (message === 'got user media') {
                $timeout(function () {
                    maybeStart();
                }, 1000);
            } else if (message.type === 'offer') {
                if ($scope.$parent.callerdetails.receivername == username) {
                    var confirm = $mdDialog.confirm({
                        controller: 'incomingCallDialogController',
                        templateUrl: 'app/components/core/incomingCallDialog/incomingCallDialog.tpl.html',
                        locals: {message: message, callerinfo: $scope.$parent.callerdetails.callerinfo},
                        parent: angular.element(document.body)
                    });
                    if (!modalCallShow) {
                        $mdDialog.show(confirm).then(function (answer) {
                            if (typeof answer != 'undefined') {
                                if (pc == null) {
                                    maybeStart();
                                }
                                if (!$scope.$parent.isInitiator && !isStarted) {
                                    console.log("rare offer received");
                                    maybeStart();
                                }
                                console.log("Setting remote description.....");
                                pc.setRemoteDescription(new RTCSessionDescription(message.sessiondescription));
                                doAnswer();
                            } else {
                                $scope.endCall('call_missed');
                            }
                        }, function () {
                            console.log('incoming call dialog closed');
                        });
                    }
                    modalCallShow = true;
                }
            }
            else if (message.type === 'answer' && isStarted) {
                console.log(message.answername + " answered the call");
                $scope.busy = true;
                pc.setRemoteDescription(new RTCSessionDescription(message.sessiondescription));
            } else if (message.type === 'candidate' && isStarted) {
                console.log("received candidate from remote and added");
                var candidate = new RTCIceCandidate({
                    sdpMLineIndex: message.label,
                    candidate: message.candidate
                });
                pc.addIceCandidate(candidate);
            }
        });

        $scope.$on('$destroy', function (event) {
            //stop();
        });
        ////////////////////////////////////////////////////

        var localVideo = document.querySelector('#localVideo');
        var remoteVideo = document.querySelector('#remoteVideo');

        function handleUserMedia(stream) {
            console.log("handleUserMedia >> stream.... ", stream);
            localStream = stream;
            attachMediaStream(localVideo, stream);
            console.log('Adding local stream >> send message "got user media" ');
            if (!isStarted) {
                sendMessage('got user media');
            }
        }

        socket.on('callended', function (callend) {
            var callenddetails = JSON.parse(callend);
            console.log(callenddetails.to);
            if (callenddetails.to == username) {
                $scope.busy = false;
                hangup();
            }
            hangup();
        });

        function handleUserMediaError(error) {
            console.log('getUserMedia error: ', error);
        }

        var constraints = {video: true, audio: true};

        getUserMedia(constraints, handleUserMedia, handleUserMediaError);

        /*if (location.hostname != "localhost") {
         requestTurn('https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913');
         }*/

        function maybeStart() {
            console.log("maybeStart.....");
            console.log("localstream : " + localStream + " , $scope.$parent.isChannelReady : " + $scope.$parent.isChannelReady);
            if (localStream && $scope.$parent.isChannelReady) {
                createPeerConnection();
                pc.addStream(localStream);
                isStarted = true;
                if ($scope.$parent.isInitiator) {
                    console.log("I am the initiator. Initiating call....");
                    doCall();
                }
            }
        }

        $window.onbeforeunload = function (event) {
            if (window.confirm("do you want reload")) {
                $scope.logout();
            }
            $scope.userlist = [];
        };


        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        function createPeerConnection() {
            try {
                console.log("creating RTC Peer Connection.....");
                pc = new RTCPeerConnection(pc_config, pc_constraints);
                pc.onicecandidate = handleIceCandidate;
                console.log("connection state : ", pc.iceConnectionState);
            } catch (e) {
                console.log('Failed to create PeerConnection, exception: ' + e.message);
                alert('Cannot create RTCPeerConnection object.');
                return;
            }
            pc.onaddstream = handleRemoteStreamAdded;
            pc.onremovestream = handleRemoteStreamRemoved;

            if ($scope.$parent.isInitiator) {
                try {
                    // Reliable Data Channels not yet supported in Chrome
                    sendChannel = pc.createDataChannel("sendDataChannel",
                        {reliable: false});
                    sendChannel.onmessage = handleMessage;
                    trace('Created send data channel');
                } catch (e) {
                    alert('Failed to create data channel. ' +
                        'You need Chrome M25 or later with RtpDataChannel enabled');
                    trace('createDataChannel() failed with exception: ' + e.message);
                }
                sendChannel.onopen = handleSendChannelStateChange;
                sendChannel.onclose = handleSendChannelStateChange;
            } else {
                pc.ondatachannel = gotReceiveChannel;
            }
        }


        function gotReceiveChannel(event) {
            trace('Receive Channel Callback');
            sendChannel = event.channel;
            sendChannel.onmessage = handleMessage;
            sendChannel.onopen = handleReceiveChannelStateChange;
            sendChannel.onclose = handleReceiveChannelStateChange;
        }

        function handleMessage(event) {
            trace('Received message: ' + event.data);
        }

        function handleSendChannelStateChange() {
            var readyState = sendChannel.readyState;
            trace('Send channel state is: ' + readyState);
        }

        function handleReceiveChannelStateChange() {
            var readyState = sendChannel.readyState;
            trace('Receive channel state is: ' + readyState);
        }


        function handleIceCandidate(event) {
            if (event.candidate) {
                sendMessage({
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                });
            }
        }

        function doCall() {
            //var constraints = {"mozDontOfferDataChannel": true};
            // temporary measure to remove Moz* constraints in Chrome
            if (webrtcDetectedBrowser === 'chrome') {
                for (var prop in constraints.mandatory) {
                    if (prop.indexOf('Moz') !== -1) {
                        delete constraints.mandatory[prop];
                    }
                }
            }
            console.log("doCall >> initiating call.....");
            //constraints = mergeConstraints(constraints, sdpConstraints);
            pc.createOffer(setLocalAndSendOffer, handleCreateOfferError, sdpConstraints);
        }

        function handleCreateOfferError(error) {
            console.log('createOffer() error: ', e);
        }

        function doAnswer() {
            console.log("going to create answer.............");
            pc.createAnswer(setLocalAndSendAnswer, handleCreateAnswerError, sdpConstraints);
            $scope.busy = true;
            //$scope.$apply();
        }

        function handleCreateAnswerError(error) {
            console.log('createAnswer() error: ', e);
        }

        function mergeConstraints(cons1, cons2) {
            var merged = cons1;
            for (var name in cons2.mandatory) {
                merged.mandatory[name] = cons2.mandatory[name];
            }
            merged.optional.concat(cons2.optional);
            return merged;
        }

        function setLocalAndSendOffer(sessionDescription) {
            console.log("setLocalAndSendOffer : session description : ..... ", sessionDescription);
            // Set Opus as the preferred codec in SDP if Opus is present.
            //sessionDescription.sdp = preferOpus(sessionDescription.sdp);
            pc.setLocalDescription(sessionDescription);
            sendMessage({
                sessiondescription: sessionDescription,
                callername: username,
                type: 'offer'
            });
        }

        function setLocalAndSendAnswer(sessionDescription) {
            console.log("setLocalAndSendAnswer : session description : ..... ", sessionDescription);
            // Set Opus as the preferred codec in SDP if Opus is present.
            //sessionDescription.sdp = preferOpus(sessionDescription.sdp);
            pc.setLocalDescription(sessionDescription);
            sendMessage({
                sessiondescription: sessionDescription,
                answername: username,
                type: 'answer'
            });
        }

        function requestTurn(turn_url) {
            var turnExists = false;
            for (var i in pc_config.iceServers) {
                if (pc_config.iceServers[i].url.substr(0, 5) === 'turn:') {
                    turnExists = true;
                    turnReady = true;
                    break;
                }
            }
            console.log("turn ..... " + turnExists);
            console.log("turn ..... " + turn_url);
            if (!turnExists) {
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        var turnServer = JSON.parse(xhr.responseText);
                        // console.log('Got TURN server: ', turnServer);
                        pc_config.iceServers.push({
                            'url': 'turn:' + turnServer.username + '@' + turnServer.turn,
                            'credential': turnServer.password
                        });
                        turnReady = true;
                    }
                };
                xhr.open('GET', turn_url, true);
                xhr.setRequestHeader('Content-Type', 'application/xml');
                xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
                xhr.send();
            }
        }

        function handleRemoteStreamAdded(event) {
            console.log('Remote stream added.');
            attachMediaStream(remoteVideo, event.stream);
            console.log("adding remote stream", event.stream);
            remoteStream = event.stream;
        }

        function handleRemoteStreamRemoved(event) {
            console.log('Remote stream removed. Event: ', event);
        }

        function hangup() {
            console.log('Hanging up.');
            stop();
            sendMessage('bye');
        }

        function handleRemoteHangup() {
            console.log('Session terminated.');
            stop();
        }

        function stop() {
            console.log("values reset");
            $scope.$parent.isInitiator = false;
            isStarted = false;
            $scope.busy = false;
            if (pc) {
                pc.close();
            }
            pc = null;
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Set Opus as the default audio codec if it's present.
        function preferOpus(sdp) {
            var sdpLines = sdp.split('\r\n');
            var mLineIndex;
            // Search for m line.
            for (var i = 0; i < sdpLines.length; i++) {
                if (sdpLines[i].search('m=audio') !== -1) {
                    mLineIndex = i;
                    break;
                }
            }
            if (mLineIndex === null) {
                return sdp;
            }

            // If Opus is available, set it as the default in m line.
            for (i = 0; i < sdpLines.length; i++) {
                if (sdpLines[i].search('opus/48000') !== -1) {
                    var opusPayload = extractSdp(sdpLines[i], /:(\d+) opus\/48000/i);
                    if (opusPayload) {
                        sdpLines[mLineIndex] = setDefaultCodec(sdpLines[mLineIndex], opusPayload);
                    }
                    break;
                }
            }

            // Remove CN in m line and sdp.
            sdpLines = removeCN(sdpLines, mLineIndex);

            sdp = sdpLines.join('\r\n');
            return sdp;
        }

        function extractSdp(sdpLine, pattern) {
            var result = sdpLine.match(pattern);
            return result && result.length === 2 ? result[1] : null;
        }

        // Set the selected codec to the first in m line.
        function setDefaultCodec(mLine, payload) {
            var elements = mLine.split(' ');
            var newLine = [];
            var index = 0;
            for (var i = 0; i < elements.length; i++) {
                if (index === 3) { // Format of media starts from the fourth.
                    newLine[index++] = payload; // Put target payload to the first.
                }
                if (elements[i] !== payload) {
                    newLine[index++] = elements[i];
                }
            }
            return newLine.join(' ');
        }

        // Strip CN from sdp before CN constraints is ready.
        function removeCN(sdpLines, mLineIndex) {
            var mLineElements = sdpLines[mLineIndex].split(' ');
            // Scan from end for the convenience of removing an item.
            for (var i = sdpLines.length - 1; i >= 0; i--) {
                var payload = extractSdp(sdpLines[i], /a=rtpmap:(\d+) CN\/\d+/i);
                if (payload) {
                    var cnPos = mLineElements.indexOf(payload);
                    if (cnPos !== -1) {
                        // Remove CN payload from m line.
                        mLineElements.splice(cnPos, 1);
                    }
                    // Remove CN line in sdp
                    sdpLines.splice(i, 1);
                }
            }

            sdpLines[mLineIndex] = mLineElements.join(' ');
            return sdpLines;
        }
    }]);