'use strict';

const Rx = require('rx');
const $ = Rx.Observable;

const parsePageParams = str => {
	const path = str.split('/');
	const admin = path[0] === 'admin';
	const pageId = path[admin ? 2 : 1] || null;
	const page = (admin ? 'admin.' : '') + ((pageId) ? path[path.length - 2] : path[path.length - 1]) || 'home';
	return {
		path,
		admin,
		page,
		pageId
	};
};

let change;
let go;

change = page => state => (page.match('admin') && (!state.auth.user || state.auth.user.role !== 'admin'))
	? (go('home'), state)
	: Object.assign({}, state, {router: parsePageParams(page)});

go = page => {
	window.location.hash = '/' + ((page !== 'home') ? page.split('.').join('/') : '');
	return change(page.split('.').join('/'));
};

const actions = {
	initial: {page: 'home', path: ['home'], admin: false, pageId: null},
	change,
	go
};

const hook = ({state$, actions}) => {
	state$.take(1).subscribe(() => {
		window.setTimeout(() => actions.router.change(location.hash.replace('#/', '') || 'home'));
		window.addEventListener('hashchange',
			() => actions.router.change(location.hash.replace('#/', '') || 'home'));
	});
};

module.exports = {
	actions,
	hook
};
