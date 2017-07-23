'use strict';

const {
	section, span, i,
	form, input, label, button,
	ul, li, p, h1, div, pre,
	table, tr, td, th, thead, tbody
} = require('iblokz-snabbdom-helpers');

const edit = require('./edit');

// lib
const {obj, str} = require('iblokz-data');
const pointInPolygon = require('point-in-polygon');
const formUtil = require('../../../util/form');

const fields = ['owner', 'address', 'location', 'areas', 'incomeGenerated', 'actions'];

const fieldToTitle = field => str.fromCamelCase(field, '-')
	.split('-').map(word => str.capitalize(word)).join(' ');

const keys = o => Object.keys(o);

const pointInCircle = (p, c, r) => Math.sqrt(
	(p[0] - c[0]) * (p[0] - c[0]) +
	(p[1] - c[1]) * (p[1] - c[1])
) < r;

module.exports = ({state, actions}) =>
	state.router.pageId && edit({state, actions})
	|| table('.properties', [
		thead(tr(fields.map(field =>
			th(fieldToTitle(field))
		))),
		tbody(state.properties.list.map(doc =>
			tr(fields.map(field =>
				td(obj.switch(field, {
					default: () => doc[field],
					address: () => pre(
						keys(doc[field])
							.map(key => doc[field][key])
							.filter(v => v !== '')
							.join('\n')
					),
					location: () => pre(
						JSON.stringify(doc.location, null, 2)
					),
					areas: () => state.areas.list.filter(area =>
						area.type === 'polygon'
						? pointInPolygon(
							[doc.location.lat, doc.location.lng],
							area.path.map(pos => [pos.lat, pos.lng])
						)
						: pointInCircle(
							[doc.location.lat, doc.location.lng],
							[area.center.lat, area.center.lng],
							area.radius / 100000
						)
					).map(area => area.name).join(', '),
					actions: () => [
						button('.fa.fa-pencil.primary', {on: {
							click: ev => actions.router.go(`properties/${doc._id}`)
						}}),
						button('.fa.fa-trash-o.danger', {on: {
							click: ev => actions.properties.delete(doc._id)
						}})
					]
				})())
			))
		))
	]);
