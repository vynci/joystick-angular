angular.module('starter.load-moves', [])

.controller('LoadMovesCtrl', function($scope, $rootScope, $ionicModal, $state, $ionicPopup, $cordovaFile) {
  $scope.fileList = [];
  $scope.status = [];
  function activate(){
    $scope.fileList = $rootScope.moveStacks;
  }
  $scope.loadMove = function( data ){
    $rootScope.keyFrames.stackId = data.stackId;
    $rootScope.keyFrames.stackName = data.stackName;
    $rootScope.keyFrames.keyFrames = data.keyFrames;
    $state.go('app.moveManager');
  }

  $scope.deleteMove = function (data) {

    var confirmPopup = $ionicPopup.confirm({
      title: 'Stack Move: ' + data.stackName,
      template: 'Are you sure you want to delete this?'
    });
    confirmPopup.then(function(res) {
      if(res) {
        var idToDelete = data.stackId;
        var newData = _.filter($rootScope.moveStacks, function(data){
            if(data.stackId !== idToDelete){
                return data;
            }
        });
        $rootScope.moveStacks = newData;
        document.addEventListener('deviceready', function () {
          $cordovaFile.writeFile(cordova.file.dataDirectory, 'autoCraneFile20.json', $rootScope.moveStacks, true)
           .then(function (success) {
             alert('File deleted from Local');
             $rootScope.keyFrames = {
               stackId : '',
               stackName : '',
               keyFrames : []
             };
             $scope.fileList = $rootScope.moveStacks;
           }, function (error) {
             alert('Error on Delete');
          });
        });

      } else {

      }
    });
  }

  activate();
});
