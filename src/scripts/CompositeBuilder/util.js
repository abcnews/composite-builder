module.exports = {
	classChain: classChain,
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