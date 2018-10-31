const { state, value } = require('mercury');
const Composite = require('./Composite');

module.exports = CompositeBuilder;

function CompositeBuilder() {
  const isModifierHeldDown = value(false);

  const _state = state({
    id: ~new Date(),
    composite: Composite(isModifierHeldDown),
    isModifierHeldDown: isModifierHeldDown,
    isExporting: value(false),
    channels: {
      exportLinkClick: exportComposite
    }
  });

  setupKeyboardEvents(_state);

  return _state;
}

CompositeBuilder.render = require('./render');

function exportComposite(state, data) {
  const $composite = document.querySelector('.Composite');
  const $canvas = document.createElement('canvas');

  $canvas.width = $composite.offsetWidth;
  $canvas.height = $composite.offsetHeight;

  state.isExporting.set(true);

  rasterizeHTML
    .drawDocument(document, $canvas, {
      baseUrl: __webpack_public_path__
    })
    .then(() => {
      state.isExporting.set(false);

      $canvas.toBlob(
        blob => saveAs(blob, 'composite-' + ~~new Date() + '.' + data.format.replace('jpeg', 'jpg')),
        'image/' + data.format,
        data.quality
      );
    });
}

function setupKeyboardEvents(state) {
  window.addEventListener(
    'keydown',
    event => {
      if ((event.metaKey && !event.ctrlKey) || (event.ctrlKey && !event.metaKey)) {
        state.isModifierHeldDown.set(true);
      }
    },
    true
  );

  window.addEventListener(
    'keyup',
    event => {
      if (!event.metaKey && !event.ctrlKey) {
        state.isModifierHeldDown.set(false);
      }
    },
    true
  );
}
