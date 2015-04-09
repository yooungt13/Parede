app.controller("PhotoController", function($scope, $http) {
	console.log("PhotoController is called.");

	$scope.photos = [];
	$scope.tag = getRequest()['tag'];
	$http.get("photos?tag=" + $scope.tag)
		.success(function(data, status, headers, config) {
			console.log("Photos get success.");

			// var ret = [];
			// for( var i = 0, len = data.length; i < len; i++ ){
			// 	var photo = data[i];
			// 	photo.descrip = data[i].descrip || 'Even there\'s no descrip, we still have our world';
			// 	photo.date = data[i].date.toLocaleString();
			// 	ret.push(photo);
			// }
			$scope.photos = data;

			setPhotos(data);
		})
		.error(function(data, status, headers, config) {
			console.log("Photos get failed.");
		});

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

	// upload submit
	$scope.tagSubmit = function() {
		console.log('The tag is ' + $('#tagSearch').val() + '.');

		var startTime = new Date().getTime();
	
		$http
			.get("tagsearch?tag=" + $('#tagSearch').val())
			.success(function(data, status, headers, config) {
				setPhotos(data);
				var endTime = new Date().getTime();
				console.log("Search by tag success, using " + (endTime - startTime)+ " ms.");
			})
			.error(function(data, status, headers, config) {
				console.log("Search by tag failed.");
			});
	};

	function setPhotos(data) {

		// 置空容器
		if( !!$('#albums') ){
			$('#albums').remove();
		}

		var emptyHtml = '<div id="albums" class="albums">'
			+ '<div class="col" id="col1"></div>'
			+ '<div class="col" id="col2"></div>'
			+ '<div class="col" id="col3"></div>'
			+ '<div class="col" id="col4"></div>'
			+ '<div class="col" id="col5"></div>'
			+ '</div>';		
		$('article').append(emptyHtml);

		// 初始化照片
		var winHeight = $(window).height(),
			len = data.length;
		picno = 0;

		loadImg();
		loadImg();
		loadImg();

		$(window).unbind().bind('scroll',function() {
			var docTop = $(document).scrollTop(),
				contentHeight = $('#albums').height();
			if (docTop + winHeight >= contentHeight) {
				loadImg();
			}
		});

		function loadImg() {
			for (var i = 1; i <= 5; i++) {
				if (picno < len) {
					var html = '',
						photo = data[picno];

					html = '<div class="wrap fancybox" data-fancybox-group="gallery"' 
					    + ' href="' + photo.oUrl + '"' 
					    + ' title="' + photo.tags.join() + '">' 
					    + ' <img src="' + photo.tUrl + '" class="thumb" alt=""><div class="pic_info">'
					    + '<p class="fb14">' + photo.tags.join() + '</p>'
					    + '<p class="fg9">' + ( photo.descrip || 'Even there\'s no descrip, we still have our world.' ) + '</p>'
					    + '<p class="bottom_info fg9">' + photo.date.substring(0,16)+' - Sysu, Guangzhou</p>'
					    + '</div></div>';

					$('#col' + i).append(html);
					picno++;
				}
			}
		}
	}

	function getRequest() {
	   var url = location.search; //获取url中"?"符后的字串
	   var theRequest = new Object();
	   if (url.indexOf("?") != -1) {
	      var str = url.substr(1);
	      strs = str.split("&");
	      for(var i = 0; i < strs.length; i ++) {
	         theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
	      }
	   }
	   return theRequest;
	}
});