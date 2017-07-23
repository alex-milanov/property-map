'use strict';

const {
	section, span, i,
	form, input, label, button,
	ul, li, p, h1, div, a, br
} = require('iblokz-snabbdom-helpers');

const areas = require('./areas');
const properties = require('./properties');

const home = ({state, actions}) => section('.home', [
	h1('Properties Map'),
	p([
		'The ', a('[href="#/properties"]', 'Properties'), ' provided are form the excerciseData.json',
		br(),
		' processed through geolocation api with slight edit in order to work with it'
	]),
	p([
		'One polygon ', a('[href="#/areas"]', 'Area'), ' is provided as well for the inclusion detection'
	])
]);

module.exports = {
	default: home,
	properties,
	areas
};
