angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($rootScope, $scope, $cordovaBluetoothSerial, $timeout, $ionicModal, $interval) {
  $scope.size = 130;
  $scope.panProgress = 0.50;
  $scope.strokeWidth = 10;
  $scope.stroke = '#ef473a';
  $scope.background = '#444444';
  $scope.counterClockwise = '';

  $scope.tiltProgress = 0.50;
  $scope.counterClockwise = '';

  $rootScope.keyFrames = [];

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
    accelerationOffset : 100
  }

  $scope.pos = {
      x : 0.5,
      y : 0.5
  };

  $scope.slider = 125;

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
    if($scope.position.x !== undefined){
      return $scope.position.x;
    }
  }, function(newVal, oldVal){
    if(newVal !== oldVal){
      if($scope.offset === 167){
        if($scope.position.x === 100){
          $scope.goToXYZ(0,$scope.duration,0,0,179,495);
        } else if($scope.position.x === -100) {
          $scope.goToXYZ(0,$scope.duration,0,0,-179,-495);
        }
      } else {
        if($scope.position.y === 100){
          $scope.goToXYZ(0,$scope.duration,0,0,179,125);
        } else if($scope.position.y === -100) {
          $scope.goToXYZ(0,$scope.duration,0,0,-179,125);
        }

        if($scope.position.x === 100){
          $scope.goToXYZ(0,$scope.duration,0,179,179,125);
        } else if($scope.position.x === -100) {
          $scope.goToXYZ(0,$scope.duration,0,-179,-179,125);
        }

      }
      if($scope.position.x === 0){
        console.log('position back to 0');
        $scope.writeBluetooth(1, 'D');
      }
    }

  });

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
    $scope.writeBluetooth(1, 'D');
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

    $scope.goToXYZ(0,$scope.duration,0,pan,tilt,$scope.slider);
  }

  $scope.incSlider = function(){
    $scope.slider += 5;
  }

  $scope.fastIncSlider = function(){
    $scope.slider += 10;
  }

  $scope.decSlider = function(){
    $scope.slider -= 5;
  }

  $scope.fastDecSlider = function(){
    $scope.slider -= 10;
  }

  $scope.centerSlider = function(){
    $scope.slider = 125;
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
    console.log($scope.slider);
    console.log(pan);
    console.log(tilt);
    var keyFrame = {
      id : $rootScope.keyFrames.length,
      name : 'move ' + $rootScope.keyFrames.length,
      slider : $scope.slider,
      pan : pan,
      tilt : tilt,
      offset: 0,
      delay: 0,
      duration: 0
    }

    $rootScope.keyFrames.push(keyFrame);
    console.log($rootScope.keyFrames);
    alert('KeyFrame Added - Total: ' + $rootScope.keyFrames.length);
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

// $scope.executeRT = function (time, pan, tilt, slider) {
//   $timeout(function () {
//     $cordovaBluetoothSerial.write('E:['+ pan + ',' + tilt + ',' + slider + ']').then(
//       function() {
//         $scope.blMsgStatus = 'E:['+ pan + ',' + tilt + ',' + slider + ']';
//       },
//       function() {
//         $scope.blMsgStatus = 'Error';
//       }
//     );
//    },time);
// };

$scope.goToXYZ = function (offset, duration, delay, pan, tilt, slider) {
  // $timeout(function () {
    console.log('G:[' + offset + ',' + duration + ',' + delay + ',' + pan + ',' + tilt + ',' + slider + ']');
    $cordovaBluetoothSerial.write('G:[' + offset + ',' + duration + ',' + delay + ',' + pan + ',' + tilt + ',' + slider + ']').then(
      function() {
        $scope.blMsgStatus = 'Enabled';
      },
      function() {
        $scope.blMsgStatus = 'Disabled';
      }
    );
  // },500);
};

$scope.sendSettings = function () {
  // $timeout(function () {
  console.log('S:[' + $scope.settings.panHome + ',' + $scope.settings.tiltHome + ',' + $scope.settings.slideHome + ',' + $scope.settings.panStart + ',' + $scope.settings.tiltStart + ',' + $scope.settings.slideStart + ',' + $scope.settings.panEnd + ',' + $scope.settings.tiltEnd + ',' + $scope.settings.slideEnd + ',' + $scope.settings.slaveMode + ',' + $scope.settings.accelerationOffset + ']');
  var slaveMode = '';
  if($scope.settings.slaveMode){
    slaveMode = '1';
  } else {
    slaveMode = '0';
  }
  $cordovaBluetoothSerial.write('S:[' + $scope.settings.panHome + ',' + $scope.settings.tiltHome + ',' + $scope.settings.slideHome + ',' + $scope.settings.panStart + ',' + $scope.settings.tiltStart + ',' + $scope.settings.slideStart + ','
  + $scope.settings.panEnd + ',' + $scope.settings.tiltEnd + ',' + $scope.settings.slideEnd + ',' + slaveMode + ',' + $scope.settings.accelerationOffset + ']').then(
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
  // $timeout(function () {
    $cordovaBluetoothSerial.write(data).then(
      function() {
        $scope.blMsgStatus = data;
      },
      function() {
        $scope.blMsgStatus = 'Error';
      }
    );
  //  },time);

  //  $timeout(function () {
     $cordovaBluetoothSerial.write(data).then(
       function() {
         $scope.blMsgStatus = data;
       },
       function() {
         $scope.blMsgStatus = 'Error';
       }
     );
  //  },time + 250);

}

//////// Bluetooth Listener /////



//////////////// Bluetooth Initialization ////////////

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

  $scope.readBufferBT = function(){
    $cordovaBluetoothSerial.read().then(
      function(data) {
        $scope.bluetoothRx = data;
      },
      function(err) {
        $scope.bluetoothRx = err;
      }
    );
  }

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

  // $interval(function(){
  //   $scope.readBufferBT();
  // }, 1000);

  $scope.checkBT(2000);
  $scope.bluetoothRx = 'data';
})

.controller('MoveManagerCtrl', function($rootScope, $scope, $cordovaBluetoothSerial, $ionicModal, $timeout, $interval) {
  console.log('Hello Move Manager!');

  $ionicModal.fromTemplateUrl('templates/moveManagerModal.html', {
    scope: $scope,
    animation: false
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function(data) {
    console.log(data);
    $scope.move = {};
    $scope.move.id = data.id;
    $scope.move.name = data.name;
    $scope.move.pan = data.pan;
    $scope.move.tilt = data.tilt;
    $scope.move.slider = data.slider;
    $scope.move.offset = data.offset;
    $scope.move.delay = data.delay;
    $scope.move.duration = data.duration;

    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.saveMove = function(id) {
    console.log(id)
    console.log($rootScope.keyFrames[id]);
    $rootScope.keyFrames[id] = $scope.move;
    console.log($rootScope.keyFrames[id]);
    $scope.modal.hide();
  };

  $scope.executeStack = function() {
    console.log('exectue stack!');
    var initMsg = 'M:[' + $rootScope.keyFrames.length + ']';
    console.log(initMsg);
    var mainMsg = ''
    $scope.initMsg(1, initMsg);
    angular.forEach($rootScope.keyFrames, function(data){
      mainMsg = 'G:[' + data.offset + ',' + data.duration + ',' + data.delay + ',' + data.pan + ',' + data.tilt+ ',' + data.slider + ']';
      console.log(mainMsg);
      $scope.mainMsg(100, mainMsg);
    });
  }

  $scope.initMsg = function(time, data){
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
  }

  $scope.mainMsg = function(time, data){
    if($scope.isReceived){
      $cordovaBluetoothSerial.write(data).then(
        function() {
          $scope.blMsgStatus = data;
        },
        function() {
          $scope.blMsgStatus = 'Error';
        }
      );
    }
  }

  $scope.goToXYZ = function (offset, duration, delay, pan, tilt, slider) {
    $timeout(function () {
      //console.log('G:[' + offset + ',' + duration + ',' + delay + ',' + pan + ',' + tilt + ',' + slider + ']');
      $cordovaBluetoothSerial.write('G:[' + offset + ',' + duration + ',' + delay + ',' + pan + ',' + tilt + ',' + slider + ']').then(
        function() {
          $scope.blMsgStatus = 'Enabled';
        },
        function() {
          $scope.blMsgStatus = 'Disabled';
        }
      );
    },100);
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
  $scope.readBufferBT = function(){
    $cordovaBluetoothSerial.read().then(
      function(data) {
        $scope.bluetoothRx = data;
        if($scope.bluetoothRx === 'NN'){
          $scope.isReceived = true;
        } else {
          $scope.isReceived = true;
        }
      },
      function(err) {
        $scope.bluetoothRx = err;
      }
    );
  }
  $interval(function(){
    $scope.readBufferBT();
  }, 500);
  $scope.checkBT(2000);
})

.controller('TimeLapseCtrl', function($scope, $cordovaBluetoothSerial, $ionicModal) {
  console.log('Hello Time Lapse!');

})

.controller('BluetoothSearch', function($scope, $cordovaBluetoothSerial, $timeout) {
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
        $scope.testWrite();
      },
      function() {
        $scope.blStatus = 'Error on Connection';
      }
    );
  };

  $scope.testWriteDec = function (time, pan, tilt, slider) {
    $timeout(function () {
      $cordovaBluetoothSerial.write('E:[-50,-50,-50]').then(
        function() {
          $scope.blStatus = 'E:[-50,-50,-50]';
        },
        function() {
          $scope.blStatus = 'Error';
        }
      );
    },1);
  };

  $scope.testWrite = function (time, pan, tilt, slider) {
    $timeout(function () {
      $cordovaBluetoothSerial.write('E:[50,50,50]').then(
        function() {
          $scope.blStatus = 'E:[50,50,50]';
        },
        function() {
          $scope.blStatus = 'Error';
        }
      );
    },1);
  };

  $scope.testWriteOff = function (time, pan, tilt, slider) {
    $timeout(function () {
      $cordovaBluetoothSerial.write('D').then(
        function() {
          $scope.blStatus = 'D';
        },
        function() {
          $scope.blStatus = 'Error';
        }
      );
    },1);
  };

  $scope.checkBT(1000);
});
