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
  let lat = latLng.lat() + (46.103418 - map.getCenter().lat());
  let lng = latLng.lng() - (-123.201742 - map.getCenter().lng());
  //console.log("lng", latLng.lng(), map.getCenter().lng(), lng)
  var latLngBounds = map.getBounds();
  if (!latLngBounds) return { x: 0, y: 0 };
  var neBound = latLngBounds.getNorthEast();
  var swBound = latLngBounds.getSouthWest();

  var tr = map.getProjection().fromLatLngToPoint(neBound);
  var bl = map.getProjection().fromLatLngToPoint(swBound);

  var point = map.getProjection().fromLatLngToPoint(latLng);
  var xpoint = map.getProjection().fromLatLngToPoint(new google.maps.LatLng(lat, lng));
  //console.log(point, xpoint);

  var div = document.getElementById("map")
  var w = div.offsetWidth;
  var h = div.offsetHeight;

  var x = ((point.x - bl.x)*w/ (tr.x - bl.x)) - w/2;
  var y = ((point.y - tr.y)*h/ (bl.y - tr.y)) - h/2;

  var xx = ((xpoint.x - bl.x)*w/ (tr.x - bl.x)) - w/2;
  var xy = ((xpoint.y - tr.y)*h/ (bl.y - tr.y)) - h/2;

  //console.log(x, y, xx, xy);

  return new google.maps.Point(x, y);
}

export function point2LatLng(point, map) {
  var latLngBounds = map.getBounds();
  var neBound = latLngBounds.getNorthEast();
  var swBound = latLngBounds.getSouthWest();

  var tr = map.getProjection().fromLatLngToPoint(neBound);
  var bl = map.getProjection().fromLatLngToPoint(swBound);

  var div = document.getElementById("map")
  var w = div.offsetWidth;
  var h = div.offsetHeight;

  var x = ((tr.x - bl.x) * (point.x + w / 2)) / w + bl.x;
  var y = ((bl.y - tr.y) * (point.y + h / 2)) / h + tr.y;

  return map
    .getProjection()
    .fromPointToLatLng(new google.maps.Point(x, y));
}
