'use strict';

const {
	section, span, i,
	form, input, label, button,
	ul, li, p, h1, div, a
} = require('iblokz-snabbdom-helpers');

const {str} = require('iblokz-data');

module.exports = ({state, actions}) => ul('.breadcrumb', [].concat(
	li(
		a('[href="#/"]', 'Home')
	),
	li([
		// i('.fa.fa-map-o'),
		a(`[href="#/${state.router.page}"]`, str.capitalize(state.router.page))
	]),
	state[state.router.page] && state[state.router.page].view
		? li(str.capitalize(state[state.router.page].view))
		: []
));
