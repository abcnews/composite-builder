var h = require('mercury').h;
var hg = require('mercury');

var branding = require('../branding');

var BRANDING_OPTIONS = [].concat.apply(['Custom'], Object.keys(branding));
var TICK = '✔';

module.exports = render;

function render(state, parentChannels) {
    var propsChange = state.channels.propsChange;

    return h('div.Controls', [

        // Hidden: Image URL / Custom Branding URL

        h('input.Controls-imageURL', {
            type: 'file',
            'ev-event': hg.sendChange(state.channels.imagePick)
        }),
        h('input.Controls-customBrandingURL', {
            type: 'file',
            'ev-event': hg.sendChange(state.channels.brandingPick)
        }),

        // Row 1: Text

        h('label', {
            htmlFor: 'text',
            'ev-click': hg.send(parentChannels.textLabelClick)
        }, 'Text'),
        h('input.Controls-text', {
            name: 'text',
            type: 'text',
            value: state.text,
            'ev-event': hg.sendChange(propsChange)
        }),

        // Row 2: Source / Alignment 

        h('label', {htmlFor: 'textSource'}, 'Source'),
        h('input.Controls-textSource', {
            name: 'textSource',
            type: 'text',
            disabled: !state.text.length,
            value: state.textSource,
            'ev-event': hg.sendChange(propsChange)
        }),
        h('label', 'Align'),
        h('button.Controls-align.Controls-align--left', {
            disabled: state.textAlign === 'left',
            'ev-click': hg.send(propsChange, {textAlign: 'left'})
        }, 'Left'),
        h('button.Controls-align.Controls-align--right', {
            disabled: state.textAlign === 'right',
            'ev-click': hg.send(propsChange, {textAlign: 'right'})
        }, 'Right'),
        h('button.Controls-align.Controls-align--centre', {
            disabled: state.textAlign === 'centre',
            'ev-click': hg.send(propsChange, {textAlign: 'centre'})
        }, 'Centre'),
        h('button.Controls-align.Controls-align--top', {
            disabled: state.textAlign === 'top',
            'ev-click': hg.send(propsChange, {textAlign: 'top'})
        }, 'Top'),
        h('button.Controls-align.Controls-align--bottom', {
            disabled: state.textAlign === 'bottom',
            'ev-click': hg.send(propsChange, {textAlign: 'bottom'})
        }, 'Bottom'),

        // Row 3: Image Credit / Branding / Square Toggle

        h('label', {htmlFor: 'imageSource'}, 'Credit'),
        h('input.Controls-imageSource', {
            name: 'imageSource',
            type: 'text',
            disabled: !state.imageURL.length,
            value: state.imageSource,
            'ev-event': hg.sendChange(propsChange)
        }),
        h('label', {htmlFor: 'presetBranding'}, 'Brand'),
        h('select.Controls-presetBranding', {
            name: 'presetBranding',
            value: state.presetBranding,
            'ev-event': hg.sendChange(propsChange)
        }, BRANDING_OPTIONS.map(function (name) {
            return h('option', {
                value: branding[name] ? name : ''
            }, name);
        })),
        h('label', {htmlFor: 'isSquared'}, 'Squared'),
        h('button.Controls-isSquared.Controls-isSquared--yes', {
            disabled: state.isSquared,
            'ev-click': hg.send(propsChange, {isSquared: true})
        }, 'Yes'),
        h('button.Controls-isSquared.Controls-isSquared--no', {
            disabled: !state.isSquared,
            'ev-click': hg.send(propsChange, {isSquared: false})
        }, 'No'),

        // Row 4: Overlay Theme / (Overlay Tint) / Image Scale

        h('label', {htmlFor: 'theme'}, 'Overlay'),
        h('button.Controls-theme.Controls-theme--tinted', {
            disabled: state.theme === 'tinted',
            'ev-click': hg.send(propsChange, {theme: 'tinted'})
        }, 'Tinted'),
        h('button.Controls-theme.Controls-theme--dark', {
            disabled: state.theme === 'dark',
            'ev-click': hg.send(propsChange, {theme: 'dark'})
        }, 'Dark'),
        h('button.Controls-theme.Controls-theme--light', {
            disabled: state.theme === 'light',
            'ev-click': hg.send(propsChange, {theme: 'light'})
        }, 'Light'),
        (state.theme === 'tinted' && state.tintPalette.length ? h('label', {htmlFor: 'tintIndex'}, 'Tint') : null),
        (state.theme === 'tinted' && state.tintPalette.length ? h('button.Controls-tintIndex', {
            disabled: state.tintIndex === 0,
            style: { 'background-color': state.tintPalette[0] },
            'ev-click': hg.send(propsChange, {tintIndex: 0})
        }, state.tintIndex === 0 ? TICK : '') : null),
        (state.theme === 'tinted' && state.tintPalette.length ? h('button.Controls-tintIndex', {
            disabled: state.tintIndex === 1,
            style: { 'background-color': state.tintPalette[1] },
            'ev-click': hg.send(propsChange, {tintIndex: 1})
        }, state.tintIndex === 1 ? TICK : '') : null),
        (state.theme === 'tinted' && state.tintPalette.length ? h('button.Controls-tintIndex', {
            disabled: state.tintIndex === 2,
            style: { 'background-color': state.tintPalette[2] },
            'ev-click': hg.send(propsChange, {tintIndex: 2})
        }, state.tintIndex === 2 ? TICK : '') : null),
        h('label', {htmlFor: 'imageScale'}, 'Image Scale'),
        h('input.Controls-imageScale', {
            name: 'imageScale',
            type: 'range',
            min: state.imageMinScale.toFixed(2),
            max: state.imageMinScale.toFixed(2) * 2,
            step: (state.imageMinScale / 10).toFixed(3),
            value: state.imageScale,
            disabled: !state.imageURL.length,
            'ev-event': hg.sendChange(state.channels.imageScaleRangeChange)
        }),

        // Row 5: Info / FAQ Toggle / Feedback Email Link

        h('span.Controls-info', [
            h('strong', 'Remember: '),
            'Only use images on social media if the ABC has the rights to them.'
        ]),
        h('a.Controls-faq', {
            href: 'javascript:void(0);',
            'ev-click': hg.send(propsChange, {isFAQVisible: !state.isFAQVisible})
        }, (state.isFAQVisible ? 'Hide' : 'Show') + ' FAQ'),
        h('a.Controls-feedback', {href: 'mailto:gourlay.colin@abc.net.au?subject=Composite Builder Feedback'}, 'Feedback?')

    ]);
}