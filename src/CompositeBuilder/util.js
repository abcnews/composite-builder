function classChain(classNames) {
  let chain;

  if (typeof classNames === 'object') {
    chain = Object.keys(classNames)
      .filter(className => classNames[className])
      .join('.');
  } else {
    chain = Array.prototype.join.call(arguments, '.');
  }

  return chain ? '.' + chain : '';
}

function limitedNum(num, min, max) {
  return Math.min(Math.max(min, num), max);
}

function loadImage(src, opt, callback) {
  if (typeof opt === 'function') {
    callback = opt;
    opt = null;
  }

  const el = document.createElement('img');
  let locked;

  el.onload = () => {
    if (locked) {
      return;
    }

    locked = true;

    if (typeof callback === 'function') {
      callback(null, el);
    }
  };

  el.onerror = () => {
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

module.exports = {
  classChain,
  loadImage,
  limitedNum
};
