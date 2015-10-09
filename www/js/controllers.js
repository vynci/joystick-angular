angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

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

.controller('PlaylistsCtrl', function($scope, $cordovaBluetoothSerial, $timeout, $ionicModal) {

  $scope.executeRT = function (time, pan, tilt, slider) {
    $timeout(function () {
      $cordovaBluetoothSerial.write('E:['+ pan.x + ',' + tilt.y + ',' + slider + ']').then(
        function() {
          $scope.blMsgStatus = 'E:['+ pan.x + ',' + tilt.y + ',' + slider + ']';
        },
        function() {
          $scope.blMsgStatus = 'Error';
        }
      );
     },time);
  };

  $scope.goToXYZ = function (time) {
    $timeout(function () {
      $cordovaBluetoothSerial.write('G:[0,0,0,' + $scope.panTiltJoystickValue.x + ',' + $scope.panTiltJoystickValue.y + ',' + $scope.panTiltJoystickValue.x + ']').then(
        function() {
          $scope.blMsgStatus = 'Enabled';
        },
        function() {
          $scope.blMsgStatus = 'Disabled';
        }
      );
     },time);
  };

  $scope.pos = {
      x : 0,
      y : 0
  };

  $scope.panTiltJoystickValue = {
      x : 0,
      y : 0
  };

  $scope.sliderJoystickValue = {
      x : 0,
      y : 0
  };

  $scope.$watch(function ( $scope ) {
       return $scope.position;
  }, function(newVal, oldVal){
    // $scope.executeRT(1000);
    if($scope.offset === 167){
      console.log('0,0,' + $scope.position.x);
      scope.executeRT(100, 0,0,$scope.position.x);
    } else {
      console.log($scope.position.x + ',' + $scope.position.y + ',0');
      $scope.executeRT(100, $scope.position.x, $scope.position.y, 0);
    }
  });

  $scope.onPanSlide = function onSlide (value) {
    console.log('on Pan slide  ' + value);
    $scope.pos.x = value;
  }

  $scope.onPanSlideEnd = function onSlideEnd(value) {
    console.log('on Pan slide end  ' + value);
    $scope.pos.x = value;
  }

  $scope.onTiltSlide = function onSlide (value) {
    console.log('on Tilt slide  ' + value);
    $scope.pos.y = value;
  }

  $scope.onTiltSlideEnd = function onSlideEnd(value) {
    console.log('on Tilt slide end  ' + value);
    $scope.pos.y = value;
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

  $scope.slider = 125;

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

  $scope.checkBTConnection = function (time) {
    $timeout(function () {
      $cordovaBluetoothSerial.isConnected().then(
        function() {
          $scope.blMsgStatus = 'Connected';
        },
        function() {
          $scope.blMsgStatus = 'Disconnected';
        }
      );
     },time);
  };
  $scope.checkBTConnection(1000);

})

.controller('MoveManagerCtrl', function($scope, $cordovaBluetoothSerial, $ionicModal) {
  console.log('Hello Move Manager!');

  $ionicModal.fromTemplateUrl('templates/moveManagerModal.html', {
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
        $scope.blStatus = 'Successfully Connected';
        $scope.testWrite();
      },
      function() {
        $scope.blStatus = 'Error on Connection';
      }
    );
  };

  $scope.testWrite = function (time, pan, tilt, slider) {
    $cordovaBluetoothSerial.write('E:[0,0,0]').then(
      function() {
        $scope.blStatus = 'E:[0,0,0]';
      },
      function() {
        $scope.blStatus = 'Error';
      }
    );
  };

  $scope.checkBT(1000);
});
