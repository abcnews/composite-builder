var h = require('mercury').h;
var hg = require('mercury');

var IS_OSX = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

module.exports = faqPartial;

function faqPartial(channel) {
    return h('div.Composite-faq', [
        h('h1', 'Frequently Asked Questions'),
        h('dl', [
            h('dt', 'How do I reposition my image?'),
            h('dd', 'Position your cursor over the image, and drag it in any direction.'),
            h('dt', 'How do I scale my image?'),
            h('dd', ['While holding down the ', h('code', IS_OSX ? 'Command ⌘' : 'Ctrl'), ' key, position your cursor over the image and drag down/up to increase/decrease the image\'s scale.']),
            h('dt', 'How do I resize the text area?'),
            h('dd', 'When you hover yor cursor over the text, a handle will appear on the inside edge. Drag this handle to adjust the width/height (depending on text alignment).')
        ]),
        h('div.Composite-faqHide', {
            title: 'Hide FAQ',
            'ev-click': hg.send(channel, {isFAQVisible: false})
        }, '×')
    ]);
}