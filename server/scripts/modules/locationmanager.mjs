// location manager - manages multiple locations for cycling through forecasts

const STORAGE_KEY = 'multiLocations';

// internal state
let locations = [];
let currentLocationIndex = 0;
let onLocationChangeCallback = null;
let listElement = null;

// load locations from localStorage
const loadFromStorage = () => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			locations = JSON.parse(stored);
		}
	} catch (e) {
		console.warn('Failed to load multi-locations from localStorage:', e);
		locations = [];
	}
};

// save locations to localStorage
const saveToStorage = () => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
};

// add a location
const addLocation = (name, latLon) => {
	// don't add duplicates (same lat/lon)
	const exists = locations.some(
		(loc) => loc.latLon.lat === latLon.lat && loc.latLon.lon === latLon.lon,
	);
	if (exists) return false;

	locations.push({ name, latLon });
	saveToStorage();
	renderList();
	return true;
};

// remove a location by index
const removeLocation = (index) => {
	if (index < 0 || index >= locations.length) return;
	locations.splice(index, 1);

	// adjust current index if needed
	if (currentLocationIndex >= locations.length) {
		currentLocationIndex = 0;
	}

	saveToStorage();
	renderList();
};

// get all locations
const getLocations = () => locations;

// get the current location index
const getCurrentLocationIndex = () => currentLocationIndex;

// get current location
const getCurrentLocation = () => locations[currentLocationIndex] ?? null;

// advance to the next location, returns the new location or null if only one location
const nextLocation = () => {
	if (locations.length <= 1) return null;
	currentLocationIndex = (currentLocationIndex + 1) % locations.length;
	renderList();
	return locations[currentLocationIndex];
};

// reset to first location
const resetToFirst = () => {
	currentLocationIndex = 0;
	renderList();
};

// set callback for when location changes (triggered by navigation cycling)
const onLocationChange = (callback) => {
	onLocationChangeCallback = callback;
};

// called by navigation when it's time to switch locations
const triggerLocationChange = () => {
	const loc = nextLocation();
	if (loc && onLocationChangeCallback) {
		onLocationChangeCallback(loc);
	}
	return loc;
};

// check if multi-location cycling is active
const isMultiLocationActive = () => locations.length > 1;

// render the location list in the UI
const renderList = () => {
	if (!listElement) return;

	listElement.innerHTML = '';

	if (locations.length === 0) {
		const empty = document.createElement('div');
		empty.className = 'location-empty';
		empty.textContent = 'No locations added. Use the search box above and click "Add Location" to add locations.';
		listElement.append(empty);
		return;
	}

	locations.forEach((loc, index) => {
		const item = document.createElement('div');
		item.className = 'location-item';
		if (index === currentLocationIndex && locations.length > 1) {
			item.classList.add('active');
		}

		const name = document.createElement('span');
		name.className = 'location-name';
		name.textContent = loc.name;

		const removeBtn = document.createElement('button');
		removeBtn.className = 'location-remove';
		removeBtn.textContent = 'X';
		removeBtn.title = 'Remove location';
		removeBtn.addEventListener('click', (e) => {
			e.preventDefault();
			removeLocation(index);
		});

		item.append(name, removeBtn);
		listElement.append(item);
	});
};

// initialize the location manager with DOM element
const initUI = (element) => {
	listElement = element;
	loadFromStorage();
	renderList();
};

// clear all locations
const clearLocations = () => {
	locations = [];
	currentLocationIndex = 0;
	saveToStorage();
	renderList();
};

// set locations from parsed query string (for permalink support)
const setLocationsFromQuery = (locs) => {
	locations = locs;
	currentLocationIndex = 0;
	saveToStorage();
	renderList();
};

export {
	addLocation,
	removeLocation,
	getLocations,
	getCurrentLocation,
	getCurrentLocationIndex,
	nextLocation,
	resetToFirst,
	onLocationChange,
	triggerLocationChange,
	isMultiLocationActive,
	initUI,
	clearLocations,
	setLocationsFromQuery,
	renderList,
};
