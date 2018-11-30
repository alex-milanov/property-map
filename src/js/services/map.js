'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// iblokz
const {obj, arr} = require('iblokz-data');

let map;
let pos = {
	lat: 51.51355432027329, lng: -0.09394892635838037
};

let geometry = null;
let geometries = [];

let markers = [];

/*
if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(position) {
		pos = {
			lat: position.coords.latitude,
			lng: position.coords.longitude
		};

		// infoWindow.setPosition(pos);
		// infoWindow.setContent('Location found.');
		// infoWindow.open(map);

		// map.setCenter(pos);
	});
}
*/

const centerOfPath = path =>
	path.reduce(
		(bounds, pos) => (bounds.extend(pos), bounds),
		new window.google.maps.LatLngBounds()
	).getCenter().toJSON();

const hook = ({state$, actions}) => {
	$.interval(100).map(() => document.querySelector('#map'))
		.filter(mapEl => mapEl && window.google && window.google.maps && pos)
		.take(1)
		.subscribe(mapEl => {
			map = new window.google.maps.Map(mapEl, {
				center: pos,
				zoom: 13
			});
			window.google.maps.event.addListener(map, 'bounds_changed', () => {
				console.log(map.getBounds().toJSON());
				actions.set('map', {
					bounds: map.getBounds().toJSON(),
					center: map.getCenter().toJSON()
				});
			});
			// window.google.maps.event.addListener(map, 'click', () => actions.areas.cancel());

			state$.distinctUntilChanged(state =>
				[state.areas.list, state.map, state.areas.view, state.areas.doc && state.areas.doc._id])
				.subscribe(state => {
					geometries.forEach(geometry => geometry.setMap(null));
					geometries = state.areas.list
						.filter(area => !state.areas.doc || area._id !== state.areas.doc._id)
						.filter(area => area.path.filter(pos =>
							pos.lat < state.map.bounds.north
							&& pos.lat > state.map.bounds.south
							&& pos.lng < state.map.bounds.east
							&& pos.lng > state.map.bounds.west
						).length > 0)
						.map(area => {
							let geometry = obj.switch(area.type, {
								default: () => new window.google.maps.Polygon({
									paths: area.path.map(pos => new window.google.maps.LatLng(
										pos.lat,
										pos.lng
									)),
									strokeColor: '#333',
									strokeOpacity: 0.7,
									strokeWeight: 1,
									fillColor: '#aaa',
									fillOpacity: 0.2
								}),
								circle: () => new window.google.maps.Circle({
									center: area.center,
									clickable: true,
									draggable: true,
									fillColor: '#aaa',
									fillOpacity: 0.2,
									radius: area.radius || 1500,
									strokeColor: '#333',
									strokeOpacity: 0.7,
									strokeWeight: 1
								})
							})();
							geometry.setMap(map);
							window.google.maps.event.addListener(geometry, 'click', () => actions.router.go(`areas/${area._id}`));
							return geometry;
						});
				});

			state$.distinctUntilChanged(state =>
				[state.properties.list, state.map, state.properties.view])
				.subscribe(state => {
					markers.forEach(marker => marker.setMap(null));
					markers = state.properties.list
						.filter(doc =>
							doc.location.lat < state.map.bounds.north
							&& doc.location.lat > state.map.bounds.south
							&& doc.location.lng < state.map.bounds.east
							&& doc.location.lng > state.map.bounds.west
						)
						.map(doc => {
							let marker = new window.google.maps.Marker({
								position: doc.location,
								map: map
							});
							window.google.maps.event.addListener(marker, 'click', () => actions.router.go(`properties/${doc._id}`));
							return marker;
						});
				});

			state$.distinctUntilChanged(state => [
				state.areas.view,
				state.areas.doc && state.areas.doc._id,
				state.areas.doc && state.areas.doc.type,
				state.areas.doc && state.areas.doc.radius
			])
				.subscribe(state => {
					if (geometry) {
						geometry.setMap(null);
						geometry = null;
					}
					if (state.areas.view === 'create' || state.areas.view === 'edit') {
						geometry = obj.switch(state.areas.doc && state.areas.doc.type || 'polygon', {
							default: () => new window.google.maps.Polygon({
								paths: state.areas.view === 'edit' && state.areas.doc
								? state.areas.doc.path.map(pos => new window.google.maps.LatLng(
									pos.lat,
									pos.lng
								))
								: [
									new window.google.maps.LatLng(state.map.center.lat + (
										state.map.bounds.north - state.map.bounds.south
									) / 6, state.map.center.lng),
									new window.google.maps.LatLng(state.map.center.lat - (
										state.map.bounds.north - state.map.bounds.south
									) / 6, state.map.center.lng - (
										state.map.bounds.east - state.map.bounds.west
									) / 6),
									new window.google.maps.LatLng(state.map.center.lat - (
										state.map.bounds.north - state.map.bounds.south
									) / 6, state.map.center.lng + (
										state.map.bounds.east - state.map.bounds.west
									) / 6)
								],
								draggable: true, // turn off if it gets annoying
								editable: true,
								strokeColor: '#FF0000',
								strokeOpacity: 0.7,
								strokeWeight: 1,
								fillColor: '#FF0000',
								fillOpacity: 0.2
							}),
							circle: () => new window.google.maps.Circle({
								center: state.areas.doc && state.areas.doc.center || state.map.center,
								clickable: true,
								draggable: true,
								editable: true,
								fillColor: '#FF0000',
								fillOpacity: 0.2,
								radius: state.areas.doc && state.areas.doc.radius || 1500,
								strokeColor: '#FF0000',
								strokeOpacity: 0.7,
								strokeWeight: 1
							})
						})();
						geometry.setMap(map);

						if (state.areas.doc && state.areas.doc.type === 'circle') {
							if (state.areas.view === 'create') actions.set(['areas', 'doc'], {
								center: geometry.getCenter().toJSON(),
								radius: geometry.getRadius()
							});
							window.google.maps.event.addListener(geometry, 'center_changed', function(index, obj) {
								actions.set(['areas', 'doc'], {
									center: geometry.getCenter().toJSON()
								});
							});
							window.google.maps.event.addListener(geometry, 'radius_changed', function(index, obj) {
								actions.set(['areas', 'doc'], {
									radius: geometry.getRadius()
								});
							});
						} else {
							// initial set on create
							if (state.areas.view === 'create') actions.set(['areas', 'doc'], {
								path: geometry.getPath().getArray().map(pos => pos.toJSON()),
								center: centerOfPath(geometry.getPath().getArray())
							});
							window.google.maps.event.addListener(geometry.getPath(), 'insert_at', function(index, obj) {
								actions.set(['areas', 'doc'], {
									path: geometry.getPath().getArray().map(pos => pos.toJSON()),
									center: centerOfPath(geometry.getPath().getArray())
								});
							});
							window.google.maps.event.addListener(geometry.getPath(), 'set_at', function(index, obj) {
								actions.set(['areas', 'doc'], {
									path: geometry.getPath().getArray().map(pos => pos.toJSON()),
									center: centerOfPath(geometry.getPath().getArray())
								});
							});
						}
					}
				});
		});
};

module.exports = {
	hook
};
