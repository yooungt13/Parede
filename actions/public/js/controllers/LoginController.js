app.controller("LoginController", function($scope, $http) {
	console.log("Controller is called.")

	$scope.loginSubmit = function(login) {
		console.log("Login info: " + login.email + "/" + login.pwd);
		if (login != null) {
			
			//console.log("Data here.");
			$http.post("login",login)
				.success(function(data, status, headers, config){
					alert("Login Success");
				})
				.error(function(data, status, headers, config){
					alert("Login Failed");
				});
		}
	};
});