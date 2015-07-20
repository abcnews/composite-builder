var hg = require('mercury');

var Composite = require('./Composite');
var util = require('./util');

module.exports = CompositeBuilder;

function CompositeBuilder(db) {

    var isModifierHeldDown = hg.value(false);

    var state = hg.state({
        id: ~(new Date()),
        user: util.getUser(),
        composite: Composite(isModifierHeldDown),
        isModifierHeldDown: isModifierHeldDown,
        isExporting: hg.value(false),
        isExploded: hg.value(false),
        channels: {
            exportLinkClick: exportComposite.bind(null, db),
            textLabelClick: toggleIsExploded
        }
    });

    setupKeyboardEvents(state);

    return state;
}

CompositeBuilder.render = require('./render');

function exportComposite(db, state, data) {
    var $composite, $canvas, tmpBlob;

    $composite = document.querySelector('.Composite');
    $canvas = document.createElement('canvas');
    $canvas.width = $composite.offsetWidth;
    $canvas.height = $composite.offsetHeight;

    state.isExporting.set(true);

    tmpBlob = window.Blob;
    window.Blob = undefined;

    rasterizeHTML.drawDocument(document, $canvas).then(function () {
        window.Blob = tmpBlob;

        state.isExporting.set(false);

        $canvas.toBlob(function (blob) {
            saveAs(blob, 'composite-' + ~~(new Date()) + '.' + data.format.replace('jpeg', 'jpg'));
        }, 'image/' + data.format, data.quality);

        if (!state.isModifierHeldDown() && db) {
            archiveComposite(db, state(), $canvas.toDataURL('image/png;base64'));
        }

    });
}

function archiveComposite(db, state, imageURL) {
    var dbComposite = db.child('composites').push({
        id: state.id,
        user: state.user,
        date: Date.now(),
        isSquared: state.composite.isSquared
    }, function () {
        var dbImage = db.child('images').push(imageURL, function () {
            dbComposite.update({imageKey: dbImage.key()});
        });
    });
}

function toggleIsExploded(state) {
    state.isExploded.set(!state.isExploded());
}

function setupKeyboardEvents(state) {
    window.addEventListener('keydown', function (event) {
        if ((event.metaKey && !event.ctrlKey) || (event.ctrlKey && !event.metaKey)) {
            state.isModifierHeldDown.set(true);
        }
    }, true);

    window.addEventListener('keyup', function (event) {
        if (!event.metaKey && !event.ctrlKey) {
            state.isModifierHeldDown.set(false);
        }
    }, true);
}