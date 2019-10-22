export const styles = [
  {
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#ffffff"
      }
    ]
  },
  {
    elementType: "labels.text.stroke",
    stylers: [
      {
        color: "#1a714c"
      }
    ]
  },
  {
    featureType: "administrative",
    elementType: "geometry.fill",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "landscape",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#0fb36f"
      }
    ]
  },
  {
    featureType: "poi",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "road",
    stylers: [
      {
        color: "#1a714c"
      },
      {
        visibility: "simplified"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "labels.icon",
    stylers: [
      {
        visibility: "off"
      }
    ]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [
      {
        color: "#ffffff"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "geometry.fill",
    stylers: [
      {
        color: "#c3e8ff"
      }
    ]
  },
  {
    featureType: "water",
    elementType: "labels",
    stylers: [
      {
        visibility: "off"
      }
    ]
  }
];

export function latLng2Point(latLng, map) {
  var topRight = map
    .getProjection()
    .fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map
    .getProjection()
    .fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
  return new google.maps.Point(
    (worldPoint.x - bottomLeft.x) * scale,
    (worldPoint.y - topRight.y) * scale
  );
}

export function point2LatLng(point, map) {
  var topRight = map
    .getProjection()
    .fromLatLngToPoint(map.getBounds().getNorthEast());
  var bottomLeft = map
    .getProjection()
    .fromLatLngToPoint(map.getBounds().getSouthWest());
  var scale = Math.pow(2, map.getZoom());
  var worldPoint = new google.maps.Point(
    point.x / scale + bottomLeft.x,
    point.y / scale + topRight.y
  );
  return map.getProjection().fromPointToLatLng(worldPoint);
}
