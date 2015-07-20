var h = require('mercury').h;
var hg = require('mercury');

module.exports = exportPartial;

function exportPartial(channel) {
    return h('div.Export', [
        h('a.Export-link', {
            'ev-click': hg.send(channel, {format: 'jpeg', quality: 1})
        }, 'Download JPG (High Quality)'),
        h('a.Export-link', {
            'ev-click': hg.send(channel, {format: 'jpeg', quality: 0.8})
        }, 'Download JPG (Medium Quality)'),
        h('a.Export-link', {
            'ev-click': hg.send(channel, {format: 'png'})
        }, 'Download PNG')
    ]);
}