/*!
 * composite-builder
 *
 * @version development
 * @author Colin Gourlay <gourlay.colin@abc.net.au>
 */

var hg = require('mercury');

var db = require('./db');
var CompositeBuilder = require('./CompositeBuilder');

require('domready')(function () {
    var d = hg.Delegator();

    d.listenTo('dragover');
    d.listenTo('dragleave');
    d.listenTo('drop');

    hg.app(document.body, CompositeBuilder(db), CompositeBuilder.render);
});