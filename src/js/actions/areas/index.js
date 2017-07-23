'use strict';

const {obj} = require('iblokz-data');
const objectId = require('bson-objectid');

// util
const store = require('../../util/store');

const indexAt = (arr, key, value) => arr.indexOf(arr.find(el => el[key] === value));

const initial = {
	list: [{
		_id: objectId().str,
		name: 'area 1',
		path: [
			{
				lat: 51.53895525516423,
				lng: -0.10177340139159696
			},
			{
				lat: 51.524147356421565,
				lng: -0.12403215993651884
			},
			{
				lat: 51.515335083865025,
				lng: -0.10160174001464384
			},
			{
				lat: 51.517418138535696,
				lng: -0.06269182790526884
			},
			{
				lat: 51.533313871203866,
				lng: -0.08206095327147978
			}
		]
	}],
	errors: [],
	doc: false,
	view: 'list'
};

const _delete = id => state => obj.patch(state, ['areas'], {
	list: [indexAt(state.areas.list, '_id', id)].map(index =>
		[].concat(
			state.areas.list.slice(0, index),
			state.areas.list.slice(index + 1)
		)
	).pop()
});

const create = () => state => obj.patch(state, 'areas', {
	doc: {
		name: '',
		path: [],
		errors: []
	},
	view: 'create'
});

const edit = id => state => obj.patch(state, 'areas', {
	doc: state.areas.list.find(el => el._id === id),
	view: 'edit',
	errors: []
});

const cancel = () => state => obj.patch(state, 'areas', {
	doc: false,
	view: 'list',
	errors: []
});

const add = data => state => obj.patch(state, ['areas'], {
	doc: false,
	errors: [],
	view: 'list',
	list: [].concat(
		state.areas.list,
		Object.assign({}, state.areas.doc, data, {
			_id: objectId().str
		})
	)
});

const update = (id, data) => state => obj.patch(state, ['areas'], {
	doc: false,
	errors: [],
	view: 'list',
	list: [indexAt(state.areas.list, '_id', id)].map(index =>
		[].concat(
			state.areas.list.slice(0, index),
			Object.assign(
				{},
				state.areas.list[index],
				state.areas.doc,
				data
			),
			state.areas.list.slice(index + 1)
		)
	).pop()
});

module.exports = {
	initial,
	delete: _delete,
	add,
	create,
	edit,
	cancel,
	update
};
