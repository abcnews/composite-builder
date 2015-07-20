var queue = require('queue');
var xtend = require('xtend');

module.exports = sync;

function sync(state, db, compositesLimit) {
    var dbComposites = db.child('composites').orderByChild('date').limitToLast(compositesLimit);
    var imageQueue = queue({concurrency: 1, timeout: 20000});

    dbComposites.on('child_added', onCompositeAddedOrChanged.bind(null, state, db, imageQueue));
    dbComposites.on('child_changed', onCompositeAddedOrChanged.bind(null, state, db, imageQueue));
    dbComposites.on('child_removed', onCompositeRemoved.bind(null, state, db));
}

function onCompositeAddedOrChanged(state, db, imageQueue, snapshot) {
    var _id = snapshot.key();
    var composite = snapshot.val();

    state.composites.put(_id, xtend(composite, {_id: _id}));

    if (composite.imageKey) {
        imageQueue.unshift(function (done) {
            db.child('images/' + composite.imageKey)
               .once('value', putImage.bind(null, state, done));
        });
        imageQueue.start();
    }
}

function onCompositeRemoved(state, db, snapshot) {
    var composite = state.composites.get(snapshot.key());

    if (composite) {
        state.composites.delete(snapshot.key());
        state.images.delete(composite.imageKey);
    }
}

function putImage(state, done, snapshot) {
	state.images.put(snapshot.key(), snapshot.val());
    done();
}