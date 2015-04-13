app.controller("AlbumController", function($scope, $http) {
	console.log("AlbumController is called.")

	$scope.albums = [];
	$http.get("albums")
		.success(function(data, status, headers, config) {
			console.log("Albums get success.");
			$scope.albums = data;
		})
		.error(function(data, status, headers, config) {
			console.log("Albums get failed.");
		});

	// 给input[type='file']绑定事件
	$('#image').bind('change', function(){

		if (this.files) {
		    //兼容chrome、火狐等，HTML5获取路径                   
		    if (typeof FileReader !== "undefined") {

		    	// 显示预览框，绑定按钮事件
		    	// 置空容器
				if( !!$('#albums') ){
					$('#albums').remove();
				}

				var html = '<div id="albums">'
					+ '<div class="col">'
					+ '<div class="preview-wrapper">'
					+ '<img id="preview">'
					+ '</div>'
					+ '<a class="preview-button" id="imgSubmit">Go Retrival</a>'
					+ '</div></div>';		
				$('article').append(html);
				$('#imgSubmit').bind();

		      	var reader = new FileReader();
		      	reader.onload = function (e) {
		        	$('#preview').attr("src", e.target.result);
		      	}
		      	reader.readAsDataURL(this.files[0]);
		    }
		 } 
	});

	// upload tagSubmit
	$scope.tagSubmit = function() {
		console.log('The tag is ' + $('#tagSearch').val() + '.');

		var startTime = new Date().getTime();
	
		$http
			.get("photos?tag=" + $('#tagSearch').val())
			.success(function(data, status, headers, config) {
				// 设置图像列表
				setPhotos(data);
				var endTime = new Date().getTime();
				console.log("Search by tag success, using " + (endTime - startTime)+ " ms.");
			})
			.error(function(data, status, headers, config) {
				console.log("Search by tag failed.");
			});
	};

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

	function setPhotos(data) {

		// 置空容器
		if( !!$('#albums') ){
			$('#albums').remove();
		}

		if( !!data.length ){
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
		}else{
			var emptyHtml = '<div id="albums" class="albums">'
				+ '<p class="tips">I\'m sorry,&nbsp;&nbsp;there\'s no results here.</p>'
				+ '<p class="tips" style="font-size: 12px;">'
				+ 'Do you want to search'
				+ '<strong>women</strong>,'
				+ '<strong>lady</strong>'
				+ '</p>'
				+ '</div>';		
			$('article').append(emptyHtml);
		}

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

	// 上传图片
	$scope.fileUpload = function() {
		if ($("#photo").val() == "") {
			alert("上传文件不能为空!");
			return false;
		}
		var txtImg_url = $("#photo").val().toLowerCase();
		var txtImg_ext = txtImg_url.substring(txtImg_url.length - 3, txtImg_url.length);
		if (txtImg_ext != "png" && txtImg_ext != "jpg") {
			alert("仅支持jpg,png!");
			$("#photo").select();
			$("#photo").focus();
			return false;
		}
		var imagefile = $("#photo").get(0).files[0];
		var size = imagefile.size / 1024.0;
		if (size > 300) {
			alert("图片大小不超过300K!");
			return false;
		}
		$.ajaxFileUpload({
			url:"http://babylocation.tk:8081/upload",//需要链接到服务器地址
			//url: 'http://localhost:3000/upload',
			secureuri: false,
			fileElementId: "photo", //文件选择框的id属性
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