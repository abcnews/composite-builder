const { h, send } = require('mercury');

require('./export.scss');

module.exports = exportPartial;

function exportPartial(channel) {
  return h('div.Export', [
    h(
      'a.Export-link',
      {
        'ev-click': send(channel, { format: 'jpeg', quality: 1 })
      },
      'Download JPG (High Quality)'
    ),
    h(
      'a.Export-link',
      {
        'ev-click': send(channel, { format: 'jpeg', quality: 0.8 })
      },
      'Download JPG (Medium Quality)'
    ),
    h(
      'a.Export-link',
      {
        'ev-click': send(channel, { format: 'png' })
      },
      'Download PNG'
    )
  ]);
}
