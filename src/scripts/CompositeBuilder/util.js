module.exports = {
	classChain: classChain,
    getUser: getUser,
	loadImage: loadImage,
    limitedNum: limitedNum
};

function classChain(classNames) {
    var chain;

    if (typeof classNames === 'object') {
        chain = Object.keys(classNames).filter(function (className) {
            return classNames[className];
        }).join('.');
    } else {
        chain = Array.prototype.join.call(arguments, '.');
    }

    return chain ? '.' + chain : '';
}

function getUser() {
    var user = window.localStorage.getItem('user');

    if (!user) {
        user = Math.floor(Math.random()*16777215).toString(16);
        window.localStorage.setItem('user', user);
    }

    return user;
}

function limitedNum(num, min, max) {
    return Math.min(Math.max(min, num), max);
}

function loadImage(src, opt, callback) {
	var el, locked;

	if (typeof opt === 'function') {
		callback = opt;
		opt = null;
	}

	el = document.createElement('img');

	el.onload = function () {
		if (locked) {
			return;
		}

		locked = true;

		if (typeof callback === 'function') {
			callback(null, el);
		}
	};

	el.onerror = function () {
		if (locked) {
			return;
		}

		locked = true;

		if (typeof callback === 'function') {
			callback(new Error('Unable to load "' + src + '"'), el);
		}
	};

	if (opt && opt.crossOrigin) {
		el.crossOrigin = opt.crossOrigin;
	}

	el.src = src;

	return el;
}
