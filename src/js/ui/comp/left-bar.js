'use strict';

const {str} = require('iblokz-data');

const {
	section, span, i, ul, li, a,
	form, input, label, button,
	p, h1, div
} = require('iblokz-snabbdom-helpers');

const breadcrumb = require('./breadcrumb');

const menu = {
	home: {
		href: '/',
		icon: 'fa-home'
	},
	properties: {
		href: '/properties',
		icon: 'fa-building-o'
	},
	areas: {
		href: '/areas',
		icon: 'fa-map-o'
	}
};

const keys = o => Object.keys(o);

module.exports = ({state, actions}, content = []) => section('.left-bar', [].concat(
	ul('.menu', keys(menu).map(page =>
		li({
			class: {
				active: state.router.page === page
			}
		}, a(`[href="#${menu[page].href}"]`, [
			i(`.fa.${menu[page].icon}`),
			' ',
			str.capitalize(page)
		]))
	)),
	state.router.page !== 'home' && breadcrumb({state, actions}) || [],
	state[state.router.page] && state[state.router.page].view
		? div('.actions', state[state.router.page].view === 'list'
			?	button('.fa.fa-plus.info', {on: {
				click: ev => actions.router.go(`${state.router.page}/new`)
			}})
			: [
				button('.fa.fa-close', {on: {
					click: ev => actions.router.go(`${state.router.page}`)
				}})
			]
		)
		: [],
	content
));
