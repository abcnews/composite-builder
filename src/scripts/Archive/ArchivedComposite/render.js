var h = require('mercury').h;
var hg = require('mercury');

var util = require('../util');

module.exports = render;

function render(state, images, parentChannels) {
	var imageURL = images[state.imageKey];
	var isLoading = state.imageKey && !imageURL;

	return h('div.ArchivedComposite' + (state.isSquared ? '.is-squared' : ''), [
		h('div.ArchivedComposite-image' + (isLoading ? '.is-loading' : ''), [
			imageURL ? h('img', { src: imageURL }) : null
		]),
		h('div.ArchivedComposite-meta', [
			imageURL ? h('a.ArchivedComposite-download', {
				href: imageURL,
				download: util.compositeFilename(state)
			}, 'Download') : null,
			h('div.ArchivedComposite-user', {
				title: state._id,
				style: { 'background-color': '#' + state.user },
				'ev-click': hg.send(parentChannels.removeCompositeById, state._id)
			}),
			util.formattedDate(new Date(state.date))
		])
	]);
}