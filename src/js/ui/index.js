'use strict';

// lib
const {obj, str} = require('iblokz-data');

// dom
const {
	h1, a, div, ul, li,
	section, button, span
} = require('iblokz-snabbdom-helpers');
// components
const leftBar = require('./comp/left-bar');
const map = require('./map');
const pages = require('./pages');

module.exports = ({state, actions}) => section('#ui', [
	leftBar({state, actions}, [
		// page
		obj.switch(state.router.path, pages)({state, actions})
	]),
	map({state, actions})
]);
