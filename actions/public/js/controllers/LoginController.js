app.controller("LoginController", function($scope, $http) {
	console.log("Controller is called.")

	$scope.loginSubmit = function(login) {
		console.log("Login info: " + login.email + "/" + login.password);
		if (login != null) {

			$http.post("login", login)
				.success(function(data, status, headers, config) {
					alert(data.description);

					if(data.code == 0){
						window.location.href="home"; 
					}
				})
				.error(function(data, status, headers, config) {
					alert("Login Failed");
				});

		}
	};
});