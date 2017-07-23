'use strict';

const {
	section, span, i,
	form, input, label, button,
	select, option,
	ul, li, p, h1, div
} = require('iblokz-snabbdom-helpers');

// lib
const {obj, str} = require('iblokz-data');
const formUtil = require('../../../util/form');

const sub = (o, p, d = false) =>
	o === undefined
		? d
		: (p instanceof Array)
			? o[p[0]] && p.length > 1
				? [sub(o[p[0]], p.slice(1))].map(sO => (sO !== undefined ? sO : d)).pop()
				: o[p[0]]
			: o[p] !== undefined ? o[p] : d;

const schema = {
	name: {type: 'String', min: 3, max: 30},
	type: {type: 'String', enum: ['polygon', 'circle'], default: 'polygon'},
	path: [{
		lat: 'Number',
		lng: 'Number'
	}],
	center: {
		lat: 'Number',
		lng: 'Number'
	},
	radius: 'Number'
};

const keys = o => Object.keys(o);

const parseField = (field, name) => (typeof field === 'string')
	? {type: field, name, required: true}
	: field.type
		? Object.assign({}, field, {name})
		: field instanceof Object
			? {type: 'Object', name, fields: keys(field).map(key => parseField(field[key], [name, key].join('.')))}
			: false;

const fieldToTitle = field => str.fromCamelCase(field, '-')
	.split('-').map(word => str.capitalize(word)).join(' ');

const formElement = (field, doc) => obj.switch(field.type, {
	default: () => div('.field', [
		field.name.split('.').length === 1 ? label([
			fieldToTitle(field.name.split('.').pop()),
			': '
		]) : '',
		input({
			attrs: {
				name: field.name,
				type: field.type === 'Number' ? 'number' : 'text',
				step: 0.01,
				placeholder: fieldToTitle(field.name.split('.').pop()),
				value: sub(doc, field.name.split('.'), '')
			}
		})
	]),
	Object: () => div('.field', [].concat(
		label([
			fieldToTitle(field.name.split('.').pop()),
			': '
		]),
		field.fields.map(f => formElement(f, doc))
	))
})();

module.exports = ({state, actions}) => form({
	class: {
		create: state.areas.view === 'create',
		edit: state.areas.view === 'edit'
	},
	on: {
		submit: ev => {
			ev.preventDefault();
			let data = formUtil.toData(ev.target);
			if (data.name.length > 3 && data.name.length < 15) {
				if (state.areas.view === 'create') {
					actions.areas.add(data);
				} else {
					actions.areas.update(state.areas.doc._id, data);
				}

				actions.router.go('areas');
			} else {
				actions.set('areas', {
					errors: ['name']
				});
			}
			console.log(data);
		}
	}
}, [].concat(
	input('[type="text"][name="name"][placeholder="Name"]', {
		class: {
			err: state.areas.errors.indexOf('name') > -1
		},
		on: {
			input: ev => (ev.target.length > 3 && ev.target.length < 15)
				? actions.set('areas', {
					errors: []
				})
				: actions.set('areas', {
					errors: ['name']
				})
		},
		props: {
			value: state.areas.doc && state.areas.doc.name || ''
		}
	}),
	select('[name="type"]', {
		on: {
			change: ev => actions.set(['areas', 'doc'], {type: ev.target.value})
		}
	}, ['polygon', 'circle'].map(type =>
		option(`[value="${type}"]`, {
			attrs: {
				selected: state.areas.doc && type === state.areas.doc.type
			}
		}, str.capitalize(type))
	)),
	formElement(parseField(schema.center, 'center'), state.areas.doc),
	state.areas.doc && state.areas.doc.type === 'circle'
		? [
			label('Radius'),
			input('[name="radius"][type="number"]', {
				on: {
					input: ev => actions.set(['areas', 'doc'], {
						radius: Number(ev.target.value)
					})
				},
				attrs: {
					value: state.areas.doc.radius || 2000,
					step: 0.01
				}
			})
		]
		: [],
	button('.success[type="submit"]',
		state.areas.view === 'create' ? 'Add' : 'Save'
	)
));
