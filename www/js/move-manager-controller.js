angular.module('starter.move-manager', [])

.controller('MoveManagerCtrl', function($rootScope, $scope, $cordovaBluetoothSerial, $ionicModal, $timeout, $interval, $cordovaFile, $state, $ionicPopup) {
  console.log('hello move manager!');
  $scope.inputs = {
    fileName : ''
  }
  $scope.totalTime = '';
  $scope.totalTimeHeader = '';
  activate();
  function activate(){
    console.log('activate');
    $scope.totalTime = 0;
    angular.forEach($rootScope.keyFrames.keyFrames, function(data){
      $scope.totalTime += ( parseInt(data.duration) + parseInt(data.delay) );
      console.log($scope.totalTime);
      convertSecondsToTime();
    });
  }

  function convertSecondsToTime(){
    var totalSec = $scope.totalTime;
    var hours = parseInt( totalSec / 3600 ) % 24;
    var minutes = parseInt( totalSec / 60 ) % 60;
    var seconds = totalSec % 60;

    var result = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
    $scope.totalTimeHeader = result;
  }
  $scope.saveStack = function( fileName ) {
    if($rootScope.keyFrames.stackId !== '' && fileName === undefined){
      alert('overwrite!');
      document.addEventListener('deviceready', function () {
        alert('overwriting on ' + $rootScope.keyFrames.stackId);
        // _.each($rootScope.moveStacks, function(moveStack){
        //   if(moveStack === $rootScope.keyFrames.stackId){
        //     $rootScope.moveStacks[_.indexOf($rootScope.moveStacks, moveStack)].keyFrames = $rootScope.keyFrames.keyFrames;
        //   }
        // });
        $rootScope.moveStacks[$rootScope.keyFrames.stackId].keyFrames = $rootScope.keyFrames.keyFrames;
        console.log($rootScope.moveStacks);
        $cordovaFile.writeFile(cordova.file.dataDirectory, 'autoCraneFile20.json', $rootScope.moveStacks, true)
         .then(function (success) {
           alert('success!');
         }, function (error) {
           $scope.bluetoothRx = 'error';
        });
      });
    } else {
      document.addEventListener('deviceready', function () {
        var data = {
          stackId : $rootScope.moveStacks.length,
          stackName : fileName,
          keyFrames : $rootScope.keyFrames.keyFrames
        }
        $rootScope.moveStacks.push(data);
        $cordovaFile.writeFile(cordova.file.dataDirectory, 'autoCraneFile20.json', $rootScope.moveStacks, true)
         .then(function (success) {
           alert('Created New Stack');
           $scope.bluetoothRx = 'file ' + data.stackName + ' saved!';
         }, function (error) {
           $scope.bluetoothRx = 'error';
        });
      });
    }

  }
  $scope.saveAsStack = function() {
    $scope.showPopup('saveAs');
  }

  $scope.showPopup = function( flag ) {
    $scope.data = {}

    // An elaborate, custom popup
    if($rootScope.keyFrames.stackId !== '' && flag !== 'saveAs'){
      $scope.saveStack();
    } else {
      var myPopup = $ionicPopup.show({
        template: '<input type="text" ng-model="data.move">',
        title: 'Enter Stack Name',
        subTitle: 'Please use normal things',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'button-balanced',
            onTap: function(e) {
              if (!$scope.data.move) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $scope.data.move;
              }
            }
          }
        ]
      });
      myPopup.then(function(res) {
        console.log('Tapped!', res);
        if(res){
          $scope.saveStack(res);
        }

      });
    }

 };

  $scope.loadStack = function() {
    $state.go('load-moves');
  }

  $scope.newStack = function() {
    $rootScope.keyFrames = {
      stackId : '',
      stackName : '',
      keyFrames : []
    };
  }

  $ionicModal.fromTemplateUrl('templates/moveManagerModal.html', {
    scope: $scope,
    animation: false
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function(data) {
    if(data){
      $scope.move = {};
      $scope.move.id = data.id;
      $scope.move.name = data.name;
      $scope.move.pan = data.pan;
      $scope.move.tilt = data.tilt;
      $scope.move.slider = data.slider;
      $scope.move.offset = data.offset;
      $scope.move.delay = parseInt(data.delay);
      $scope.move.duration = parseInt(data.duration);
    } else {
      $scope.move = {};

      $scope.move.name = 'untitled';
      $scope.move.pan = '';
      $scope.move.tilt = '';
      $scope.move.slider = '';
      $scope.move.offset = 0;
      $scope.move.delay = '';
      $scope.move.duration = '';
    }

    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  $scope.saveMove = function(id) {
    if(id !== undefined){
      $rootScope.keyFrames.keyFrames[id] = $scope.move;
      activate();
      console.log($scope.totalTime);
    } else {
      var id = '';
      if($rootScope.keyFrames.keyFrames !== undefined){
        id = $rootScope.keyFrames.keyFrames.length;
      } else {
        id = 0;
      }
      $scope.move.id =  id;
      activate();
      $rootScope.keyFrames.keyFrames.push($scope.move);
    }
    console.log($rootScope.keyFrames);
    $scope.modal.hide();
  };

  $scope.executeStack = function() {
    console.log('exectue stack!');
    var initMsg = 'M:[' + $rootScope.keyFrames.keyFrames.length + ']';
    console.log(initMsg);
    var mainMsg = '';
    var x = 0;
    // var tmp = [];
    $scope.initMsg(1, initMsg);
    // angular.forEach($rootScope.keyFrames, function(data){
    //   $timeout(function () {
    //     mainMsg = data.offset + ',' + data.duration + ',' + data.delay + ',' + data.pan + ',' + data.tilt+ ',' + data.slider + ']';
    //     $scope.mainMsg(1000, mainMsg);
    //   },1000);
    // });
    var loop;

    loop = $interval(function(){
      console.log('transmitting');
      if(x < ($rootScope.keyFrames.keyFrames.length)){
        console.log($rootScope.keyFrames.keyFrames[x].offset + ',' + $rootScope.keyFrames.keyFrames[x].duration + ',' + $rootScope.keyFrames.keyFrames[x].delay + ',' + $rootScope.keyFrames.keyFrames[x].pan + ',' + $rootScope.keyFrames.keyFrames[x].tilt+ ',' + $rootScope.keyFrames.keyFrames[x].slider + ']');
        mainMsg = $rootScope.keyFrames.keyFrames[x].offset + ',' + $rootScope.keyFrames.keyFrames[x].duration + ',' + $rootScope.keyFrames.keyFrames[x].delay + ',' + $rootScope.keyFrames.keyFrames[x].pan + ',' + $rootScope.keyFrames.keyFrames[x].tilt+ ',' + $rootScope.keyFrames.keyFrames[x].slider + ']';
        $scope.mainMsg(1000, mainMsg);
      } else {
        $interval.cancel(loop);
      }
      x++;
    }, 450);



    // mainMsg = $rootScope.keyFrames[1].offset + ',' + $rootScope.keyFrames[1].duration + ',' + $rootScope.keyFrames[1].delay + ',' + $rootScope.keyFrames[1].pan + ',' + $rootScope.keyFrames[1].tilt+ ',' + $rootScope.keyFrames[1].slider + ']';
    // $scope.mainMsg(1000, mainMsg);
    //
    // mainMsg = $rootScope.keyFrames[2].offset + ',' + $rootScope.keyFrames[2].duration + ',' + $rootScope.keyFrames[2].delay + ',' + $rootScope.keyFrames[2].pan + ',' + $rootScope.keyFrames[2].tilt+ ',' + $rootScope.keyFrames[2].slider + ']';
    // $scope.initMsg(1000, mainMsg);


    // $scope.mainMsg(500, ']');
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
  // $interval(function(){
  //   $scope.readBufferBT();
  // }, 1000);
  $scope.checkBT(2000);
});
