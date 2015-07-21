var h = require('mercury').h;
var hg = require('mercury');

var events =require('../events');
var faqPartial = require('../partials/faq');
var util = require('../util');

module.exports = render;

function render(state) {
    var classChain = util.classChain({
        'Composite--squared': state.isSquared,
        'Composite--droppable': state.isDroppable
    });

    return h('div.Composite' + classChain, {
        'ev-dragover': events.sendDragover(state.channels.dragover),
        'ev-dragleave': events.sendDragleave(state.channels.dragleave)
    }, [
        renderImageA(state),
        renderImageB(state),
        renderPartitionMoveHandle(state),
        (state.isFAQVisible ?
            hg.partial(faqPartial, state.channels.propsChange) :
            null),
    ]);
}

function renderImageA(state) {
    var imageOffsetTop = state.imageAOffset.y + 'px';
    var imageOffsetLeft = state.imageAOffset.x + 'px';
    var imageScale = state.imageAScale;

    return h('div.Composite-image.Composite-image--a', {
        style: { right: (100 - state.partitionPct) + '%' },
        'ev-drop': events.sendDrop(state.channels.imageADrop)
    }, (state.imageAURL ? [
        h('img', {
            src: state.imageAURL,
            style: {
                top: imageOffsetTop,
                left: imageOffsetLeft,
                transform: 'scale(' + imageScale + ')'
            }
        }),
        (state.imageASource ? h('em', state.imageASource) : null)
    ] : null));
}

function renderImageB(state) {
    var imageOffsetTop = state.imageBOffset.y + 'px';
    var imageOffsetLeft = state.imageBOffset.x + 'px';
    var imageScale = state.imageBScale;

    return h('div.Composite-image.Composite-image--b', {
        style: { left: state.partitionPct + '%' },
        'ev-drop': events.sendDrop(state.channels.imageBDrop)
    }, (state.imageBURL ? [
        h('img', {
            src: state.imageBURL,
            style: {
                top: imageOffsetTop,
                left: imageOffsetLeft,
                transform: 'scale(' + imageScale + ')'
            }
        }),
        (state.imageBSource ? h('em', state.imageBSource) : null)
    ] : null));
}

function renderPartitionMoveHandle(state) {
    return h('a.Composite-partitionMoveHandle', {
        style: { left: state.partitionPct + '%' },
        title: Math.round(state.partitionPct) + '%'
    });
}