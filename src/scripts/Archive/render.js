var h = require('mercury').h;

var ArchivedComposite = require('./ArchivedComposite');
var util = require('./util');

module.exports = render;

function render(state) {
	var composites = util.objectValues(state.composites).sort(util.dateIteratee);

	return h('div.Archive', composites.length ?
		composites.map(function (composite) {
			return ArchivedComposite.render(composite, state.images, state.channels);
		}) :
		null
	);
}