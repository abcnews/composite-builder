/*!
 * composite-builder - archive
 *
 * @version development
 * @author Colin Gourlay <gourlay.colin@abc.net.au>
 */

var hg = require('mercury');

var ArchivedComposite = require('./ArchivedComposite');
var render = require('./render');
var sync = require('./sync');

module.exports = Archive;

function Archive(db, compositesLimit) {
    var state = hg.state({
        composites: hg.varhash({}, ArchivedComposite),
        images: hg.varhash({}),
        channels: {
        	removeCompositeById: removeCompositeById.bind(null, db)
        }
    });

    sync(state, db, compositesLimit);

    return state;
}

Archive.render = render;

function removeCompositeById(db, state, id) {
    var composite = state.composites.get(id);

    if (composite) {
    	if (composite.imageKey) {
    		db.child('images/' + composite.imageKey).remove();
    	}
    	db.child('composites/' + id).remove();
    }
}