const { h, send, sendChange } = require('mercury');

require('./index.scss');

module.exports = render;

function render(state) {
  const propsChange = state.channels.propsChange;

  return h('div.Controls', [
    // Hidden: Image URLs

    h('input.Controls-imageURL.Controls-imageAURL', {
      type: 'file',
      'ev-event': sendChange(state.channels.imageAPick)
    }),

    h('input.Controls-imageURL.Controls-imageBURL', {
      type: 'file',
      'ev-event': sendChange(state.channels.imageBPick)
    }),

    // Row 1: Image A (Credit + Scale)

    h('label', { htmlFor: 'imageASource' }, 'Left Image Credit'),
    h('input.Controls-imageSource', {
      name: 'imageASource',
      type: 'text',
      disabled: !state.imageAURL.length,
      value: state.imageASource,
      'ev-event': sendChange(propsChange)
    }),
    h('label', { htmlFor: 'imageAScale' }, 'Left Image Scale'),
    h('input.Controls-imageScale', {
      name: 'imageAScale',
      type: 'range',
      min: state.imageAMinScale.toFixed(2),
      max: state.imageAMinScale.toFixed(2) * 2,
      step: (state.imageAMinScale / 10).toFixed(3),
      value: state.imageAScale,
      disabled: !state.imageAURL.length,
      'ev-event': sendChange(state.channels.imageScaleRangeChange)
    }),

    // Row 2: Image B (Credit + Scale)

    h('label', { htmlFor: 'imageBSource' }, 'Right Image Credit'),
    h('input.Controls-imageSource', {
      name: 'imageBSource',
      type: 'text',
      disabled: !state.imageBURL.length,
      value: state.imageBSource,
      'ev-event': sendChange(propsChange)
    }),
    h('label', { htmlFor: 'imageBScale' }, 'Right Image Scale'),
    h('input.Controls-imageScale', {
      name: 'imageBScale',
      type: 'range',
      min: state.imageBMinScale.toFixed(2),
      max: state.imageBMinScale.toFixed(2) * 2,
      step: (state.imageBMinScale / 10).toFixed(3),
      value: state.imageBScale,
      disabled: !state.imageBURL.length,
      'ev-event': sendChange(state.channels.imageScaleRangeChange)
    }),

    // Row 3: Partition Ratio / Square Toggle

    h('label', { htmlFor: 'partitionPct' }, 'Partition Ratio'),
    h(
      'button.Controls-partitionPct.Controls-partitionPct--1x2',
      {
        disabled: state.partitionPct === 33.33,
        'ev-click': send(propsChange, { partitionPct: 33.33 })
      },
      '1:2'
    ),
    h(
      'button.Controls-partitionPct.Controls-partitionPct--1x1',
      {
        disabled: state.partitionPct === 50,
        'ev-click': send(propsChange, { partitionPct: 50 })
      },
      '1:1'
    ),
    h(
      'button.Controls-partitionPct.Controls-partitionPct--2x1',
      {
        disabled: state.partitionPct === 66.67,
        'ev-click': send(propsChange, { partitionPct: 66.67 })
      },
      '2:1'
    ),

    h('label', { htmlFor: 'isSquared' }, 'Squared'),
    h(
      'button.Controls-isSquared.Controls-isSquared--yes',
      {
        disabled: state.isSquared,
        'ev-click': send(propsChange, { isSquared: true })
      },
      'Yes'
    ),
    h(
      'button.Controls-isSquared.Controls-isSquared--no',
      {
        disabled: !state.isSquared,
        'ev-click': send(propsChange, { isSquared: false })
      },
      'No'
    ),

    // Row 4: Info / FAQ Toggle / Feedback Email Link

    h('span.Controls-info', [
      h('strong', 'Remember: '),
      'Please respect copyright laws when posting to social media.'
    ]),
    h(
      'a.Controls-faq',
      {
        href: 'javascript:void(0);',
        'ev-click': send(propsChange, { isFAQVisible: !state.isFAQVisible })
      },
      (state.isFAQVisible ? 'Hide' : 'Show') + ' FAQ'
    ),
    h(
      'a.Controls-feedback',
      { href: 'https://github.com/abcnews/composite-builder/issues' },
      'Feedback?'
    )
  ]);
}
