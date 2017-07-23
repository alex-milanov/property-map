'use strict';

const {obj} = require('iblokz-data');

const toData = form => Array.from(form.elements)
	// .map(el => (console.log(el.name), el))
	.filter(el => el.name !== undefined)
	.reduce((o, el) => obj.patch(o, el.name.split('.'),
		el.type && el.type === 'number'
			? Number(el.value)
			: el.value
	), {});

const clear = form => Array.from(form.elements)
	.forEach(el => (el.value = null));

module.exports = {
	toData,
	clear
};
