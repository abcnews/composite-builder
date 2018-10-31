const { h, send } = require('mercury');

const IS_OSX = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

module.exports = faqPartial;

function faqPartial(channel) {
  return h('div.Composite-faq', [
    h('h1', 'Frequently Asked Questions'),
    h('dl', [
      h('dt', 'How do I reposition an image?'),
      h('dd', 'Position your cursor over the image, and drag it in any direction.'),
      h('dt', 'How do I scale an image?'),
      h('dd', [
        'While holding down the ',
        h('code', IS_OSX ? 'Command ⌘' : 'Ctrl'),
        " key, position your cursor over the image and drag down/up to increase/decrease the image's scale."
      ]),
      h('dt', 'How do I move the partition?'),
      h(
        'dd',
        'When you hover your cursor over the partition, a handle will appear. Drag this handle to adjust the partition.'
      )
    ]),
    h(
      'div.Composite-faqHide',
      {
        title: 'Hide FAQ',
        'ev-click': send(channel, { isFAQVisible: false })
      },
      '×'
    )
  ]);
}
