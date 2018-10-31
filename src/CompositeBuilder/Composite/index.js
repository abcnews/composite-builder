const { channels } = require('mercury');
const observify = require('observify');
const render = require('./render');
const util = require('../util');

module.exports = Composite;

const STATE_DEFAULTS = {
  imageAURL: '',
  imageASource: '',
  imageADimensions: { width: 0, height: 0 },
  imageAOffset: { x: 0, y: 0 },
  imageAMinScale: 1,
  imageAScale: 1,

  imageBURL: '',
  imageBSource: '',
  imageBDimensions: { width: 0, height: 0 },
  imageBOffset: { x: 0, y: 0 },
  imageBMinScale: 1,
  imageBScale: 1,

  partitionPct: 50,

  isSquared: false,
  isDroppable: false,
  isFAQVisible: false,

  channels: null
};

const MIN_PARTITION_PCT = 25;

function Composite(isModifierHeldDownState) {
  const state = observify(STATE_DEFAULTS);

  state.channels.set(
    channels(
      {
        propsChange: onChangeProps,
        imageScaleRangeChange: onChangeImageScaleRange,
        dragover: enableDrop,
        dragleave: disableDrop,
        imageADrop: dropHandler('imageAURL'),
        imageBDrop: dropHandler('imageBURL'),
        imageAPick: filePickerHandler('imageAURL'),
        imageBPick: filePickerHandler('imageBURL')
      },
      state
    )
  );

  setupInternalUpdates(state);
  setupPointerInteractions(state, isModifierHeldDownState);

  return state;
}

Composite.render = render;

Composite.canExport = state => !state.composite.isFAQVisible && state.composite.imageAURL && state.composite.imageBURL;

function setupInternalUpdates(state) {
  // When an image URL changes:
  // * reset the offset & scale
  // * set the new image orientation
  state.imageAURL(imageURL =>
    util.loadImage(imageURL, { crossOrigin: true }, (err, image) => {
      if (err) {
        return;
      }

      resetProp(state, 'imageAOffset');
      resetProp(state, 'imageAScale');
      state.imageADimensions.set({ width: image.naturalWidth, height: image.naturalHeight });
      constrainImageA(state);
      state.imageAScale.set(state.imageAMinScale());
    })
  );
  state.imageBURL(imageURL =>
    util.loadImage(imageURL, (err, image) => {
      if (err) {
        return;
      }

      resetProp(state, 'imageBOffset');
      resetProp(state, 'imageBScale');
      state.imageBDimensions.set({ width: image.naturalWidth, height: image.naturalHeight });
      constrainImageB(state);
      state.imageBScale.set(state.imageBMinScale());
    })
  );

  // When an image's minimum scale changes, update its current scale
  state.imageAMinScale(minScale => state.imageAScale.set(Math.max(state.imageAScale(), minScale)));
  state.imageBMinScale(minScale => state.imageBScale.set(Math.max(state.imageBScale(), minScale)));

  // When the composite dimensions change, re-constrain the images
  state.isSquared(() =>
    setTimeout(() => {
      constrainImageA(state);
      constrainImageB(state);
    }, 250)
  );
}

function disableDrop(state) {
  state.isDroppable.set(false);
}

function enableDrop(state) {
  state.isDroppable.set(true);
}

function filePickerHandler(propName) {
  const updater = imageUpdater(propName);

  return function onPick(state) {
    [].slice.call(document.querySelector('.Controls-' + propName).files).forEach(updater.bind(state));
  };
}

function dropHandler(propName) {
  const updater = imageUpdater(propName);

  return function onDrop(state, data) {
    if (data.files.length) {
      data.files.forEach(updater.bind(state));
    } else if (data.url) {
      if (data.url.indexOf('www.abc.net.au') > -1) {
        state[propName].set(data.url);
      } else {
        window.alert('Web images can only be dropped directly from www.abc.net.au');
      }
    }

    state.isDroppable.set(false);
  };
}

function imageUpdater(propName) {
  return function(file) {
    const state = this;

    if (!file.type.match('image.*')) {
      return;
    }

    const reader = new FileReader();

    reader.onload = ({ target }) => state[propName].set(target.result);
    reader.readAsDataURL(file);
  };
}

function onChangeImageScaleRange(state, data) {
  if ('imageAScale' in data) {
    state.imageAScale.set(data.imageAScale);
    constrainImageA(state);
  }

  if ('imageBScale' in data) {
    state.imageBScale.set(data.imageBScale);
    constrainImageB(state);
  }
}

function setupPointerInteractions(state, isModifierHeldDownState) {
  interact('.Composite-partitionMoveHandle').draggable({
    onmove: event => {
      movePartition(state, event.dx);
      constrainImageA(state);
      constrainImageB(state);

      event.preventDefault();
    }
  });

  interact('.Composite-image--a').draggable({
    onmove: event => {
      const imageOffset = state.imageAOffset();
      const imageScale = state.imageAScale();
      const imageMinScale = state.imageAMinScale();

      if (isModifierHeldDownState()) {
        state.imageAScale.set(util.limitedNum(imageScale + event.dy * 0.005, imageMinScale, imageMinScale * 2));
      } else {
        state.imageAOffset.set({
          x: imageOffset.x + event.dx,
          y: imageOffset.y + event.dy
        });
      }

      constrainImageA(state);

      event.preventDefault();
    }
  });

  interact('.Composite-image--b').draggable({
    onmove: event => {
      const imageOffset = state.imageBOffset();
      const imageScale = state.imageBScale();
      const imageMinScale = state.imageBMinScale();

      if (isModifierHeldDownState()) {
        state.imageBScale.set(util.limitedNum(imageScale + event.dy * 0.005, imageMinScale, imageMinScale * 2));
      } else {
        state.imageBOffset.set({
          x: imageOffset.x + event.dx,
          y: imageOffset.y + event.dy
        });
      }

      constrainImageB(state);

      event.preventDefault();
    }
  });

  interact('.Composite-image--a').on('doubletap', event => {
    document.querySelector('.Controls-imageAURL').click();
    event.preventDefault();
  });

  interact('.Composite-image--b').on('doubletap', event => {
    document.querySelector('.Controls-imageBURL').click();
    event.preventDefault();
  });
}

function constrainImageA(state) {
  const composite = document.querySelector('.Composite');
  const compositeStyle = window.getComputedStyle(composite);
  const compositeWidth = +compositeStyle.width.replace('px', '');
  const panelWidth = (compositeWidth / 100) * state.partitionPct();
  const compositeHeight = +compositeStyle.height.replace('px', '');
  const imageDimensions = state.imageADimensions();
  const imageOffset = state.imageAOffset();

  // Image should never be smaller than panel (this will update the current scale too, if required)
  state.imageAMinScale.set(1 / Math.min(imageDimensions.width / panelWidth, imageDimensions.height / compositeHeight));

  const imageScale = state.imageAScale();

  // Image should never be offset inside the composite
  state.imageAOffset.set({
    x: util.limitedNum(
      imageOffset.x,
      0.5 * (panelWidth - imageDimensions.width * imageScale),
      0.5 * (imageDimensions.width * imageScale - panelWidth)
    ),
    y: util.limitedNum(
      imageOffset.y,
      0.5 * (compositeHeight - imageDimensions.height * imageScale),
      0.5 * (imageDimensions.height * imageScale - compositeHeight)
    )
  });
}

function constrainImageB(state) {
  const composite = document.querySelector('.Composite');
  const compositeStyle = window.getComputedStyle(composite);
  const compositeWidth = +compositeStyle.width.replace('px', '');
  const panelWidth = (compositeWidth / 100) * (100 - state.partitionPct());
  const compositeHeight = +compositeStyle.height.replace('px', '');
  const imageDimensions = state.imageBDimensions();
  const imageOffset = state.imageBOffset();

  // Image should never be smaller than panel (this will update the current scale too, if required)
  state.imageBMinScale.set(1 / Math.min(imageDimensions.width / panelWidth, imageDimensions.height / compositeHeight));

  const imageScale = state.imageBScale();

  // Image should never be offset inside the composite
  state.imageBOffset.set({
    x: util.limitedNum(
      imageOffset.x,
      0.5 * (panelWidth - imageDimensions.width * imageScale),
      0.5 * (imageDimensions.width * imageScale - panelWidth)
    ),
    y: util.limitedNum(
      imageOffset.y,
      0.5 * (compositeHeight - imageDimensions.height * imageScale),
      0.5 * (imageDimensions.height * imageScale - compositeHeight)
    )
  });
}

function movePartition(state, dx) {
  const partitionPct = state.partitionPct();
  const compositeWidth = +window.getComputedStyle(document.querySelector('.Composite')).width.replace('px', '');
  const deltaPct = (dx / compositeWidth) * 100;

  state.partitionPct.set(util.limitedNum(partitionPct + deltaPct, MIN_PARTITION_PCT, 100 - MIN_PARTITION_PCT));
}

function resetProp(state, propName) {
  state[propName].set(STATE_DEFAULTS[propName]);
}

function onChangeProps(state, data) {
  for (let propName in data) {
    state[propName].set(data[propName]);
  }
}
