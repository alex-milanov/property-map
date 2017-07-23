'use strict';

const set = (key, value) => window.localStorage.setItem(key, JSON.stringify(value));
const get = (key, defaultValue) => window.localStorage.getItem(key) &&
	JSON.parse(window.localStorage.getItem(key)) || defaultValue;

module.exports = {
	set,
	get
};
