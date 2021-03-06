/*
    Proxi
 
    Copyright (C) Emux Technologies. All Rights Reserved.
 
    https://emux.app
    Licenced by the Proxi Terms of Service, which can be found at https://emux.app/terms.
*/

var map;
var mapGeolocation;
var mapHomeMarker;
var mapHeatData = {
    "type": "FeatureCollection",
    "features": []
};
var mapHeatReference = null;

mapboxgl.accessToken = "pk.eyJ1IjoiamFtZXMtZW11eCIsImEiOiJjazliZ3hyZGUwNDFtM29ueXl1NGI2Z2tsIn0.uoDRkTJQ14Etd-z0X9jb2w";

function resetHomeMarker() {
    mapHomeMarker.remove();

    mapHomeMarker = new mapboxgl.Marker($("<div class='mapHome'>").append(
        $("<icon aria-label='@Your home'>").text("house")
    )[0]).setLngLat(
        new mapboxgl.LngLat(Number(localStorage.getItem("homeAddressLongitude") || 0), Number(localStorage.getItem("homeAddressLatitude") || 0))
    ).addTo(map);
}

$(function() {
    mapboxgl.setRTLTextPlugin(
        "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
        null,
        true
    );

    map = new mapboxgl.Map({
        container: "mapContent",
        style: window.matchMedia("(prefers-color-scheme: dark)").matches ? "mapbox://styles/james-emux/ck9ld5dmq00101iqftm9vmvw7" : "mapbox://styles/james-emux/ck9bh227900zb1inw6yobvwbc"
    });

    mapGeolocation = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true,
        },
        trackUserLocation: true
    });
    
    map.addControl(mapGeolocation);

    mapHomeMarker = new mapboxgl.Marker($("<div class='mapHome'>").append(
        $("<icon aria-label='@Your home'>").text("house")
    )[0]).setLngLat(
        new mapboxgl.LngLat(Number(localStorage.getItem("homeAddressLongitude") || 0), Number(localStorage.getItem("homeAddressLatitude") || 0))
    ).addTo(map);

    map.on("load", function() {
        map.resize();

        mapGeolocation.trigger();

        map.addSource("tracked", {
            type: "geojson",
            data: mapHeatData
        });
    
        map.addLayer({
            id: "tracked",
            type: "heatmap",
            source: "tracked",
            maxzoom: 16
        });

        map.setPaintProperty("tracked", "heatmap-opacity", 0.6);
    });

    map.on("moveend", function() {
        if (mapHeatReference != null) {
            mapHeatReference.off();
        }

        mapHeatReference = firebase.database().ref("tracked").orderByChild("loc").startAt(
            Geohash.encode(map.getBounds()._sw.lat, map.getBounds()._sw.lng, GEOHASH_PRECISION)
        ).endAt(
            Geohash.encode(map.getBounds()._ne.lat, map.getBounds()._ne.lng, GEOHASH_PRECISION)
        );

        mapHeatReference.on("value", function(snapshot) {
            mapHeatData = {
                "type": "FeatureCollection",
                "features": []
            };

            snapshot.forEach(function(childSnapshot) {
                if (new Date().getTime() - childSnapshot.val().time <= TRACKED_TIMEOUT && childSnapshot.key != localStorage.getItem("trackingAid")) {
                    mapHeatData.features.push({
                        "type": "feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [
                                Geohash.decode(childSnapshot.val().loc).lon,
                                Geohash.decode(childSnapshot.val().loc).lat,
                                0
                            ]
                        }
                    });
                }
                
            });

            map.getSource("tracked").setData(mapHeatData);
        });
    });
});