app.controller("LoginController", function($scope, $http) {
	console.log("Controller is called.")

	$scope.login = null;
	$scope.submit = function() {
		console.log("Login info: " + $scope.login);
		if ($scope.login != null) {
			console.log("Data here.");
		}
	};
});