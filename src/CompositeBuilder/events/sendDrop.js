const { BaseEvent } = require('mercury');

module.exports = BaseEvent(function(event, broadcast) {
  if (event.stopPropagation != null) {
    event.stopPropagation();
  }

  if (event.preventDefault != null) {
    event.preventDefault();
  }

  if (event._rawEvent.dataTransfer) {
    return broadcast({
      url: event._rawEvent.dataTransfer.getData('URL'),
      text: event._rawEvent.dataTransfer.getData('Text'),
      files: Array.prototype.slice.call(event._rawEvent.dataTransfer.files),
      ...this.data
    });
  }

  broadcast(this.data);
});
