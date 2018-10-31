const { h, partial } = require('mercury');
const events = require('../events');
const faqPartial = require('../partials/faq');
const util = require('../util');
require('./index.scss');

module.exports = render;

function render(state) {
  const classChain = util.classChain({
    'Composite--squared': state.isSquared,
    'Composite--droppable': state.isDroppable
  });

  return h(
    'div.Composite' + classChain,
    {
      'ev-dragover': events.sendDragover(state.channels.dragover),
      'ev-dragleave': events.sendDragleave(state.channels.dragleave)
    },
    [
      renderImageA(state),
      renderImageB(state),
      renderPartitionMoveHandle(state),
      state.isFAQVisible ? partial(faqPartial, state.channels.propsChange) : null
    ]
  );
}

function renderImageA(state) {
  const imageOffsetTop = state.imageAOffset.y + 'px';
  const imageOffsetLeft = state.imageAOffset.x + 'px';
  const imageScale = state.imageAScale;

  return h(
    'div.Composite-image.Composite-image--a',
    {
      style: { right: 100 - state.partitionPct + '%' },
      'ev-drop': events.sendDrop(state.channels.imageADrop)
    },
    state.imageAURL
      ? [
          h('img', {
            src: state.imageAURL,
            style: {
              top: imageOffsetTop,
              left: imageOffsetLeft,
              transform: 'scale(' + imageScale + ')'
            }
          }),
          state.imageASource ? h('em', state.imageASource) : null
        ]
      : null
  );
}

function renderImageB(state) {
  const imageOffsetTop = state.imageBOffset.y + 'px';
  const imageOffsetLeft = state.imageBOffset.x + 'px';
  const imageScale = state.imageBScale;

  return h(
    'div.Composite-image.Composite-image--b',
    {
      style: { left: state.partitionPct + '%' },
      'ev-drop': events.sendDrop(state.channels.imageBDrop)
    },
    state.imageBURL
      ? [
          h('img', {
            src: state.imageBURL,
            style: {
              top: imageOffsetTop,
              left: imageOffsetLeft,
              transform: 'scale(' + imageScale + ')'
            }
          }),
          state.imageBSource ? h('em', state.imageBSource) : null
        ]
      : null
  );
}

function renderPartitionMoveHandle(state) {
  return h('a.Composite-partitionMoveHandle', {
    style: { left: state.partitionPct + '%' },
    title: Math.round(state.partitionPct) + '%'
  });
}
