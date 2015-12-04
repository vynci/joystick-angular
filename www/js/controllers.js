angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, $rootScope) {

  // Form data for the login modal

})

.controller('PlaylistsCtrl', function($rootScope, $scope, $state, $cordovaBluetoothSerial, $timeout, $ionicModal, $interval, $window) {
  $scope.size = 130;
  $scope.panProgress = 0.50;
  $scope.strokeWidth = 10;
  $scope.stroke = '#ef473a';
  $scope.background = '#444444';
  $scope.counterClockwise = '';

  $scope.tiltProgress = 0.50;
  $scope.counterClockwise = '';
  $scope.isLoop = false;
  //$scope.isPantilt = false;
  function activate(){
    if($window.innerHeight < 1279 && $window.innerWidth < 799 ){
      $scope.isPhone = true;
    }
  }

  activate();
  $scope.enableLoop = function(){
    $scope.isLoop = true;
  }

  $scope.disableLoop = function(){
    $scope.isLoop = false;
  }

  $scope.settings = {
    speed : 50,
    panStart : -180,
    panEnd : 180,
    tiltStart : -180,
    tiltEnd : 180,
    slideStart : -495,
    slideEnd : 495,
    panHome : 0,
    tiltHome : 0,
    slideHome : 0,
    slaveMode : false,
    masterBoss: false,
    accelerationOffset : 100,
    distance: 2
  }

  $scope.pos = {
      x : 0.5,
      y : 0.5
  };

  $scope.currentPan = '';
  $scope.currentTilt = '';

  $scope.slider = 0;

  $scope.sliderPosition = {
    slider : 0
  }

  $scope.panTiltJoystickValue = {
      x : 0,
      y : 0
  };

  $scope.sliderJoystickValue = {
      x : 0,
      y : 0
  };

  $scope.duration = 5;

  $scope.$watch(function ( $scope ) {
    if($scope.position !== undefined){
      return $scope.position.x;
    }
  }, _.debounce(function(newVal, oldVal){
    if(newVal !== oldVal){
      if($scope.offset === 12){
        if($scope.position.x === 100){
          $scope.goToXYZ(0,$scope.duration,0,$scope.currentPan,$scope.currentTilt,495);
        } else if($scope.position.x === -100) {
          $scope.goToXYZ(0,$scope.duration,0,$scope.currentPan,$scope.currentTilt,-495);
        }
      } else {
        if($scope.position.y === 100){
          $scope.goToXYZ(0,$scope.duration,0,$scope.currentPan,179,125);
        } else if($scope.position.y === -100) {
          $scope.goToXYZ(0,$scope.duration,0,$scope.currentPan,-179,125);
        } else if($scope.position.x === 100){
          $scope.goToXYZ(0,$scope.duration,0,179,$scope.currentTilt,125);
        } else if($scope.position.x === -100) {
          $scope.goToXYZ(0,$scope.duration,0,-179,$scope.currentTilt,125);
        }
      }
      if($scope.position.x === 0){
        console.log('position back to 0');
        $scope.writeBluetooth(1, 'D]');
      }
    }

  },100));

  $scope.incDuration = function(){
    $scope.duration += 1;
  }
  $scope.decDuration = function(){
    $scope.duration -= 1;
  }

  $scope.incPan = function(){
    $scope.pos.x += 5;
  }
  $scope.decPan = function(){
    $scope.pos.x -= 5;
  }
  $scope.isSliderJoystick = false;
  $scope.isPanTiltJoystick = true;

  $scope.showSliderJoystick = function(){
    if($scope.isSliderJoystick === true){
      $scope.isSliderJoystick = false;
    } else {
      $scope.isSliderJoystick = true;
    }
  }

  $scope.showPanTiltJoystick = function(){
    if($scope.isPanTiltJoystick === true){
      $scope.isPanTiltJoystick = false;
    } else {
      $scope.isPanTiltJoystick = true;
    }
  }

  $scope.killSwitch = function(){
    $scope.writeBluetooth(1, 'D]');
  }

  $scope.updateAllPosition = function(){
    var pan = Math.floor($scope.pos.x * 360);
    var tilt = Math.floor($scope.pos.y * 360);

    if(pan > 180){
      pan -= 360;
    }
    if(tilt > 180){
      tilt -= 360;
    }
    console.log($scope.sliderPosition.slider);
    $scope.goToXYZ(0,$scope.duration,0,pan,tilt,$scope.sliderPosition.slider);
  }

  $scope.incSlider = function(){
    var tmp = parseInt($scope.sliderPosition.slider);
    $scope.sliderPosition.slider = tmp + 5;
  }

  $scope.fastIncSlider = function(){
    var tmp = parseInt($scope.sliderPosition.slider);
    $scope.sliderPosition.slider = tmp + 10;
  }

  $scope.decSlider = function(){
    $scope.sliderPosition.slider -= 5;
  }

  $scope.fastDecSlider = function(){
    $scope.sliderPosition.slider -= 10;
  }

  $scope.centerSlider = function(){
    $scope.sliderPosition.slider = 0;
  }

  $scope.addKeyFrame = function(){
    var pan = Math.floor($scope.pos.x * 360);
    var tilt = Math.floor($scope.pos.y * 360);

    if(pan > 180){
      pan -= 360;
    }
    if(tilt > 180){
      tilt -= 360;
    }

    var totalOffset = 0;

    var prevMove = $rootScope.keyFrames.keyFrames[$rootScope.keyFrames.keyFrames.length - 1];
    if(prevMove){
      totalOffset = parseInt(prevMove.duration) + parseInt(prevMove.delay) + parseInt(prevMove.offset);
      if(totalOffset !== 0){
        totalOffset += 1;
      }
    }

    var keyFrame = {
      id : $rootScope.keyFrames.keyFrames.length,
      name : 'move ' + $rootScope.keyFrames.keyFrames.length,
      slider : $scope.sliderPosition.slider,
      pan : pan,
      tilt : tilt,
      offset: totalOffset,
      delay: 0,
      duration: 0
    }

    $rootScope.keyFrames.keyFrames.push(keyFrame);
    alert('KeyFrame Added - Total: ' + $rootScope.keyFrames.keyFrames.length);
  }

  $scope.panTiltOnStart = function(id){
    $scope.isPantilt = true;
  }

  $scope.panTiltOnEnd = function(){
    console.log('release');
    console.log('position back to 0');
    $scope.writeBluetooth(1, 'D]');
    $scope.isPantilt = false;
  }
///////////////////// Modal Settings ////////////

  $ionicModal.fromTemplateUrl('templates/modal.html', {
    scope: $scope,
    animation: false
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.saveModal = function() {
    $scope.sendSettings();
    $scope.modal.hide();
  };


///////// Bluetooth Functions ////////

$scope.goToXYZ = function (offset, duration, delay, pan, tilt, slider) {
  var loop = false;

  if($scope.isLoop){
    loop = '1';
  } else {
    loop = '0';
  }
  console.log('G:[' + offset + ',' + duration + ',' + delay + ',' + pan + ',' + tilt + ',' + slider + ',' + loop + ']');
  $cordovaBluetoothSerial.write('G:[' + offset + ',' + duration + ',' + delay + ',' + pan + ',' + tilt + ',' + slider + ',' + loop + ']').then(
    function() {
      $scope.blMsgStatus = 'Enabled';
    },
    function() {
      $scope.blMsgStatus = 'Disabled';
    }
  );
};

$scope.openBTSettings = function() {
  $state.go('app.search');
}

$scope.sendSettings = function () {
  // $timeout(function () {

  var slaveMode = '';
  console.log($scope.settings.masterBoss);
  var masterBossOption = '1';
  if($scope.settings.masterBoss === 'pan-tilt'){
    masterBossOption = '1';
  } else if($scope.settings.masterBoss === 'slider'){
    masterBossOption = '1';
  } else if($scope.settings.masterBoss === 'both'){
    masterBossOption = '0';
  }

  if($scope.settings.slaveMode){
    slaveMode = '1';
  } else {
    slaveMode = '0';
  }
  var msg = 'S:[' + $scope.settings.panHome + ',' + $scope.settings.panStart + ',' + $scope.settings.panEnd + ',' + $scope.settings.tiltHome + ',' + $scope.settings.tiltStart + ',' + $scope.settings.tiltEnd + ',' + $scope.settings.slideHome + ',' + $scope.settings.slideStart + ',' + $scope.settings.slideEnd + ',' + slaveMode
  + ',' + $scope.settings.accelerationOffset + ',' + masterBossOption + ',' + $scope.settings.distance + ']';

  console.log(msg);

  $cordovaBluetoothSerial.write(msg).then(
    function() {
      $scope.blMsgStatus = 'Enabled';
    },
    function() {
      $scope.blMsgStatus = 'Disabled';
    }
  );
  // },500);
};

$scope.goHome = function(time, data){
  $cordovaBluetoothSerial.write('C:H]').then(
    function() {
      $scope.blMsgStatus = data;
    },
    function() {
      $scope.blMsgStatus = 'Error';
    }
  );
}

$scope.writeBluetooth = function(time, data){
  console.log(data);
  $timeout(function () {
    $cordovaBluetoothSerial.write(data).then(
      function() {
        $scope.blMsgStatus = data;
      },
      function() {
        $scope.blMsgStatus = 'Error';
      }
    );
   },time);

   $timeout(function () {
     $cordovaBluetoothSerial.write(data).then(
       function() {
         $scope.blMsgStatus = data;
       },
       function() {
         $scope.blMsgStatus = 'Error';
       }
     );
   },time + 250);

   $timeout(function () {
     $cordovaBluetoothSerial.write(data).then(
       function() {
         $scope.blMsgStatus = data;
       },
       function() {
         $scope.blMsgStatus = 'Error';
       }
     );
   },time + 250);

   $timeout(function () {
     $cordovaBluetoothSerial.write(data).then(
       function() {
         $scope.blMsgStatus = data;
       },
       function() {
         $scope.blMsgStatus = 'Error';
       }
     );
   },time + 250);


}

//////// Bluetooth Listener /////
$scope.readBufferBT = function(){
  $cordovaBluetoothSerial.read().then(
    function(data) {
      console.log('read: ', data);
      if(data !== ''){
        console.log('Received: ' + data);
      }

      if(data === 'E:0'){
        alert('Request Re-Transmission!');
      }

      var tmp = data.split(',');
      var pan = tmp[0].split('P');

      pan = pan[2];
      var tilt = tmp[1];
      var slider = tmp[2];

      if(pan !== undefined && tilt !== undefined){
        $scope.currentPan = pan;
        $scope.currentTilt = tilt;
        $scope.bluetoothRx = 'Pan: ' + pan + ' - ' + 'Tilt: ' + tilt + ' - ' + 'Slider: ' + slider;
      }

    },
    function(err) {
      $scope.bluetoothRx = err;
    }
  );
}

var bluetoothReadInterval = '';


function destroyBluetoothInterval(){
  $interval.cancel(bluetoothReadInterval);
}

$scope.$on('$ionicView.beforeLeave', function (event) {
  console.log('destroy! rawr');
  var pan = Math.floor($scope.pos.x * 360);
  var tilt = Math.floor($scope.pos.y * 360);

  if(pan > 180){
    pan -= 360;
  }
  if(tilt > 180){
    tilt -= 360;
  }

  $rootScope.currentControlPosition = {
    pan : pan,
    tilt : tilt,
    slider : $scope.sliderPosition.slider
  }
  destroyBluetoothInterval();
});

$scope.$on('$ionicView.enter', function (event) {
  console.log('enter the dragon!');
  console.log()
  bluetoothReadInterval = $interval(function(){
    $scope.readBufferBT();
  }, 75);
});

// $window.bluetoothSerial.subscribe('\n', function (data) {
//   $scope.bluetoothRx = data;
// //do something with data
// });

//////////////// Bluetooth Initialization ////////////

  $scope.checkBT = function (time) {
    $timeout(function () {
      $cordovaBluetoothSerial.isConnected().then(
        function() {
          $scope.blMsgStatus = 'Enabled';
          $scope.isBluetoothConnected = true;
        },
        function() {
          $scope.blMsgStatus = 'Disabled';
          $scope.connectBT($rootScope.bluetoothId);
          $scope.isBluetoothConnected = false;
          $scope.bluetoothRx = 'Bluetooth Currently Disabled';
        }
      );
     },time);
  };

  $scope.connectBT = function(id) {
    $cordovaBluetoothSerial.connect(id).then(
      function() {
        $rootScope.bluetoothId = id;
        $scope.blMsgStatus = 'Successfully Connected';
        $scope.isBluetoothConnected = true;
        $scope.subscribeBT();
      },
      function() {
        $scope.blMsgStatus = 'Error on Connection';
        $scope.isBluetoothConnected = false;
      }
    );
  };



  $scope.readAvailableBT = function(){

    $cordovaBluetoothSerial.available().then(
      function(data) {
        $scope.bluetoothAvailable = data;
        if(data !== 0){
          $scope.readBufferBT();
        }
        return data;
      },
      function(err) {
        $scope.bluetoothAvailable = err;
        return err;
      }
    );
  }

  $scope.checkBT(1000);
  $scope.bluetoothRx = 'Reading Data From Bluetooth...';
})

.controller('TimeLapseCtrl', function($scope, $cordovaBluetoothSerial, $ionicModal, $timeout ) {
  console.log('Hello Time Lapse!');
  $scope.panStart = -90;
  $scope.panEnd = 90;

  $scope.tiltStart = 0;
  $scope.tiltEnd = 0;

  $scope.sliderStart = -490;
  $scope.sliderEnd = 490;

  $scope.duration = 60;
  $scope.shotsReq= 5;
  $scope.shutterDelay = 500;
  $scope.stabilizeDelay = 500;

  $scope.execute = function(){
    var msg = 't:[' + $scope.duration + ',' + $scope.shotsReq + ',' + $scope.panStart + ','
    + $scope.panEnd + ',' + $scope.tiltStart + ',' + $scope.tiltEnd + ',' + $scope.sliderStart + ','
    + $scope.sliderEnd + ',' + $scope.shutterDelay + ',' + $scope.stabilizeDelay + ']';

    console.log(msg);

    $scope.mainMsg(1, msg);

  }

  $scope.mainMsg = function(time, data){
    //$timeout(function () {
    $cordovaBluetoothSerial.write(data).then(
      function() {
        $scope.blMsgStatus = data;
      },
      function() {
        $scope.blMsgStatus = 'Error';
      }
    );
    //},time);
  }

  $scope.connectBT = function(id) {
    $cordovaBluetoothSerial.connect(id).then(
      function() {
        $rootScope.bluetoothId = id;
        $scope.blMsgStatus = 'Successfully Connected';
        $scope.subscribeBT();
      },
      function() {
        $scope.blMsgStatus = 'Error on Connection';
      }
    );
  };
  $scope.checkBT = function (time) {
    $timeout(function () {
      $cordovaBluetoothSerial.isConnected().then(
        function() {
          $scope.blMsgStatus = 'Enabled';
        },
        function() {
          $scope.blMsgStatus = 'Disabled';
          $scope.connectBT($rootScope.bluetoothId);
        }
      );
    },time);
  };

  $scope.checkBT(1000);

})

.controller('BluetoothSearch', function($state, $ionicHistory, $scope, $cordovaBluetoothSerial, $timeout, $rootScope) {
  $scope.blStatus = 'Disabled';
  console.log($cordovaBluetoothSerial);
  $scope.checkBT = function (time) {
    $timeout(function () {
      $cordovaBluetoothSerial.isEnabled().then(
        function() {
          $scope.blStatus = 'Enabled';
        },
        function() {
          $scope.blStatus = 'Disabled';
          $cordovaBluetoothSerial.enable().then(
            function() {
              $scope.blStatus = 'Enabled';
            },
            function() {
              $scope.blStatus = 'Disabled';
            }
          );
        }
      );
     },time);
  };

  $scope.listBT = function() {
    $cordovaBluetoothSerial.list().then(
      function(devices) {
        $scope.btDevices = devices;
      },
      function() {
        $scope.blStatus = 'Error on Discover';
      }
    );
  };

  $scope.connectBT = function(id) {
    $cordovaBluetoothSerial.connect(id).then(
      function() {
        $rootScope.bluetoothId = id;
        $scope.blStatus = 'Successfully Connected';
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go('app.playlists');
        alert('Successfully Connected');
      },
      function() {
        $scope.blStatus = 'Error on Connection';
        alert('Cannot Connect');
      }
    );
  };

  $scope.checkBT(1000);
});
