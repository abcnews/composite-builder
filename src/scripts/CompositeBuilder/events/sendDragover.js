var hg = require('mercury');

module.exports = hg.BaseEvent(function (ev, broadcast) {
    if (ev.stopPropagation != null) {
        ev.stopPropagation();
    }
    if (ev.preventDefault != null) {
        ev.preventDefault();
    }
    if (ev._rawEvent.dataTransfer) {
        ev._rawEvent.dataTransfer.dropEffect = 'copy';
    }

    broadcast(this.data);
});
