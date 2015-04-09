app.controller("AlbumController", function($scope, $http) {
	console.log("AlbumController is called.")

	// upload submit
	$scope.imgSubmit = function() {
		//if (login != null) {
		// 图床url ip:port/upload
		$http.post("upload")
			.success(function(data, status, headers, config) {
				console.log(data.length);
				$http.post("distribute", data)
					.success(function(data, status, headers, config) {
						console.log(data);
					})
					.error(function(data, status, headers, config) {
						console.log("Distribute failed.");
					});
				console.log('Resp finished.');
			})
			.error(function(data, status, headers, config) {
				alert("Upload failed.");
			});

		console.log('Submit finished.');
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

	// 上传图片
	$scope.fileUpload = function() {
		if ($("#filePath").val() == "") {
			alert("上传文件不能为空!");
			return false;
		}
		var txtImg_url = $("#filePath").val().toLowerCase();
		var txtImg_ext = txtImg_url.substring(txtImg_url.length - 3, txtImg_url.length);
		if (txtImg_ext != "png" && txtImg_ext != "jpg") {
			alert("仅支持jpg,png!");
			$("#filePath").select();
			$("#filePath").focus();
			return false;
		}
		var imagefile = document.getElementById("filePath").files[0];
		var size = imagefile.size / 1024.0;
		if (size > 300) {
			alert("图片大小不超过300K!");
			return false;
		}
		$.ajaxFileUpload({
			url:"http://babylocation.tk:8081/upload",//需要链接到服务器地址
			//url: 'http://localhost:3000/upload',
			secureuri: false,
			fileElementId: "filePath", //文件选择框的id属性
			dataType: 'json', //也可以是json
			success: function(data) {

				alert("上传成功");
				console.log(data);
			},
			error: function(data, status, e) {
				alert('Upload failed: '+e);
			}
		});
		return false;
	}

	function createScript(src) {
		$("<script></script>").attr("src", src).appendTo("body");
	}

});