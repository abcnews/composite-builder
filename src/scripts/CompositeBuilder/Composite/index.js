var hg = require('mercury');
var img = require('img');
var observify = require('observify');
var raf = require('raf');

var render = require('./render');
var util = require('../util');

module.exports = Composite;

var STATE_DEFAULTS = {
    imageURL: '',
    imageSource: '',
    imageDimensions: {width: 0, height: 0},
    imageOffset: {x: 0, y: 0},
    imageMinScale: 1,
    imageScale: 1,
    isImageContained: false,
    isSquared: false,
    theme: 'tinted',
    tintIndex: 0,
    tintPalette: [],
    text: '',
    textSource: '',
    textAlign: 'left',
    textWidthPct: 40,
    textHeightPct: 40,
    blurClip: 'rect(0,0,0,0)',
    presetBranding: '',
    customBrandingURL: '',
    isDroppable: false,
    isFAQVisible: false,
    channels: null
};

function Composite(isModifierHeldDownState) {
    var state = observify(STATE_DEFAULTS);

    state.channels.set(hg.channels({
    	propsChange: onChangeProps,
    	imageScaleRangeChange: onChangeImageScaleRange,
    	dragover: enableDrop,
    	dragleave: disableDrop,
    	imageDrop: dropHandler('imageURL'),
    	brandingDrop: dropHandler('customBrandingURL'),
    	imagePick: filePickerHandler('imageURL'),
    	brandingPick: filePickerHandler('customBrandingURL')
    }, state));

    setupInternalUpdates(state);
    setupPointerInteractions(state, isModifierHeldDownState);

    return state;
}

Composite.render = render;

Composite.canExport = function (state) {
    return !state.composite.isFAQVisible && (state.composite.imageURL || state.composite.text);
};

function setupInternalUpdates(state) {

    // When the image URL changes:
    // * reset the offset & scale
    // * set the new image orientation
    // * grab a new tint palette
    state.imageURL(function (imageURL) {
        img(imageURL, function (err, image) {
            if (err) {
                resetProp(state, 'tintIndex');
                resetProp(state, 'tintPalette');
                return;
            }

            resetProp(state, 'imageOffset');
            resetProp(state, 'imageScale');
            state.imageDimensions.set({width: image.naturalWidth, height: image.naturalHeight});
            constrainImage(state);
            state.imageScale.set(state.imageMinScale());

            util.getTintPalette(image, function (palette) {
                resetProp(state, 'tintIndex');
                state.tintPalette.set(palette);
            });
        });
        
    });

    // When the image's minimum scale changes, update its current scale
    state.imageMinScale(function (minScale) {
        state.imageScale.set(Math.max(state.imageScale(), minScale));
    });

    // When the composite dimensions change, re-constrain the image
    state.isSquared(function () {
        setTimeout(function () {
            constrainImage(state);
        }, 250);
    });

    // When a custom branding image URL exists, reset the currently chosen preset
    state.customBrandingURL(function () {
        resetProp(state, 'presetBranding');
    });

    // When any of the blur clip-impacting property changes, update it
    // (ensuring the (un-)squaring animation has completed when appropriate)
    var blurImpactingProps = ['text', 'textSource', 'textAlign', 'textWidthPct', 'textHeightPct', 'isSquared'];
    var boundUpdateBlurClip = updateBlurClip.bind(null, state);
    var rafUpdateBlurClipHandle = null;
    var rafUpdateBlurClip = function () {
        if (rafUpdateBlurClipHandle) { raf.cancel(rafUpdateBlurClipHandle); }

        rafUpdateBlurClipHandle = raf(boundUpdateBlurClip);
    };
    blurImpactingProps.map(function (propName) {
        if (propName === 'isSquared') {
            state[propName](function () {
                resetProp(state, 'blurClip');
                setTimeout(boundUpdateBlurClip, 300);
            });
        } else {
            state[propName](rafUpdateBlurClip);
        }
    });

}

function updateBlurClip(state) {
    var composite = document.querySelector('.Composite');
    var blockquote = document.querySelector('.Composite-text blockquote');

    if (!composite || !blockquote) { return; }

    var compositeStyle = window.getComputedStyle(composite);
    var compositeWidth = +compositeStyle.width.replace('px', '');
    var compositeHeight = +compositeStyle.height.replace('px', '');
    var blockquoteStyle = window.getComputedStyle(blockquote);
    var blockquoteWidth = +blockquoteStyle.width.replace('px', '');
    var blockquoteHeight = +blockquoteStyle.height.replace('px', '');
    var clipLeft = 0;
    var clipRight = compositeWidth;
    var clipTop = 0;
    var clipBottom = compositeHeight;
    var textAlign = state.textAlign();
    var isSquared = state.isSquared();

    switch (textAlign) {
        case 'left':
            clipRight = blockquoteWidth;
            break;
        case 'right':
            clipLeft = compositeWidth - blockquoteWidth;
            break;
        case 'top':
            clipBottom = blockquoteHeight;
            clipLeft = isSquared ? clipLeft : (compositeWidth - blockquoteWidth) / 2;
            clipRight = clipLeft + blockquoteWidth;
            break;
        case 'bottom':
            clipTop = compositeHeight - blockquoteHeight;
            clipLeft = isSquared ? clipLeft : (compositeWidth - blockquoteWidth) / 2;
            clipRight = clipLeft + blockquoteWidth;
            break;
        case 'centre':
            clipLeft = (compositeWidth - blockquoteWidth) / 2;
            clipRight = clipLeft + blockquoteWidth;
            clipTop = (compositeHeight - blockquoteHeight) / 2;
            clipBottom = clipTop + blockquoteHeight;
            break;
        default:
            break;
    }

    var blurClip ='rect(' + clipTop + 'px, ' + clipRight + 'px, ' + clipBottom + 'px, ' + clipLeft +'px)';

    state.blurClip.set(blurClip);
}

function disableDrop(state) {
    state.isDroppable.set(false);
}

function enableDrop(state) {
    state.isDroppable.set(true);
}

function filePickerHandler(propName) {
    var updater = imageUpdater(propName);

    return function onPick(state) {
        [].slice.call(document.querySelector('.Controls-' + propName).files).forEach(updater.bind(state));
    };
}

function dropHandler(propName) {
    var updater = imageUpdater(propName);

    return function onDrop(state, data) {
        if (data.files.length) {
            data.files.forEach(updater.bind(state));
        } else if (data.url) {
            if (data.url.indexOf('www.abc.net.au') > -1) {
                state[propName].set(data.url);
            } else {
                window.alert('Web images can only be dropped directly from www.abc.net.au');
            }
        } else if (data.text) {
            state.text.set(data.text);
        }

        state.isDroppable.set(false);
    };
}

function imageUpdater(propName) {
    return function (file) {
        var state = this;

        if (!file.type.match('image.*')) {
            return;
        }

        if ('URL' in window && 'createObjectURL' in window.URL) {
            window.URL.revokeObjectURL(state[propName]());
            state[propName].set(window.URL.createObjectURL(file));
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            state[propName].set(e.target.result);
        };
        reader.readAsDataURL(file);
    };
}

function onChangeImageScaleRange(state, data) {
    state.imageScale.set(data.imageScale);
    constrainImage(state);
}

var DRAG_KILL = {
    onmove: function (event) {
        event.preventDefault();
    }
};

function setupPointerInteractions(state, isModifierHeldDownState) {
    interact('.Composite-textResizeHandle').draggable({
        onmove: function (event) {
            var textAlign = state.textAlign();

            if (textAlign === 'left' || textAlign === 'right') {
                resizeTextWidth(state, event.dx);
            } else {
                resizeTextHeight(state, event.dy);
            }

            event.preventDefault();
        }
    });

    interact('.Composite-text blockquote').draggable(DRAG_KILL);

    interact('.Composite-text branding').draggable(DRAG_KILL);

    interact('.Composite').draggable({
        onmove: function (event) {
            var imageOffset, imageScale, imageMinScale;

            imageOffset = state.imageOffset();
            imageScale = state.imageScale();
            imageMinScale = state.imageMinScale();

            if (isModifierHeldDownState()) {
                state.imageScale.set(util.limitedNum(imageScale + event.dy * 0.005, imageMinScale, imageMinScale * 2));
            } else {
                state.imageOffset.set({
                    x: imageOffset.x + event.dx,
                    y: imageOffset.y + event.dy
                });
            }

            constrainImage(state);

            event.preventDefault();
        }
    });

    interact('.Composite').on('doubletap', function (event) {
        document.querySelector('.Controls-imageURL').click();
        event.preventDefault();
    });

    interact('.Composite-branding img, .Composite-brandingPlaceholder').on('doubletap', function (event) {
        document.querySelector('.Controls-customBrandingURL').click();
        event.preventDefault();
        event.stopPropagation();
    });

    interact('.Composite-branding img, .Composite-brandingPlaceholder').on('tap', function (event) {
        if (isModifierHeldDownState()) {
            if ('URL' in window && 'createObjectURL' in window.URL) {
                window.URL.revokeObjectURL(state.customBrandingURL());
            }

            document.querySelector('.Controls-customBrandingURL').value = null;
            resetProp(state, 'customBrandingURL');
        }

        event.preventDefault();
        event.stopPropagation();
    });
}

function constrainImage(state) {
    var composite = document.querySelector('.Composite');
    var compositeStyle = window.getComputedStyle(composite);
    var compositeWidth = +compositeStyle.width.replace('px', '');
    var compositeHeight = +compositeStyle.height.replace('px', '');
    var imageDimensions = state.imageDimensions();
    var imageOffset = state.imageOffset();
    var imageScale;

    // Image should never be smaller than composite (this will update the current scale too, if required)
    state.imageMinScale.set(1 / Math.min(imageDimensions.width / compositeWidth, imageDimensions.height / compositeHeight));

    imageScale = state.imageScale();

    // Image should never be offset inside the composite
    state.imageOffset.set({
        x: util.limitedNum(imageOffset.x, 0.5 * (compositeWidth - imageDimensions.width * imageScale), 0.5 * (imageDimensions.width * imageScale - compositeWidth)),
        y: util.limitedNum(imageOffset.y, 0.5 * (compositeHeight - imageDimensions.height * imageScale), 0.5 * (imageDimensions.height * imageScale - compositeHeight))
    });
}

function resizeTextWidth(state, dx) {
    var textAlignIsLeft = state.textAlign() === 'left';
    var textWidthPct = state.textWidthPct();
    var compositeWidth = +window.getComputedStyle(document.querySelector('.Composite')).width.replace('px', '');
    var deltaPct = dx / compositeWidth * 100;

    state.textWidthPct.set(textWidthPct + (textAlignIsLeft ? deltaPct : -deltaPct));
}

function resizeTextHeight(state, dy) {
    var textAlignIsTop = state.textAlign() === 'top';
    var textHeightPct = state.textHeightPct();
    var compositeHeight = +window.getComputedStyle(document.querySelector('.Composite')).height.replace('px', '');
    var deltaPct = dy / compositeHeight * 100;

    state.textHeightPct.set(textHeightPct + (textAlignIsTop ? deltaPct : -deltaPct));
}

function resetProp(state, propName) {
    state[propName].set(STATE_DEFAULTS[propName]);
}

function onChangeProps(state, data) {
    for (var propName in data) {
        state[propName].set(data[propName]);
    }
}