angular.module('starter.move-stack-service', [])

.factory('MoveStackService', function($q) {
	var service = {
		getMoves: function() {
			var defer = $q.defer();
			var User = Parse.User.current();
			var MoveStackObject = Parse.Object.extend("MoveStack");
			var query = new Parse.Query(MoveStackObject);

			query.equalTo("user", User);
			query.find({
				success: function(results) {
					defer.resolve(results);
				},
				error: function(error) {
					defer.reject(error);
					alert("Error: " + error.code + " " + error.message);
				}
			});
			return defer.promise;
		}
	}
	return service;
});
