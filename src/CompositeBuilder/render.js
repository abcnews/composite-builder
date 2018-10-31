const { h, partial } = require('mercury');
const exportPartial = require('./partials/export');
const Controls = require('./Controls');
const Composite = require('./Composite');
const util = require('./util');
require('./index.scss');

module.exports = render;

function render(state) {
  const classChain =
    '.CompositeBuilder' +
    util.classChain({
      'is-modifierHeldDown': state.isModifierHeldDown,
      'is-exporting': state.isExporting
    });

  return h('div#CompositeBuilder--' + state.id + classChain, [
    Composite.render(state.composite),
    Controls.render(state.composite, state.channels),
    Composite.canExport(state) ? partial(exportPartial, state.channels.exportLinkClick) : null
  ]);
}
