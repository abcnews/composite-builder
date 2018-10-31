const { BaseEvent } = require('mercury');

module.exports = BaseEvent(function(event, broadcast) {
  if (event.stopPropagation != null) {
    event.stopPropagation();
  }
  if (event.preventDefault != null) {
    event.preventDefault();
  }
  if (event._rawEvent.dataTransfer) {
    event._rawEvent.dataTransfer.dropEffect = 'none';
  }

  broadcast(this.data);
});
