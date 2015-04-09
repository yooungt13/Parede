function prevChange(obj, imgId){
  if (obj.files) {
    //兼容chrome、火狐等，HTML5获取路径                   
    if (typeof FileReader !== "undefined") {

      // 显示预览框，绑定按钮事件
      $('#searchPrev').css('display', 'block');
      //$('#confirm').bind('click', doSearch());

      var reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById(imgId).setAttribute("src", e.target.result);
      }
      reader.readAsDataURL(obj.files[0]);
    }
  }   
}

function doSearch(){
  
  var albums = $('#albums'),
      htmls = '';

  var ret = aHashSearch();

  for( var i = 0, len = ret.length; i < len; i++ ){
    htmls += '<div class="col" id="col1"><div class="wrap fancybox" data-fancybox-group="gallery" href="./data/origin/0.jpg" title="ice,mountain,girl"><img src="./data/thumb/0.jpg" class="thumb" alt=""><div class="pic_info"><p class="fb14">Ice,Mountain,Girl</p><p class="fg9">Getting closer.Here is the comming soon / sign up page in the works.Created by driiible.</p> <p class="bottom_info fg9">21 Mar 2014 - Sysu, Guangzhou</p></div></div></div>'
    
  }
  albums.html('');
}