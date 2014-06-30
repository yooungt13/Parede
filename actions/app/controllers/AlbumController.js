app.controller("AlbumController", function($scope, $http) {
	console.log("AlbumController is called.")

	$scope.imgSubmit = function() {
		//if (login != null) {
		$http.post("upload")
			.success(function(data, status, headers, config) {
				console.log(data);
				$http.post("distribute")
					.success(function(data, status, headers, config) {
						console.log("Distribute success.");
					})
					.error(function(data, status, headers, config) {
						console.log("Distribute failed.");
					});
			})
			.error(function(data, status, headers, config) {
				alert("Upload failed.");
			});

		//}
	};
});