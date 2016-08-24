/*!
 * composite-builder
 *
 * @version development
 * @author Colin Gourlay <gourlay.colin@abc.net.au>
 */

var domready = require('domready');
var hg = require('mercury');
var scriptroot = require('scriptroot');
var CompositeBuilder = require('./CompositeBuilder');
var db = require('./db');

var ASSETS_ROOT = scriptroot().slice(0, -8);
var del = hg.Delegator();

del.listenTo('dragover');
del.listenTo('dragleave');
del.listenTo('drop');

domready(function () {
    hg.app(document.body, CompositeBuilder(db, ASSETS_ROOT), CompositeBuilder.render);
});
