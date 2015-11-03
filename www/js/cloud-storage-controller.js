angular.module('starter.cloud-storage', [])

.controller('CloudStorageCtrl', function($scope, $rootScope, $ionicModal, $state, $cordovaFile, $ionicPopup) {

  $scope.loginData = {};
  $scope.cloudMoveStacks = [];
  // Create the login modal that we will use later

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  function activate() {
    console.log('activate');
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      var currentUser = Parse.User.current();
      if (!currentUser) {
        $scope.modal.show();
      } else {

        getMoves();
      }
    });
  };

  $scope.logout = function(){
    Parse.User.logOut();
    activate();
  }
  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    Parse.User.logIn($scope.loginData.username, $scope.loginData.password, {
      success: function(user) {
        // Do stuff after successful login.
        console.log(user);
        //$rootScope.user.id = user.getUsername;
        $rootScope.user.user = user;
        $rootScope.user.id = user.id;
        $rootScope.user.username = user.attributes.username;
        $scope.closeLogin();

        getMoves();
      },
      error: function(user, error) {
        // The login failed. Check error to see why.
        alert("error!");
      }
    });
  };

  $scope.doSignup = function() {
    //Create a new user on Parse
    console.log('Doing signup', $scope.loginData);
    var user = new Parse.User();
    user.set("username", $scope.loginData.username);
    user.set("password", $scope.loginData.password);

    user.signUp(null, {
      success: function(user) {
        // Hooray! Let them use the app now.
        $rootScope.user.user = user;
        $rootScope.user.id = user.id;
        $rootScope.user.username = user.attributes.username;
        $scope.closeLogin();

        getMoves();
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
    });

  }
  function getMoves(){
    var User = Parse.User.current();
    var MoveStackObject = Parse.Object.extend("MoveStack");
    var query = new Parse.Query(MoveStackObject);
    query.equalTo("user", User);
    query.find().then(function(results) {
      // Create a trivial resolved promise as a base case.
      $scope.cloudMoveStacks = results;
      $scope.isLoading = true;

    }).then(function() {
      // Every comment was deleted.
    });
  }
  $scope.saveStackToLocal = function( obj ){
    console.log(obj);
    document.addEventListener('deviceready', function () {
      var data = {
        stackId : $rootScope.moveStacks.length,
        stackName : obj.stackName,
        keyFrames : obj.keyFrames
      }
      $rootScope.moveStacks.push(data);
      $cordovaFile.writeFile(cordova.file.dataDirectory, 'autoCraneFile20.json', $rootScope.moveStacks, true)
       .then(function (success) {
         alert(obj.stackName + ' Saved to Local');
       }, function (error) {
         alert('Error on Save');
      });
    });
  }

  $scope.saveStackToCloud = function( data ){
    console.log(data);
    var keyFrames = _.map(data.keyFrames, function( data ){
      delete data.$$hashKey;
      return data;
    });
    var user = Parse.User.current();
    var Stack = Parse.Object.extend("MoveStack");
    var stack = new Stack();
    stack.set("stackId", data.stackId.toString());
    stack.set("stackName", data.stackName);
    stack.set("keyFrames", keyFrames);
    stack.set("user", user);
    stack.save(null, {
      success: function(post) {
        console.log(post);
        alert(data.stackName + ' Uploaded to Cloud');
        getMoves();
      }
    });
  }

  $scope.deleteStackFromCloud = function(stack){

    var confirmPopup = $ionicPopup.confirm({
      title: 'Stack Move: ' + stack.attributes.stackName,
      template: 'Are you sure you want to delete this'
    });
    confirmPopup.then(function(res) {
      if(res) {
        stack.destroy({
          success: function(myObject) {
            alert('Stack deleted from cloud');
            getMoves();
          },
          error: function(myObject, error) {
            alert('error on delete');
          }
        });
      } else {
        console.log('You are not sure');
      }
    });


  }

  activate();

});
