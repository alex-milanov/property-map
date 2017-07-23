'use strict';

// lib
const Rx = require('rx');
const $ = Rx.Observable;

// iblokz
const {obj, arr} = require('iblokz-data');

let map;
let pos = {
	lat: 51.5073835,
	lng: -0.1277801
};

let polygon = null;
let polygons = [];

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

const hook = ({state$, actions}) => {
	$.interval(100).map(() => document.querySelector('#map'))
		.filter(mapEl => mapEl && window.google && window.google.maps && pos)
		.take(1)
		.subscribe(mapEl => {
			map = new window.google.maps.Map(mapEl, {
				center: pos,
				zoom: 14
			});
			window.google.maps.event.addListener(map, 'bounds_changed', () => {
				console.log(map.getBounds().toJSON());
				actions.set('map', {
					bounds: map.getBounds().toJSON(),
					center: map.getCenter().toJSON()
				});
			});
			// window.google.maps.event.addListener(map, 'click', () => actions.areas.cancel());
		});

	state$.distinctUntilChanged(state =>
		[state.areas.list, state.map, state.areas.view, state.areas.doc && state.areas.doc._id])
		.subscribe(state => {
			polygons.forEach(polygon => polygon.setMap(null));
			polygons = state.areas.list
				.filter(area => !state.areas.doc || area._id !== state.areas.doc._id)
				.filter(area => area.path.filter(pos =>
					pos.lat < state.map.bounds.north
					&& pos.lat > state.map.bounds.south
					&& pos.lng < state.map.bounds.east
					&& pos.lng > state.map.bounds.west
				).length > 0)
				.map(area => {
					let polygon = new window.google.maps.Polygon({
						paths: area.path.map(pos => new window.google.maps.LatLng(
							pos.lat,
							pos.lng
						)),
						strokeColor: '#000000',
						strokeOpacity: 0.8,
						strokeWeight: 2,
						fillColor: '#000000',
						fillOpacity: 0.35
					});
					polygon.setMap(map);
					window.google.maps.event.addListener(polygon, 'click', () => actions.router.go(`areas/${area._id}`));
					return polygon;
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

	state$.distinctUntilChanged(state => [state.areas.view, state.areas.doc && state.areas.doc._id])
		.subscribe(state => {
			if (polygon) {
				polygon.setMap(null);
				polygon = null;
			}
			if (state.areas.view === 'create' || state.areas.view === 'edit') {
				polygon = new window.google.maps.Polygon({
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
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: '#FF0000',
					fillOpacity: 0.35
				});
				polygon.setMap(map);
				if (state.areas.view === 'create') actions.set(['areas', 'doc', 'path'], polygon.getPath().getArray().map(pos => pos.toJSON()));
				window.google.maps.event.addListener(polygon.getPath(), 'insert_at', function(index, obj) {
					actions.set(['areas', 'doc', 'path'], polygon.getPath().getArray().map(pos => pos.toJSON()));
				});
				window.google.maps.event.addListener(polygon.getPath(), 'set_at', function(index, obj) {
					actions.set(['areas', 'doc', 'path'], polygon.getPath().getArray().map(pos => pos.toJSON()));
				});
			}
		});
};

module.exports = {
	hook
};
