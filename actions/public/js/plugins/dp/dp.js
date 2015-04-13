var g_isWebcamOn = false;
var g_wantDemo = true;
var g_network;
var g_video;
var g_demoPhotoUrls = [
  // 'abacus.jpg',
  // 'boat.png',
  // 'cup.png'
  'pizza.jpg'
];

function onNetworkProgress(percentComplete) {
  var progressBar = document.getElementById('network-progress-bar');
  progressBar.value = percentComplete;
  var totalConnections = 60;
  var currentConnections = ((percentComplete * totalConnections) / 100).toFixed(1);
  $('.loading-amount').text(currentConnections);
}

function onNetworkLoad() {
  $('.loading-container').css({
    display: 'none'
  });
  startClassification();
  g_isReady = true;
}

function makeUpload() {
  // 上传图片 与 标签
}

function startClassification() {
  if (g_wantDemo) {
    g_currentImage = undefined;
    $('.vote-tag-container').hide();
    // 继续循环使用demo图片
    // _.delay(startClassification, 5000);
  }
  var demoPhotoIndex = Math.floor(Math.random() * g_demoPhotoUrls.length);
  var demoPhotoUrl = g_demoPhotoUrls[demoPhotoIndex];
  var proxiedUrl = '../data/demo/' + demoPhotoUrl;
  var demoImage = $('<img>');
  demoImage.on('load', function(event) {
    var demoImageElement = demoImage.get(0);
    if (g_wantDemo) {
      classifyImage(demoImageElement, demoImageElement.width, demoImageElement.height);
    }
  });
  demoImage.attr('src', proxiedUrl);
}

function classifyImage(image, width, height) {
  var destSize = 256;
  var canvasElement = $('.image-preview-canvas').get(0);
  canvasElement.width = destSize;
  canvasElement.height = destSize;
  var sourceX;
  var sourceY;
  var sourceSize;
  if (width > height) {
    sourceSize = height;
    sourceX = ((width - height) / 2);
    sourceY = 0;
  } else {
    sourceSize = width;
    sourceX = 0;
    sourceY = ((height - width) / 2);
  }
  var canvas = canvasElement.getContext('2d');
  try {
    canvas.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, destSize, destSize);
  } catch (e) {
    if (e.name == 'NS_ERROR_NOT_AVAILABLE') {
      return;
    } else {
      throw e;
    }
  }
  var previewElement = $('.image-preview');
  var previewCanvas = previewElement.get(0).getContext('2d');
  var previewSize = previewElement.width();
  previewElement.attr('width', previewSize);
  previewElement.attr('height', previewSize);
  previewCanvas.drawImage(canvasElement, 0, 0, previewSize, previewSize);
  var imageData = canvas.getImageData(0, 0, destSize, destSize);
  var inputBuffer = new Buffer([destSize, destSize, 3]);
  for (var y = 0; y < destSize; y += 1) {
    for (var x = 0; x < destSize; x += 1) {
      var imageOffset = (y * destSize * 4) + (x * 4);
      var bufferOffset = (y * destSize * 3) + (x * 3);
      inputBuffer._data[bufferOffset + 0] = imageData.data[imageOffset + 0];
      inputBuffer._data[bufferOffset + 1] = imageData.data[imageOffset + 1];
      inputBuffer._data[bufferOffset + 2] = imageData.data[imageOffset + 2];
    }
  }
  inputBuffer.setName('inputBuffer');
  var startTime = new Date().getTime();
  var results = g_network.classifyImage(inputBuffer, false, 0, g_webGLEnabled);
  var endTime = new Date().getTime();
  var duration = (endTime - startTime);
  var topResults = _.select(results, function(prediction) {
    return (prediction.value > 0.01);
  });
  topResults = topResults.sort(function(a, b) {
    return (b.value - a.value);
  });
  topResults = _.first(topResults, 10);
  var resultsList = $('#results-list');
  resultsList.empty();
  if (topResults.length > 0) {
    _.each(topResults, function(prediction) {
      var score = Math.round(prediction.value * 100);
      var resultEntry = $('<tr>').addClass('result-entry');
      var resultScore = $('<td>').text(score + '%').addClass('score');
      var prettyLabel = prediction.label.toLowerCase().replace(/\\b[a-z]/g, function(letter) {
        return letter.toUpperCase();
      });
      var resultLabel = $('<td>').text(prettyLabel).addClass('label');
      resultEntry.append(resultScore);
      resultEntry.append(resultLabel);
      resultsList.append(resultEntry);
    });
  } else {
    var resultEntry = $('<div>')
      .addClass('result-entry')
      .text('No results found');
    resultsList.append(resultEntry);
  }
  $('.time').text('Took ' + duration + 'ms');
}

var SITE = SITE || {};
SITE.fileInputs = function() {
  var $this = $(this);
  var $val = $this.val();
  var valArray = $val.split('\\');
  var newVal = valArray[valArray.length - 1];
  var $button = $this.siblings('.button');
  var $fakeFile = $this.siblings('.file-holder');
  if (newVal !== '') {
    $button.text('Photo Chosen');
    var fileInput = $('#photo').get(0);
    onFilePick(fileInput.files[0]);
  }
};

var g_uploadedImages = {};
var g_isReady = false;
var g_currentImage;

function onFilePick(file) {
  var imageType = /image.*/;
  if (!file.type.match(imageType)) {
    return;
  }
  var reader = new FileReader();
  reader.onload = function(e) {
    var image = new Image();
    image.src = reader.result;
    g_wantDemo = false;
    // Delay is needed for Firefox for some reason.
    _.delay(function() {
      classifyImage(image, image.width, image.height);
    }, 200);
  }
  reader.readAsDataURL(file);
}

function loadExists() {
  var existsList = $('#exists-list');
  existsList.empty();
  var exists = ['tree', 'bus', 'women'];

  for (var i = 0, len = exists.length; i < len; i++) {
    var resultEntry = $('<tr>').addClass('result-entry');
    var resultLabel = $('<td>').text(exists[i]).addClass('label');
    resultEntry.append(resultLabel);
    existsList.append(resultEntry);
  }
}

function bindClicker() {
  var $tr = $('tr');
}

(function() {
  var matched, browser;
  // Use of jQuery.browser is frowned upon.
  // More details: http://api.jquery.com/jQuery.browser
  // jQuery.uaMatch maintained for back-compat
  jQuery.uaMatch = function(ua) {
    ua = ua.toLowerCase();
    var match = /(chrome)[ \\/]([\w.]+)/.exec(ua) ||
      /(webkit)[ \\/]([\w.]+)/.exec(ua) ||
      /(opera)(?:.*version|)[ \\/]([\w.]+)/.exec(ua) ||
      /(msie) ([\\w.]+)/.exec(ua) ||
      ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\\w.]+)|)/.exec(ua) ||
      [];
    return {
      browser: match[1] || '',
      version: match[2] || '0'
    };
  };
  matched = jQuery.uaMatch(navigator.userAgent);
  browser = {};
  if (matched.browser) {
    browser[matched.browser] = true;
    browser.version = matched.version;
  }
  // Chrome is Webkit, but Webkit is also Safari.
  if (browser.chrome) {
    browser.webkit = true;
  } else if (browser.webkit) {
    browser.safari = true;
  }
  jQuery.browser = browser;
})();

var g_hasWebGL = false;
var g_webGLEnabled = true;

$(_.delay(function() {
  $('.file-wrapper input[type=file]').bind('change focus click', SITE.fileInputs);
  $('.webgl-toggle').on('click', function(event) {
    makeUpload();
  });
  loadExists();
  g_video = $('#live').get(0);
  var networkUrl = '../data/networks/jetpac_untransposed.ntwk'
  g_network = new Network(networkUrl, onNetworkLoad, {
    progress: onNetworkProgress
  });
}, 0));