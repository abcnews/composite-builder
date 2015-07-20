/*!
 * composite-builder - archive
 *
 * @version development
 * @author Colin Gourlay <gourlay.colin@abc.net.au>
 */

var hg = require('mercury');

var db = require('./db');
var Archive = require('./Archive');

var PROMOS_LIMIT = 30;

require('domready')(function () {
    hg.app(document.body, Archive(db, PROMOS_LIMIT), Archive.render);
});