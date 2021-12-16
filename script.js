const targetPos = {
  latitude: 50.0843118,
  longitude: 14.4411621
};

var currentPos = {
  latitude: null,
  longitude: null
};

 const targetLocation = document.getElementById("target-location");
 const currentLocation = document.getElementById("current-location");
 const flightDistance = document.getElementById("flight-distance");
 const routeDistance = document.getElementById("route-distance");
 const mapElement = document.getElementById("map");

 targetLocation.innerHTML = `<p><span class="bold">Zeměpisná šířka:</span> ${targetPos.latitude}</p>
                             <p><span class="bold">Zeměpisná délka:</span> ${targetPos.longitude}</p>`;

                             
function getLocation() {
  navigator.geolocation.getCurrentPosition(updateCurrentLocation, errorMessage);
}

function updateCurrentLocation(pos) {
  let coords = pos.coords;

  currentLocation.innerHTML = `<p><span class="bold">Zeměpisná šířka:</span> ${coords.latitude}</p> 
                               <p><span class="bold">Zeměpisná délka:</span> ${coords.longitude}</p>`;

  currentPos.latitude = coords.latitude;
  currentPos.longitude = coords.longitude;

  mapElement.style.color = "transparent";
  handleMap(currentPos);
}

function errorMessage(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function handleMap(currentPos) {
  const center = SMap.Coords.fromWGS84(targetPos.longitude, targetPos.latitude);
  const map = new SMap(JAK.gel("map"), center, 12);

  map.addDefaultLayer(SMap.DEF_BASE).enable();
  map.addDefaultControls();

  let coords = [
      SMap.Coords.fromWGS84(targetPos.longitude, targetPos.latitude),
      SMap.Coords.fromWGS84(currentPos.longitude, currentPos.latitude),
  ];

  const config1 = {
    color: "hotpink",
    width: 4
  };

  const config2 = {
      color: "blue",
      width: 4
  };

  drawFlightDistance(map, coords, config1);
  drawRouteDistance(map, coords, config2);
}

function drawFlightDistance(map, coords, config) {
  const layer = new SMap.Layer.Geometry();
  map.addLayer(layer);
  layer.enable();

  const polyline = new SMap.Geometry(SMap.GEOMETRY_POLYLINE, null, coords, config);
  layer.addGeometry(polyline);

  let distance = coords[0].distance(coords[1]);
  flightDistance.innerHTML = `<span class="bold">Vzdálenost vzdušnou čarou:</span> ${distance.toFixed(2)}&nbsp;m ~ ${(distance / 1000).toFixed(2)}&nbsp;km`;
}

function drawRouteDistance(map, coords, config) {
  var isFound = function(route) {
    
    const layer = new SMap.Layer.Geometry();
    map.addLayer(layer).enable();

    const coords = route.getResults().geometry;
    
    const centerZoom = map.computeCenterZoom(coords);
    map.setCenterZoom(centerZoom[0], centerZoom[1]);
    
    const geometry = new SMap.Geometry(SMap.GEOMETRY_POLYLINE, null, coords, config);
    layer.addGeometry(geometry);
    
    let distance = route.getResults().length;
    routeDistance.innerHTML = `<span class="bold">Vzdálenost navrženou cestou:</span> ${distance.toFixed(2)}&nbsp;m ~ ${(distance / 1000).toFixed(2)}&nbsp;km`;
  }

  SMap.Route.route(coords, {
    geometry: true,
  }).then(isFound);
}

getLocation();