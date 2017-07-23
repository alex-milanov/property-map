'use strict';

// lib
const {fn} = require('iblokz-data');
const formUtil = require('../../../util/form');

const {
	section, span, i,
	form, input, label, button,
	ul, li, p, h1, div
} = require('iblokz-snabbdom-helpers');

const edit = require('./edit');
const create = require('./create');

module.exports = ({state, actions}) =>
	state.router.pageId && edit({state, actions})
	|| ul('.areas', state.areas.list
		/*
		.filter(area => area.path.filter(pos =>
				pos.lat < state.map.bounds.north
				&& pos.lat > state.map.bounds.south
				&& pos.lng < state.map.bounds.east
				&& pos.lng > state.map.bounds.west
		).length > 0)
		*/
		.map(area =>
			li({
				on: {
					dblclick: ev => actions.router.go(`areas/${area._id}`)
				}
			}, [
				span(area.name),
				span('.right', [
					button('.fa.fa-pencil.primary', {on: {
						click: ev => actions.router.go(`areas/${area._id}`)
					}}),
					button('.fa.fa-trash-o.danger', {on: {
						click: ev => actions.areas.delete(area._id)
					}})
				])
			])
		));
