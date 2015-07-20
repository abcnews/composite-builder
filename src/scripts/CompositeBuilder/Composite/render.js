var h = require('mercury').h;
var hg = require('mercury');

var branding = require('../branding');
var events =require('../events');
var faqPartial = require('../partials/faq');
var util = require('../util');

module.exports = render;

function render(state) {
    var classChain = util.classChain(
        'Composite',
        'Composite--textAlign-' + state.textAlign,
        'Composite--theme-' + state.theme
    ) + util.classChain({
        'Composite--squared': state.isSquared,
        'Composite--droppable': state.isDroppable
    });

    return h('div' + classChain, {
        'ev-dragover': events.sendDragover(state.channels.dragover),
        'ev-dragleave': events.sendDragleave(state.channels.dragleave),
        'ev-drop': events.sendDrop(state.channels.imageDrop)
    }, [
        renderImage(state),
        (state.imageURL && state.text ?
            renderImage(state, true) :
            h('div')),
        (state.text ?
            renderText(state) :
            h('div')),
        renderBranding(state),
        (state.isFAQVisible ?
            hg.partial(faqPartial, state.channels.propsChange) :
            null),
    ]);
}

function renderImage(state, isClipped) {
    var imageOffsetTop = state.imageOffset.y + 'px';
    var imageOffsetLeft = state.imageOffset.x + 'px';
    var imageScale = state.imageScale;
    var classChain = util.classChain({
        'Composite-image': !isClipped,
        'Composite-clippedImage': isClipped
    });

    return h('div' + classChain, isClipped ? {
        style: {
            clip: state.blurClip
        }
    } : {}, (state.imageURL ? [
        h('img', {
            src: state.imageURL,
            style: {
                top: imageOffsetTop,
                left: imageOffsetLeft,
                transform: 'scale(' + imageScale + ')'
            }
        })
    ] : null));
}

function renderText(state) {
    var blockquoteStyle = {};
    var textScale = 'normal';
    var isTextAlignVertical = state.textAlign === 'left' || state.textAlign === 'right';
    var isTextAlignHorizontal = state.textAlign === 'top' || state.textAlign === 'bottom';
    var effectiveTextLength;

    if (isTextAlignVertical) {
        blockquoteStyle.width = state.textWidthPct + '%';
    } else if (isTextAlignHorizontal) {
        blockquoteStyle.height = state.textHeightPct + '%';
    }

    if (state.theme === 'tinted') {
        blockquoteStyle['background-color'] = getTint(state);
    }

    effectiveTextLength = state.text.length;
    if (state.isSquared) { effectiveTextLength += 50; }
    if (isTextAlignVertical && state.textWidthPct > 55) { effectiveTextLength -= 25; }
    if (isTextAlignVertical && state.textWidthPct < 45) { effectiveTextLength += 25; }


    if (effectiveTextLength < 50) {
        textScale = 'largest';
    } else if (effectiveTextLength < 75) {
        textScale = 'larger';
    } else if (effectiveTextLength < 100) {
        textScale = 'large';
    } else if (effectiveTextLength > 175) {
        textScale = 'smallest';
    } else if (effectiveTextLength > 150) {
        textScale = 'smaller';
    } else if (effectiveTextLength > 125) {
        textScale = 'small';
    }

    return h('div.Composite-text', [
        h('blockquote' + '.scale-' + textScale + ((state.text[0] === '"') ? '.quote' : ''), { style: blockquoteStyle }, [
            h('p', [
                util.formattedText(state.text),
                (state.text.length > 1 && state.text[state.text.length - 1] === '"' ? h('span') : null)
            ]),
            (state.textSource ? h('cite', state.textSource) : null),
            (state.imageSource && state.imageSource ? h('em', state.imageSource) : null),
            (state.textAlign !== 'centre' ? h('a.Composite-textResizeHandle.Composite-textResizeHandle--' + (isTextAlignVertical ? 'vertical' : 'horizontal')) : null)
        ])
    ]);
}

function renderBranding(state) {
    return h('div.Composite-branding', (state.presetBranding || state.customBrandingURL ?
        h('img' + (state.presetBranding && branding[state.presetBranding].drop ? '.is-shadowed' : ''), {
            src: state.presetBranding ?
                'images/branding/' + branding[state.presetBranding].url :
                state.customBrandingURL,
            'ev-drop': events.sendDrop(state.channels.brandingDrop)
        }) :
        h('div.Composite-brandingPlaceholder', {
            'ev-drop': events.sendDrop(state.channels.brandingDrop)
        }))
    );
}

function getTint(state) {
    return state.tintPalette[state.tintIndex];
}