angular.module('starter.cloud-storage', ['starter.move-stack-service'])

.controller('CloudStorageCtrl', function($scope, $rootScope, $ionicModal, $state, $cordovaFile, $ionicPopup, MoveStackService, uuid4) {

  $scope.loginData = {};
  $scope.cloudMoveStacks = [];
  $scope.data = {};
  // Create the login modal that we will use later

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  function activate() {
    console.log('activate');
    $scope.isLogged = false;
    $scope.cloudMoveStacks = [];
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
      var currentUser = Parse.User.current();
      if (!currentUser) {
        $scope.modal.show();
      } else {
        $scope.currentUsername = currentUser.attributes.username;
        $scope.isLogged = true;
        updateCloudList();
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
        $scope.isLogged = true;
        $scope.currentUsername = user.attributes.username;
        updateCloudList();
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
        $scope.isLogged = true;
        $scope.currentUsername = currentUser.attributes.username;
        updateCloudList();
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
    });

  }

  function updateCloudList( data ){
    $scope.isLoading = true;
    MoveStackService.getMoves()
      .then(function(results) {
        // Handle the result
        console.log(results);
        $scope.isLoading = false;
        $scope.cloudMoveStacks = results;
        return results;
      }, function(err) {
        // Error occurred
        console.log(error);
      }, function(percentComplete) {

    });
  }

  $scope.refreshCloud = function(){
    updateCloudList();
  }

  $scope.saveStackToLocal = function( obj ){
    console.log(obj);
    document.addEventListener('deviceready', function () {
      var data = {
        stackId : uuid4.generate(),
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
        alert('Uploaded to Cloud');
        updateCloudList();
      },

      error: function(){
        alert('error!');
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
            updateCloudList();
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

  $scope.shareFromCloud = function(stack){
    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="data.moveStack">',
      title: 'Share stack move: ' + stack.attributes.stackName,
      subTitle: 'Enter Email Address',
      scope: $scope,
      buttons: [ { text: 'Cancel' },
        {
          text: '<b>Share</b>',
          type: 'button-balanced',
          onTap: function(e) {
            if (!$scope.data.moveStack) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return $scope.data.moveStack;
            }
          }
        }
      ]
      });
      myPopup.then(function(res) {
        if(res){
          console.log(res);
          var query = new Parse.Query(Parse.User);
          query.equalTo('username',res);
          query.first().then(function(user) {
            console.log(stack);
            var Stack = Parse.Object.extend("MoveStack");
            var sharedStack = new Stack();
            sharedStack.set("stackId", stack.attributes.stackId);
            sharedStack.set("stackName", stack.attributes.stackName);
            sharedStack.set("keyFrames", stack.attributes.keyFrames);
            sharedStack.set("user", user);
            sharedStack.save(null, {
              success: function(post) {
                Parse.Cloud.run("sendEmail", { "email": res },{
                  success: function(){
                    alert('Successfully shared to ' + res);
                  },
                  error: function(){
                    alert('Error');
                  }
                });

              }
            });
          }, function(err) {
            alert('Cannot Find User');
          });
        }

      });
  }

  activate();

});
