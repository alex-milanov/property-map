'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// iblokz
const vdom = require('iblokz-snabbdom-helpers');
const {obj, arr} = require('iblokz-data');

// util
const request = require('./util/request');

// app
const app = require('./util/app');
let actions = require('./actions');
let ui = require('./ui');
// services
const map = require('./services/map');
const router = require('./services/router');
actions.router = router.actions;

let actions$;
actions = app.adapt(actions);

// hot reloading
if (module.hot) {
	// actions
	actions$ = $.fromEventPattern(
    h => module.hot.accept("./actions", h)
	).flatMap(() => {
		actions = app.adapt(Object.assign(
			{},
			require('./actions'),
			{
				router: router.actions
			}
		));
		return actions.stream.startWith(state => state);
	}).merge(actions.stream);
	// ui
	module.hot.accept("./ui", function() {
		ui = require('./ui');
		actions.stream.onNext(state => state);
	});
} else {
	actions$ = actions.stream;
}

// actions -> state
const state$ = actions$
	.startWith(() => actions.initial)
	.scan((state, change) => change(state), {})
	.map(state => (console.log(state), state))
	.publish();

// hooks
router.hook({state$, actions});
map.hook({state$, actions});

const resources = ['areas', 'properties'];
state$
	.distinctUntilChanged(state => state.router.pageId)
	.subscribe(state => resources.forEach(res =>
		state.router.page === res
			? state.router.pageId === 'new'
				? actions[res].create()
				: state.router.pageId
					? actions[res].edit(state.router.pageId)
					: actions[res].cancel()
			: actions[res].cancel()
	));

// initial data
require('../assets/data/properties.json')
	.forEach(doc => actions.properties.add(doc));

// state -> ui
const ui$ = state$.map(state => ui({state, actions}));
vdom.patchStream(ui$, '#ui');

state$.connect();
