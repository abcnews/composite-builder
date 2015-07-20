var hg = require('mercury');

var render = require('./render');

module.exports = ArchivedComposite;

function ArchivedComposite(initialState) {
    var state = hg.state(initialState || {});

    return state;
}

ArchivedComposite.render = render;