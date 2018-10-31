const { app, Delegator } = require('mercury');
const CompositeBuilder = require('./CompositeBuilder');
require('./global.scss');

const root = document.querySelector(`[data-composite-builder-root]`);
const del = Delegator();

del.listenTo('dragover');
del.listenTo('dragleave');
del.listenTo('drop');

app(root, CompositeBuilder(), CompositeBuilder.render);
