angular.module('starter.cloud-storage', [])

.controller('CloudStorageCtrl', function($scope, $rootScope, $ionicModal, $state) {

  $scope.loginData = {};
  $scope.moveStacks = [];
  // Create the login modal that we will use later

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  function activate() {
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      var currentUser = Parse.User.current();
      if (!currentUser) {
        $scope.modal.show();
      } else {
        console.log(currentUser);
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
    query.find({
      success: function(moveStacks) {
        console.log(moveStacks);
        $scope.moveStacks = moveStacks;
      }
    });
  }

  activate();

});
