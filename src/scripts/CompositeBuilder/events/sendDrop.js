var hg = require('mercury');
var xtend = require('xtend');

module.exports = hg.BaseEvent(function (ev, broadcast) {
    if (ev.stopPropagation != null) {
        ev.stopPropagation();
    }
    if (ev.preventDefault != null) {
        ev.preventDefault();
    }
    if (ev._rawEvent.dataTransfer) {
        return broadcast(xtend({
            url: ev._rawEvent.dataTransfer.getData('URL'),
            text: ev._rawEvent.dataTransfer.getData('Text'),
            files: Array.prototype.slice.call(ev._rawEvent.dataTransfer.files)
        }, this.data));
    }

    broadcast(this.data);
});
