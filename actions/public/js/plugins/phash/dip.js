var iCanvas = document.createElement("canvas"),
	iCtx = iCanvas.getContext("2d");

function iResize(width, height) {
	iCanvas.width = width;
	iCanvas.height = height;
}

function Matrix(row, col, data, buffer) {
	this.row = row || 0;
	this.col = col || 0;
	this.channel = 4;
	this.buffer = buffer || new ArrayBuffer(row * col * this.channel);
	this.data = new Uint8ClampedArray(this.buffer);
	data && this.data.set(data);
	this.bytes = 1;
	this.type = "CV_RGBA";
	this.at = function(x, y) {
		return this.data[4 * col * x + 4 * y];
	}
	this.setValue = function(x, y, value) {
		var offset = 4 * col * x + 4 * y;
		this.data[offset] = this.data[offset + 1] = this.data[offset + 2] = value;
		this.data[offset + 3] = 255;
	}
}

function imread(image) {
	var width = image.width,
		height = image.height;

	iResize(width, height);
	iCtx.drawImage(image, 0, 0);
	var imageData = iCtx.getImageData(0, 0, width, height),
		tempMat = new Matrix(height, width, imageData.data);

	imageData = null;
	iCtx.clearRect(0, 0, width, height);
	return tempMat;
}

function getHistogram(mat) {
	var h = [];
	var k = 256;
	while (k--) h[k] = 0;

	// caculate the histo
	for (var i = 0; i < mat.row; i++) {
		for (var j = 0; j < mat.col; j++) {
			h[mat.at(i, j)] ++;
		}
	}
	return h;
}

function RGBA2ImageData(mat) {
	var width = mat.col,
		height = mat.row,
		imageData = iCtx.createImageData(width, height);
	imageData.data.set(mat.data);
	return imageData;
}

function RGBA2Gray(mat) {
	var dst = new Matrix(mat.row, mat.col),
		data = dst.data,
		data2 = mat.data;
	var pix = mat.data.length;
	for (var i = 0; i < pix; i += 4) {
		// RGBA to Gray: Y = 0.299*R + 0.587*G + 0.114*B
		data[i] = data[i + 1] = data[i + 2] = data2[i] * 0.299 + data2[i + 1] * 0.587 + data2[i + 2] * 0.114;
		data[i + 3] = 255;
	}

	return dst;
}

function reverseColor(mat) {
	var dst = new Matrix(mat.row, mat.col);

	for (var i = 0; i < mat.row; i++) {
		// RGBA to Gray: Y = 0.299*R + 0.587*G + 0.114*B
		for (var j = 0; j < mat.col; j++) {
			dst.setValue(i, j, 255 - mat.at(i, j));
		}
	}

	return dst;
}

function scaleDown(mat) {
	var row = mat.row / 2,
		col = mat.col / 2;
	var dst = new Matrix(row, col),
		data = dst.data,
		data2 = mat.data;

	var offset = 0;
	for (i = 0; i < row * col * 4; i += 4) {
		if (!(i % (4 * col))) { //alert(i);
			offset++;
		}
		// 2*col*4 = mat.row * channel
		data[i] = data[i + 1] = data[i + 2] = data2[2 * i + offset * col * 8];
		data[i + 3] = 255;
	}

	return dst;
}

function scaleUp(mat) {
	var row = mat.row * 2,
		col = mat.col * 2;
	var dst = new Matrix(row, col),
		data = dst.data,
		data2 = mat.data;

	var offset = 0;
	for (var i = 0; i < row * col * 4; i += 4) {
		if (!(i % (4 * col))) { //alert(i);
			offset++;
		}
		data[i] = data[i + 1] = data[i + 2] = data2[i / 2 + offset * col * 2];
		data[i + 3] = 255;
	}

	return dst;
}

function log(mat, c) {
	var dst = new Matrix(mat.row, mat.col);

	for (var i = 0; i < mat.row; i++) {
		for (var j = 0; j < mat.col; j++) {
			dst.setValue(i, j, Math.floor(c * (Math.log(1 + mat.at(i, j)) / Math.log(2))));
		}
	}

	return dst;
}

function histogram(mat) {
	var dst = new Matrix(mat.row, mat.col);
	var mn = mat.data.length / 4;

	var h = getHistogram(mat);

	// normalized
	for (var i = 0; i < 256; i++) {
		h[i] = h[i] / mn;
	}

	// caculate the pdf
	for (var i = 1; i < 256; i++) {
		h[i] = h[i] + h[i - 1];
	}

	for (var i = 0; i < mat.row; i++) {
		for (var j = 0; j < mat.col; j++) {
			dst.setValue(i, j, Math.floor(h[mat.at(i, j)] * 255));
		}
	}

	return dst;
}

function spatialFilter(mat, h) {
	var dst = new Matrix(mat.row, mat.col);
	var window = [
		[h[0], h[1], h[2]],
		[h[3], h[4], h[5]],
		[h[6], h[7], h[8]]
	];

	var total = 0;
	for (var i = 0; i < 9; i++) total += h[i];

	for (var i = 1; i < mat.row - 1; i++) {
		for (var j = 1; j < mat.col - 1; j++) {
			var v1 = mat.at(i - 1, j - 1) * window[0][0] + mat.at(i - 1, j) * window[0][1] + mat.at(i - 1, j + 1) * window[0][2],
				v2 = mat.at(i, j - 1) * window[1][0] + mat.at(i, j) * window[1][1] + mat.at(i, j + 1) * window[1][2],
				v3 = mat.at(i + 1, j - 1) * window[2][0] + mat.at(i + 1, j) * window[2][1] + mat.at(i + 1, j + 1) * window[2][2];
			dst.setValue(i, j, (v1 + v2 + v3) / total);
		}
	}

	return dst;
}

function laplacian(mat) {

	var dst = new Matrix(mat.row, mat.col);
	var window = [
		[1, 1, 1],
		[1, -8, 1],
		[1, 1, 1]
	];

	for (var i = 1; i < mat.row - 1; i++) {
		for (var j = 1; j < mat.col - 1; j++) {
			var v1 = mat.at(i - 1, j - 1) * window[0][0] + mat.at(i - 1, j) * window[0][1] + mat.at(i - 1, j + 1) * window[0][2],
				v2 = mat.at(i, j - 1) * window[1][0] + mat.at(i, j) * window[1][1] + mat.at(i, j + 1) * window[1][2],
				v3 = mat.at(i + 1, j - 1) * window[2][0] + mat.at(i + 1, j) * window[2][1] + mat.at(i + 1, j + 1) * window[2][2];
			dst.setValue(i, j, (v1 + v2 + v3));
		}
	}

	return dst;
}

function unsharp(mat, k) {
	var dst = new Matrix(mat.row, mat.col);
	var lap = laplacian(mat);
	for (var i = 0; i < mat.row; i++) {
		for (var j = 0; j < mat.col; j++) {
			dst.setValue(i, j, k * mat.at(i, j) - lap.at(i, j));
		}
	}

	return dst;
}

function fourier(mat) {
	var dst = new Matrix(mat.row, mat.col);
	var fx = center(mat);
	var Fu = fft2D(fx, mat.col, mat.row);

	// normalized
	scale(dst, Fu);
	return log(dst, 50);
}

function glpfilter(mat, Do) {
	var height = mat.row,
		width = mat.col,
		len = height * width;
	var dst = new Matrix(height, width);
	var fx = center(mat);
	var Fu = fft2D(fx, width, height);

	//glpf
	for (var i = 0; i < len; i++) {
		var u = i / width,
			v = i % width;
		var H = Math.exp(-(Math.pow(u - height / 2, 2) + Math.pow(v - width / 2, 2)) / (2 * Do));
		Fu[i].real = Fu[i].real * H;
		Fu[i].imaginary = Fu[i].imaginary * H;
	}

	var iFu = ifft2D(Fu, width, height);

	// value need to be rotate/scale/recenter 
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			dst.setValue(i, j, iFu[len - 1 - (i * width + j)].real * len * Math.pow(-1, i + j));
		}
	}
	return dst;
}

function ghpfilter(mat, Do) {
	var height = mat.row,
		width = mat.col,
		len = height * width;
	var dst = new Matrix(height, width);
	var fx = center(mat);
	var Fu = fft2D(fx, width, height);

	//glpf
	for (var i = 0; i < len; i++) {
		var u = i / width,
			v = i % width;
		var H = 1 - Math.exp(-(Math.pow(u - height / 2, 2) + Math.pow(v - width / 2, 2)) / (2 * Do));
		Fu[i].real = Fu[i].real * H;
		Fu[i].imaginary = Fu[i].imaginary * H;
	}

	var iFu = ifft2D(Fu, width, height);

	// value need to be rotate/scale/recenter 
	for (var i = 0; i < height; i++) {
		for (var j = 0; j < width; j++) {
			dst.setValue(i, j, iFu[len - 1 - (i * width + j)].real * len * Math.pow(-1, i + j));
		}

	}
	return dst;
}

function sapNoise(mat, pa, pb) {
	var dst = new Matrix(mat.row, mat.col);
	var h = getHistogram(mat);
	var n = mat.row * mat.col;

	var r, p;
	for (var i = 0; i < mat.row; i++) {
		for (var j = 0; j < mat.col; j++) {
			r = Math.random();
			p = 0;
			if (r < pa) p = 255;
			else if (r >= pa && r < pa + pb) p = 1;

			dst.setValue(i, j, p > 0 ? p : mat.at(i, j));
		}
	}

	return dst;
}

function gsNoise(mat, mean, variance) {
	var dst = new Matrix(mat.row, mat.col);
	var h = getHistogram(mat);
	var n = mat.row * mat.col;

	// 标准差
	var dev = Math.sqrt(variance);

	var p = [];
	for (var i = 0; i < 256; i++) {
		p[i] = Math.exp(-Math.pow(i - mean, 2) / (2 * variance)) / (Math.sqrt(2 * Math.PI) * dev);
	}

	var r;
	for (var i = 0; i < mat.row; i++) {
		for (var j = 0; j < mat.col; j++) {
			r = Math.random();
			dst.setValue(i, j, r < p[mat.at(i, j)] ? r * 255 : mat.at(i, j));
		}
	}

	return dst;
}

function medianFilter(mat) {
	var dst = new Matrix(mat.row, mat.col),
		h = [];

	var comp = function(a, b) {
		return a - b;
	};

	for (var i = 1; i < mat.row - 1; i++) {
		for (var j = 1; j < mat.col - 1; j++) {
			h = [
				mat.at(i - 1, j - 1), mat.at(i - 1, j), mat.at(i - 1, j + 1),
				mat.at(i, j - 1), mat.at(i, j), mat.at(i, j + 1),
				mat.at(i + 1, j - 1), mat.at(i + 1, j), mat.at(i + 1, j + 1)
			];
			h.sort(comp);
			dst.setValue(i, j, h[4]);
		}
	}

	return dst;
}

function maximumFilter(mat) {
	var dst = new Matrix(mat.row, mat.col);

	var window = [
		[1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1]
	];

	var len = window.length,
		offset = (len - 1) / 2;

	var comp = function(a, b) {
		return a - b;
	};

	for (var i = offset; i < mat.row - offset; i++) {
		for (var j = offset; j < mat.col - offset; j++) {
			var result = [];
			for (var m = 0; m < len; m++) {
				for (var n = 0; n < len; n++) {
					// TODO
					result.push(mat.at(i - offset + m, j - offset + n) * window[m][n]);
				}
			}
			result.sort(comp);
			dst.setValue(i, j, result[result.length - 1]);
		}
	}

	return dst;
}

function ArithmeticMeanFilter(mat, h) {
	var dst = new Matrix(mat.row, mat.col);

	var window = [
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1]
	];

	var len = window.length,
		offset = (len - 1) / 2;

	for (var i = offset; i < mat.row - offset; i++) {
		for (var j = offset; j < mat.col - offset; j++) {
			var result = 0;
			for (var m = 0; m < len; m++) {
				for (var n = 0; n < len; n++) {
					// TODO
					result += mat.at(i - offset + m, j - offset + n) * window[m][n];
				}
			}
			dst.setValue(i, j, result / (len * len));
		}
	}

	return dst;
}

function harmonicFilter(mat, h) {
	var dst = new Matrix(mat.row, mat.col);

	var window = [
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1]
	];

	var len = window.length,
		offset = (len - 1) / 2;

	for (var i = offset; i < mat.row - offset; i++) {
		for (var j = offset; j < mat.col - offset; j++) {
			var result = 0;
			for (var m = 0; m < len; m++) {
				for (var n = 0; n < len; n++) {
					// TODO
					result += 1 / (mat.at(i - offset + m, j - offset + n) * window[m][n]);
				}
			}
			dst.setValue(i, j, (len * len) / result);
		}
	}

	return dst;
}

function iharmonicFilter(mat, h, Q) {
	var dst = new Matrix(mat.row, mat.col);

	var window = [
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1],
		[1, 1, 1, 1, 1, 1, 1, 1, 1]
	];

	var len = window.length,
		offset = (len - 1) / 2;

	for (var i = offset; i < mat.row - offset; i++) {
		for (var j = offset; j < mat.col - offset; j++) {
			var result = 0,
				divider = 0;
			for (var m = 0; m < len; m++) {
				for (var n = 0; n < len; n++) {
					// TODO
					var value = mat.at(i - offset + m, j - offset + n) * window[m][n];
					result += Math.pow(value, Q + 1);
					divider += Math.pow(value, Q);
				}
			}
			dst.setValue(i, j, result / divider);
		}
	}

	return dst;
}

function pseudoColor(mat) {
	var dst = new Matrix(mat.row, mat.col);

	var data = mat.data,
		data2 = dst.data;
	for (var i = 0; i < data.length; i += 4) {
		if (data[i] < 10) {
			data2[i] = data2[i + 1] = 255;
			data2[i + 2] = 0;
			data2[i + 3] = 255;
		} else {
			data2[i] = data2[i + 1] = data2[i + 2] = data[i];
			data2[i + 3] = 255;
		}
	}

	return dst;
}

function colorImgHE(mat) {
	var dst = new Matrix(mat.row, mat.col);
	var mn = mat.data.length / 4;

	var rh = gh = bh = [],
		k = 256;
	while (k--) rh[k] = gh[k] = bh[k] = 0;

	var data = mat.data,
		data2 = dst.data;
	// caculate the histo
	for (var i = 0; i < data.length; i += 4) {
		rh[data[i]] ++;
		gh[data[i + 1]] ++;
		bh[data[i + 2]] ++;
	}

	// normalized
	for (var i = 0; i < 256; i++) {
		rh[i] = rh[i] / mn;
		gh[i] = gh[i] / mn;
		bh[i] = bh[i] / mn;
	}

	// caculate the pdf
	for (var i = 1; i < 256; i++) {
		rh[i] = rh[i] + rh[i - 1];
		gh[i] = gh[i] + gh[i - 1];
		bh[i] = bh[i] + bh[i - 1];
	}

	for (var i = 0; i < data.length; i += 4) {
		data2[i] = Math.floor(rh[data[i]] * 255);
		data2[i + 1] = Math.floor(gh[data[i + 1]] * 255);
		data2[i + 2] = Math.floor(bh[data[i + 2]] * 255);
		data2[i + 3] = 255;
	}

	return dst;
}

function aHash(mat) {
	var wStep = mat.col / 8,
		hStep = mat.row / 8;

	var mat64 = [],
		sum = 0,
		avg, ret = '';

	for (var i = 0; i < 8; i++) {
		for (var j = 0; j < 8; j++) {
			mat64[i * 8 + j] = mat.at(Math.ceil(i * hStep), Math.ceil(j * wStep));
			sum += mat64[i * 8 + j];
		}
	}

	avg = sum / 64;

	for (var i = 0; i < 64; i++) {
		if (mat64[i] < avg) {
			ret += '0';
		} else {
			ret += '1';
		}
	}

	console.log(mat.col+'|'+mat.row);
	return ret;
}

function hanDis(m1, m2) {
	var dis = 0;
	for (var i = 0; i < 64; i++) {
		if (m1[i] != m2[i]) dis++;
	}
	return dis;
}

/*
 * FFT implementaion
 */

var Complex = function(real, imaginary) {
	if (arguments.length == 0) {
		this.real = 0;
		this.imaginary = 0;
	} else if (arguments.length == 1) {
		this.real = arguments[0].real;
		this.imaginary = arguments[0].imaginary;
	} else {
		this.real = real;
		this.imaginary = imaginary;
	}

	this.setReal = function(real) {
		this.real = real;
	};

	this.setImaginary = function(imaginary) {
		this.imaginary = imaginary;
	};

	this.getReal = function() {
		return this.real;
	}

	this.plus = function(op) {
		var result = new Complex();
		result.setReal(this.real + op.real);
		result.setImaginary(this.imaginary + op.imaginary);
		return result;
	};

	this.minus = function(op) {
		var result = new Complex();
		result.setReal(this.real - op.real);
		result.setImaginary(this.imaginary - op.imaginary);
		return result;
	};

	this.mul = function(op) {
		var result = new Complex();
		result.setReal(this.real * op.real - this.imaginary * op.imaginary);
		result.setImaginary(this.real * op.imaginary + this.imaginary * op.real);
		return result;
	};

	this.div = function(op) {
		var result = new Complex();
		result.setReal(this.real / op);
		result.setImaginary(this.imaginary / op);
		return result;
	}

	this.norm = function() {
		return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
	}

	this.angle = function() {
		return Math.atan2(this.imaginary, this.real);
	}

	this.conjugate = function() {
		return new Complex(this.real, this.imaginary * (-1));
	}

	this.toString = function() {
		if (this.real == 0) {
			if (this.imaginary == 0) {
				return "0";
			} else {
				return this.imaginary + "i";
			}
		} else {
			if (this.imaginary == 0) {
				return this.real + "";
			} else if (this.imaginary < 0) {
				return this.real + "" + this.imaginary + "j";
			} else {
				return this.real + "+" + this.imaginary + "j";
			}
		}
	};
};

var center = function(mat) {
	var f = [];
	for (var i = 0; i < mat.row; i++) {
		for (var j = 0; j < mat.col; j++) {
			f[i * mat.row + j] = mat.at(i, j) * Math.pow(-1, i + j);
			//f[i * mat.row + j] = mat.at(i, j);
		}
	}
	return f;
};

var scale = function(mat, Fu) {
	var max = -9999999999,
		min = 9999999999;
	for (var i = 0; i < Fu.length; i++) {
		if (Fu[i].norm() > max) {
			max = Fu[i].norm();
		}
		if (Fu[i].norm() < min) {
			min = Fu[i].norm();
		}
	}
	var data = mat.data;
	for (var i = 0; i < mat.data.length; i += 4) {
		data[i] = data[i + 1] = data[i + 2] = 255 * ((Fu[i / 4].norm() - min) / (max - min));
		data[i + 3] = 255;
	}
};

var fft = function(fx) {

	var _2k = fx.length;
	if (_2k == 1) return [fx[0]];

	// caculate the Feven
	var Feven = [];
	for (var i = 0; i < _2k / 2; i++) {
		Feven[i] = fx[i * 2];
	}
	var even = fft(Feven);

	// caculate the Fodd
	var Fodd = [];
	for (var i = 0; i < _2k / 2; i++) {
		Fodd[i] = fx[i * 2 + 1];
	}
	var odd = fft(Fodd);

	var Fu = [];
	// Complex w2k is multiplied by every odd.  
	var w2k = new Complex();

	for (var n = 0; n < _2k / 2; n++) {
		w2k.real = Math.cos(2 * Math.PI * n / _2k);
		w2k.imaginary = Math.sin((-2) * Math.PI * n / _2k);

		var oddw = odd[n].mul(w2k);
		Fu[n] = even[n].plus(oddw);
		Fu[n + _2k / 2] = even[n].minus(oddw);
	}

	return Fu;
};

var fft1D = function(fx, Fu, _2k, stride, start) {
	var tmp = [];

	if (stride == 1) {
		for (var i = 0; i < _2k; i++) {
			// Notice: the params of Constructor
			tmp[i] = new Complex(fx[start + i], 0);
		}
		tmp = ifft(tmp);
		for (var i = 0; i < tmp.length; i++) {
			Fu[start + i] = tmp[i];
		}
	} else {
		for (var i = 0; i < _2k; i++) {
			tmp[i] = new Complex(fx[start + i * stride]);
		}
		tmp = ifft(tmp);
		for (var i = 0; i < tmp.length; i++) {
			Fu[start + i * stride] = tmp[i];
		}
	}
};

var fft2D = function(f, width, height) {

	// Direct line
	var Fu = [];
	for (var i = 0; i < height; i++) {
		fft1D(f, Fu, width, 1, i * width);
	}

	// Direct column
	for (var i = 0; i < width; i++) {
		fft1D(Fu, Fu, height, width, i);
	}
	return Fu;
};

var ifft = function(fx) {
	var _2k = fx.length;

	var Fu = [];

	for (var i = 0; i < _2k; i++) {
		Fu[i] = fx[i].conjugate();
	}
	Fu = fft(Fu);

	for (var i = 0; i < _2k; i++) {
		Fu[i] = Fu[i].conjugate();
		Fu[i] = Fu[i].div(_2k);
	}

	return Fu;
}

var ifft1D = function(fx, Fu, _2k, stride, start) {
	var tmp = [];

	if (stride == 1) {
		for (var i = 0; i < _2k; i++) {
			tmp[i] = new Complex(fx[start + i]);
		}
		tmp = ifft(tmp);
		for (var i = 0; i < tmp.length; i++) {
			Fu[start + i] = tmp[i];
		}
	} else {
		for (var i = 0; i < _2k; i++) {
			tmp[i] = new Complex(fx[start + i * stride]);
		}
		tmp = ifft(tmp);
		for (var i = 0; i < tmp.length; i++) {
			Fu[start + i * stride] = tmp[i];
		}
	}
};

var ifft2D = function(f, width, height) {

	// Direct line
	var Fu = [];
	for (var i = 0; i < height; i++) {
		ifft1D(f, Fu, width, 1, i * width);
	}

	// Direct column
	for (var i = 0; i < width; i++) {
		ifft1D(Fu, Fu, height, width, i);
	}
	return Fu;
};

var test = function() {

	var c1 = new Complex(-0.13480425839330703, 0);
	var c2 = new Complex(0.27910192950176387, 0);
	var c3 = new Complex(0.3233322451735928, 0);
	var c4 = new Complex(0.4659819820667019, 0);
	var c5 = new Complex(0.5659819820667019, 0);
	var c6 = new Complex(0.6659819820667019, 0);
	var c7 = new Complex(0.7659819820667019, 0);
	var c8 = new Complex(0.8659819820667019, 0);

	var fx = [
		c1, c2, c3, c4,
		//c5, c6, c7, c8
	];

	var Fu = fft2D(fx, 2, 2);
	var iFu = ifft2D(Fu, 2, 2);
	alert(iFu[0].real * 4);
	alert(iFu[1].real * 4);
	alert(iFu[2].real * 4);
	alert(iFu[3].real * 4);
};