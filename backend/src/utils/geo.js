
/**
 * Utilidades Geoespaciales
 * Contiene funciones para cálculos geográficos, como la detección de puntos en polígonos.
 */

/**
 * Determina si un punto geográfico se encuentra dentro de un polígono.
 * Utiliza el algoritmo de Ray Casting (rayo horizontal).
 *
 * @param {Object} point - El punto a verificar, con formato { lat: Number, lng: Number }.
 * @param {Array<Object>} polygon - Un array de puntos que definen el polígono, cada uno con formato { lat: Number, lng: Number }.
 * @returns {boolean} - True si el punto está dentro del polígono, false en caso contrario.
 */
function pointInPolygon(point, polygon) {
  if (!point || !polygon || !Array.isArray(polygon) || polygon.length < 3) {
    return false;
  }

  const lat = point.lat;
  const lng = point.lng;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;

    const intersect = ((yi > lng) !== (yj > lng)) &&
      (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);

    if (intersect) {
      inside = !inside;
    }
  }

  return inside;
}

module.exports = {
  pointInPolygon,
};
