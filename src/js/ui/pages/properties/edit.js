'use strict';

const {
	section, span, i,
	form, input, label, button,
	ul, li, p, h1, div
} = require('iblokz-snabbdom-helpers');

// lib
const {obj, str} = require('iblokz-data');
const formUtil = require('../../../util/form');

const sub = (o, p, d = false) => (p instanceof Array)
	? o[p[0]] && p.length > 1
		? [sub(o[p[0]], p.slice(1))].map(sO => (sO !== undefined ? sO : d)).pop()
		: o[p[0]]
	: o[p] !== undefined ? o[p] : d;

const schema = {
	owner: 'String',
	address: {
		line1: 'String',
		line2: {type: 'String', required: false},
		line3: {type: 'String', required: false},
		line4: 'String',
		postCode: 'String',
		city: 'String',
		country: 'String'
	},
	incomeGenerated: 'Number'
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
		create: state.properties.view === 'create',
		edit: state.properties.view === 'edit'
	},
	on: {
		submit: ev => {
			ev.preventDefault();
			let data = formUtil.toData(ev.target);

			if (state.properties.view === 'create') {
				actions.properties.add(data);
			} else {
				actions.properties.update(state.properties.doc._id, data);
			}
			actions.router.go('properties');
			console.log(data);
		}
	}
}, [].concat(
	keys(schema)
		.map(key => parseField(schema[key], key))
		.map(field => (console.log(field), field))
		.reduce((els, field) => [].concat(els, field), [])
		.map(field => formElement(field, state.properties.doc)),
	button('.success[type="submit"]',
		state.properties.view === 'create' ? 'Add' : 'Save'
	)
));

// [
// 	input('[type="text"][name="name"][placeholder="Name"]', {
// 		class: {
// 			err: state.properties.errors.indexOf('name') > -1
// 		},
// 		on: {
// 			input: ev => (ev.target.value.length > 3 && ev.target.value.length < 15)
// 				? actions.set('properties', {
// 					errors: []
// 				})
// 				: actions.set('properties', {
// 					errors: ['name']
// 				})
// 		}
// 	}),
// 	button('.success[type="submit"]', 'Add')
// ];
