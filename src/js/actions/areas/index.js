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
		type: 'polygon',
		path: [
			{
				lat: 51.54007633008527,
				lng: -0.1058074437499954
			},
			{
				lat: 51.52526879606738,
				lng: -0.12806620229491728
			},
			{
				lat: 51.51645674052525,
				lng: -0.10563578237304228
			},
			{
				lat: 51.51920735302754,
				lng: -0.09055819143065946
			},
			{
				lat: 51.51853974390021,
				lng: -0.06672587026366728
			},
			{
				lat: 51.53443508508343,
				lng: -0.08609499562987821
			}
		],
		center: {
			lat: 51.528266535305264,
			lng: -0.09739603627929228
		},
		radius: 2000
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
