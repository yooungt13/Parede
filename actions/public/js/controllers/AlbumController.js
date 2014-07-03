app.controller("AlbumController", function($scope, $http) {
	console.log("AlbumController is called.")

	// upload submit
	$scope.imgSubmit = function() {
		//if (login != null) {
		// 图床url ip:port/upload
		$http.post("upload")
			.success(function(data, status, headers, config) {
				console.log(data);
				$http.post("distribute", data)
					.success(function(data, status, headers, config) {
						console.log(data);
					})
					.error(function(data, status, headers, config) {
						console.log("Distribute failed.");
					});
				console.log('resp finished.');
			})
			.error(function(data, status, headers, config) {
				alert("Upload failed.");
			});

		console.log('submit finished.');
		//}
	};

	$scope.albums = [];
	$http.get("albums")
		.success(function(data, status, headers, config) {
			console.log("Albums get success.");
			$scope.albums = data;
		})
		.error(function(data, status, headers, config) {
			console.log("Albums get failed.");
		});

});