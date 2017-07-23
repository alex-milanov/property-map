'use strict';

const {
	section, span, i,
	form, input, label, button,
	ul, li, p, h1, div
} = require('iblokz-snabbdom-helpers');

const formUtil = require('../../../util/form');

module.exports = ({state, actions}) => form('.edit', {
	on: {
		submit: ev => {
			ev.preventDefault();
			let data = formUtil.toData(ev.target);
			if (data.name.length > 3 && data.name.length < 15) {
				actions.areas.update(state.areas.doc._id, data);
				actions.router.go('areas');
			} else {
				actions.set('areas', {
					errors: ['name']
				});
			}
			console.log(data);
		}
	}
}, [
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
	button('.success[type="submit"]', 'Save')
]);
