var h = require('mercury').h;
var hg = require('mercury');

var exportPartial = require('./partials/export');
var Controls = require('./Controls');
var Composite = require('./Composite');
var util = require('./util');

module.exports = render;

function render(state) {
    var classChain = '.CompositeBuilder' + util.classChain({
        'is-modifierHeldDown': state.isModifierHeldDown,
        'is-exporting': state.isExporting,
        'is-exploded': state.isExploded
    });

    return h('div#CompositeBuilder--' + state.id + classChain, [
        Composite.render(state.composite),
        Controls.render(state.composite, state.channels),
        Composite.canExport(state) ? hg.partial(exportPartial, state.channels.exportLinkClick) : null
    ]);
}