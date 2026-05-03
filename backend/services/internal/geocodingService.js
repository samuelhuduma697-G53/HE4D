/**
 * Geocoding Service - Huduma Ecosystem
 * Uses OpenStreetMap Nominatim + Kilifi ward lookup fallback
 */

const axios = require('axios');
const NodeCache = require('node-cache');
const logger = require('../../config/logger');

class GeocodingService {
  constructor() {
    this.nominatimURL = process.env.OSM_NOMINATIM_URL || 'https://nominatim.openstreetmap.org';
    this.cache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });
    this.userAgent = 'Huduma-Ecosystem/1.0 (Pwani University)';
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000;
  }

  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest));
    }
    this.lastRequestTime = Date.now();
  }

  async geocodeAddress(address, country = 'Kenya') {
    const cacheKey = `geocode:${address.toLowerCase()}:${country.toLowerCase()}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    await this.rateLimit();
    try {
      const response = await axios.get(`${this.nominatimURL}/search`, {
        params: { q: `${address}, ${country}`, format: 'json', limit: 1, addressdetails: 1, countrycodes: 'ke' },
        headers: { 'User-Agent': this.userAgent },
        timeout: 8000
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        const location = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          formattedAddress: result.display_name,
          county: this.extractCountyFromOSM(result.address) || 'Kilifi',
          subCounty: this.extractSubCountyFromOSM(result.address) || 'Kilifi North',
          ward: this.extractWardFromOSM(result.address) || 'Sokoni'
        };
        this.cache.set(cacheKey, location);
        return location;
      }
      return this.kilifiWardLookup(0, 0); // Fallback
    } catch (error) {
      logger.warn('Geocoding error, using Kilifi lookup');
      return this.kilifiWardLookup(0, 0);
    }
  }

  async reverseGeocode(lat, lng) {
    const cacheKey = `reverse:${lat},${lng}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    await this.rateLimit();
    try {
      const response = await axios.get(`${this.nominatimURL}/reverse`, {
        params: { lat, lon: lng, format: 'json', addressdetails: 1, zoom: 18 },
        headers: { 'User-Agent': this.userAgent },
        timeout: 8000
      });

      if (response.data) {
        const result = response.data;
        const address = {
          formattedAddress: result.display_name,
          county: this.extractCountyFromOSM(result.address) || 'Kilifi',
          subCounty: this.extractSubCountyFromOSM(result.address) || 'Kilifi North',
          ward: this.extractWardFromOSM(result.address) || 'Sokoni',
          lat, lng
        };
        this.cache.set(cacheKey, address);
        return address;
      }
      return this.kilifiWardLookup(lat, lng);
    } catch (error) {
      logger.warn('Reverse geocoding failed, using Kilifi ward lookup');
      return this.kilifiWardLookup(lat, lng);
    }
  }

  /**
   * Kilifi ward lookup - used when OSM geocoding is unavailable
   * Maps GPS coordinates to nearest known ward in Kilifi County
   */
  kilifiWardLookup(lat, lng) {
    const wards = [
      { name: 'Sokoni', subCounty: 'Kilifi North', county: 'Kilifi', lat: -3.63, lng: 39.85 },
      { name: 'Mnarani', subCounty: 'Kilifi North', county: 'Kilifi', lat: -3.635, lng: 39.84 },
      { name: 'Tezo', subCounty: 'Kilifi North', county: 'Kilifi', lat: -3.58, lng: 39.82 },
      { name: 'Matsangoni', subCounty: 'Kilifi North', county: 'Kilifi', lat: -3.55, lng: 39.90 },
      { name: 'Watamu', subCounty: 'Kilifi North', county: 'Kilifi', lat: -3.35, lng: 40.02 },
      { name: 'Malindi Town', subCounty: 'Malindi', county: 'Kilifi', lat: -3.22, lng: 40.12 },
      { name: 'Shella', subCounty: 'Malindi', county: 'Kilifi', lat: -3.20, lng: 40.13 },
      { name: 'Ganda', subCounty: 'Malindi', county: 'Kilifi', lat: -3.25, lng: 40.10 },
      { name: 'Junju', subCounty: 'Kilifi South', county: 'Kilifi', lat: -3.90, lng: 39.70 },
      { name: 'Mwarakaya', subCounty: 'Kilifi South', county: 'Kilifi', lat: -3.85, lng: 39.72 },
      { name: 'Kaloleni', subCounty: 'Kaloleni', county: 'Kilifi', lat: -3.78, lng: 39.62 },
      { name: 'Mariakani', subCounty: 'Kaloleni', county: 'Kilifi', lat: -3.75, lng: 39.58 },
      { name: 'Ganze', subCounty: 'Ganze', county: 'Kilifi', lat: -3.55, lng: 39.52 },
      { name: 'Bamba', subCounty: 'Ganze', county: 'Kilifi', lat: -3.40, lng: 39.45 },
      { name: 'Marafa', subCounty: 'Magarini', county: 'Kilifi', lat: -3.05, lng: 39.95 },
      { name: 'Magarini', subCounty: 'Magarini', county: 'Kilifi', lat: -3.10, lng: 39.90 },
      { name: 'Rabai', subCounty: 'Rabai', county: 'Kilifi', lat: -3.87, lng: 39.57 },
    ];

    // Default to Pwani University area
    if (!lat || !lng || lat === 0) {
      return {
        county: 'Kilifi',
        subCounty: 'Kilifi North',
        ward: 'Sokoni',
        formattedAddress: 'Pwani University area, Sokoni, Kilifi North, Kilifi'
      };
    }

    let nearest = wards[0];
    let minDist = Infinity;

    for (const ward of wards) {
      const dist = Math.sqrt((lat - ward.lat) ** 2 + (lng - ward.lng) ** 2);
      if (dist < minDist) {
        minDist = dist;
        nearest = ward;
      }
    }

    return {
      county: nearest.county,
      subCounty: nearest.subCounty,
      ward: nearest.name,
      formattedAddress: `${nearest.name}, ${nearest.subCounty}, ${nearest.county}`
    };
  }

  extractCountyFromOSM(address) {
    if (!address) return null;
    return address.county || address.state || address.region || null;
  }

  extractSubCountyFromOSM(address) {
    if (!address) return null;
    return address.suburb || address.city_district || address.district || null;
  }

  extractWardFromOSM(address) {
    if (!address) return null;
    return address.neighbourhood || address.suburb || null;
  }

  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async healthCheck() {
    try {
      await axios.get(`${this.nominatimURL}/status`, { timeout: 5000, headers: { 'User-Agent': this.userAgent } });
      return { status: 'healthy' };
    } catch (e) {
      return { status: 'fallback', message: 'Using Kilifi ward lookup table' };
    }
  }
}

module.exports = new GeocodingService();
