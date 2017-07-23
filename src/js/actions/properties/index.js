'use strict';

const Rx = require('rx');
const $ = Rx.Observable;

const {obj} = require('iblokz-data');
const objectId = require('bson-objectid');

// util
const store = require('../../util/store');
const request = require('../../util/request');

const indexAt = (arr, key, value) => arr.indexOf(arr.find(el => el[key] === value));

const addrToGeo = addr => request.get(
	`https://maps.googleapis.com/maps/api/geocode/json?address=` +
	[addr.line1, addr.line2 || '', addr.line3 || '', addr.line4, ', '].join(' ').replace(/[ ]+/ig, '+') +
	[addr.postCode, addr.city, addr.country].join(', ').replace(/[ ]+/ig, '+') +
	`&key=AIzaSyC-OZFEtomclsSMs_772T_3BEpOlrKB3LY`
).observe().map(res => res.body);

const initial = {
	list: [],
	errors: [],
	doc: false,
	view: 'list'
};

const _delete = id => state => obj.patch(state, ['properties'], {
	list: [indexAt(state.properties.list, '_id', id)].map(index =>
		[].concat(
			state.properties.list.slice(0, index),
			state.properties.list.slice(index + 1)
		)
	).pop()
});

const create = () => state => obj.patch(state, 'properties', {
	doc: {
		name: '',
		path: [],
		errors: []
	},
	view: 'create'
});

const edit = id => state => obj.patch(state, 'properties', {
	doc: state.properties.list.find(el => el._id === id),
	view: 'edit',
	errors: []
});

const cancel = () => state => obj.patch(state, 'properties', {
	doc: false,
	view: 'list',
	errors: []
});

const add = data =>
	addrToGeo(data.address)
		.map(body => body.results[0].geometry.location)
		.map(location =>
			state => obj.patch(state, ['properties'], {
				doc: false,
				errors: [],
				view: 'list',
				list: [].concat(
					state.properties.list,
					Object.assign({}, state.properties.doc, data, {
						_id: objectId().str,
						location
					})
				)
			})
		);

const update = (id, data) =>
	addrToGeo(data.address)
		.map(body => body.results[0].geometry.location)
		.map(location =>
			state => obj.patch(state, ['properties'], {
				doc: false,
				errors: [],
				view: 'list',
				list: [indexAt(state.properties.list, '_id', id)].map(index =>
					[].concat(
						state.properties.list.slice(0, index),
						Object.assign(
							{},
							state.properties.list[index],
							state.properties.doc,
							data,
							{location: location}
						),
						state.properties.list.slice(index + 1)
					)
				).pop()
			})
		);

const sync = list => $.from(list)
	.flatMap(doc =>
		addrToGeo(doc.address)
			.map(body => body.results[0].geometry.location)
			.map(location => Object.assign({}, doc, {
				_id: objectId().str,
				location
			})))
	.reduce((list, doc) => [].concat(list, doc), [])
	.map(list => state => obj.patch(state, 'properties', {list}));

module.exports = {
	initial,
	delete: _delete,
	add,
	create,
	edit,
	cancel,
	update,
	sync
};
