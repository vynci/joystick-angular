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

.controller('PlaylistsCtrl', function($scope, $cordovaBluetoothSerial, $timeout, $cordovaCamera, $cordovaBLE, $window, $ionicModal) {

  $scope.checkBT = function (time) {
    $timeout(function () {
      $cordovaBluetoothSerial.isEnabled().then(
        function() {
          $scope.blStatus = 'success';
        },
        function() {
          $scope.blStatus = 'error';
        }
      );
     },time);
  };

  $scope.pos = {
      x : 0,
      y : 0
  };

  $scope.joystickValue = {
      x : 0,
      y : 0
  };

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
  //$scope.checkBT(2000);
  $scope.blStatus = 'null';

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


.controller('PlaylistCtrl', function($scope, $stateParams) {
});
