import { map, tileLayer, Icon, icon, marker, popup, latLng } from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

export default class Map {
  // Private class fields
  #zoom = 5;
  #map = null;

  // Get place name using coordinates
  static async getPlaceNameByCoordinate(latitude, longitude) {
    try {
      // Create API URL
      const url = new URL(`https://api.maptiler.com/geocoding/${longitude},${latitude}.json`);

      // Set query parameters
      url.searchParams.set('key', MAP_SERVICE_API_KEY);
      url.searchParams.set('language', 'id');
      url.searchParams.set('limit', '1');

      // Fetch and process data
      const response = await fetch(url);
      const json = await response.json();
      const place = json.features[0].place_name.split(', ');

      // Return formatted place name
      return [place.at(-2), place.at(-1)].map((name) => name).join(', ');
    } catch (error) {
      // Log error and return coordinates as fallback
      console.error('getPlaceNameByCoordinate: error:', error);
      return `${latitude}, ${longitude}`;
    }
  }

  // Check if geolocation is available in browser
  static isGeolocationAvailable() {
    return 'geolocation' in navigator;
  }

  // Get current position as Promise
  static getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
      // Check availability first
      if (!Map.isGeolocationAvailable()) {
        reject('Geolocation API unsupported');
        return;
      }

      // Request position
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  /**
   * Factory method to build map instance
   * See: https://stackoverflow.com/questions/43431550/how-can-i-invoke-asynchronous-code-within-a-constructor
   */
  static async build(selector, options = {}) {
    // If center is provided, create map immediately
    if ('center' in options && options.center) {
      return new Map(selector, options);
    }

    // Default coordinate (Jakarta)
    const jakartaCoordinate = [-6.2, 106.816666];

    // Try to use geolocation if requested
    if ('locate' in options && options.locate) {
      try {
        // Get user's position
        const position = await Map.getCurrentPosition();
        const coordinate = [position.coords.latitude, position.coords.longitude];

        // Create map with user's position as center
        return new Map(selector, {
          ...options,
          center: coordinate,
        });
      } catch (error) {
        // Use default coordinate on error
        console.error('build: error:', error);
        return new Map(selector, {
          ...options,
          center: jakartaCoordinate,
        });
      }
    }

    // Return map with default coordinate
    return new Map(selector, {
      ...options,
      center: jakartaCoordinate,
    });
  }

  // Constructor
  constructor(selector, options = {}) {
    // Set zoom level
    this.#zoom = options.zoom ?? this.#zoom;

    // Create tile layer
    const tileOsm = tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    });

    // Initialize map
    this.#map = map(document.querySelector(selector), {
      zoom: this.#zoom,
      scrollWheelZoom: false,
      layers: [tileOsm],
      ...options,
    });
  }

  // Change map view
  changeCamera(coordinate, zoomLevel = null) {
    if (!zoomLevel) {
      this.#map.setView(latLng(coordinate), this.#zoom);
      return;
    }

    this.#map.setView(latLng(coordinate), zoomLevel);
  }

  // Get current center position
  getCenter() {
    const { lat, lng } = this.#map.getCenter();
    return {
      latitude: lat,
      longitude: lng,
    };
  }

  // Create marker icon
  createIcon(options = {}) {
    return icon({
      ...Icon.Default.prototype.options,
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      ...options,
    });
  }

  // Add marker to map
  addMarker(coordinates, markerOptions = {}, popupOptions = null) {
    // Validate markerOptions
    if (typeof markerOptions !== 'object') {
      throw new Error('markerOptions must be an object');
    }

    // Create marker
    const newMarker = marker(coordinates, {
      icon: this.createIcon(),
      ...markerOptions,
    });

    // Add popup if provided
    if (popupOptions) {
      // Validate popupOptions
      if (typeof popupOptions !== 'object') {
        throw new Error('popupOptions must be an object');
      }
      if (!('content' in popupOptions)) {
        throw new Error('popupOptions must include `content` property.');
      }

      // Create and bind popup
      const newPopup = popup(coordinates, popupOptions);
      newMarker.bindPopup(newPopup);
    }

    // Add marker to map
    newMarker.addTo(this.#map);
    return newMarker;
  }

  // Add event listener to map
  addMapEventListener(eventName, callback) {
    this.#map.addEventListener(eventName, callback);
  }
}
