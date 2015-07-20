var Color = require('color');
var getRGBAPalette = require('get-rgba-palette');
var getImagePixels = require('get-image-pixels');

module.exports = {
	classChain: classChain,
    formattedText: formattedText,
    getTintPalette: getTintPalette,
    getUser: getUser,
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

function formattedText(text) {
    // Opening quote added with CSS
    if (text[0] === '"') { text = text.substr(1); }

    // Closing quote added with CSS
    if (text[text.length - 1] === '"') { text = text.substr(0, text.length - 1); }

    return text.trim();
}

function getTintPalette(image, done) {
    done(getRGBAPalette(getImagePixels(image), 3).map(function (rgba) {
        var color = Color({r: rgba[0], g: rgba[1], b: rgba[2]});
        var lightness = color.lightness();

        return color.lightness(Math.min(25, lightness)).saturation(100).clearer(0.55).rgbString();
    }));
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