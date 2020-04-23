/*
    Proxi
 
    Copyright (C) Emux Technologies. All Rights Reserved.
 
    https://emux.app
    Licenced by the Emux Open-Source Licence, which can be found at LICENCE.md.
*/

var map;

mapboxgl.accessToken = "pk.eyJ1IjoiamFtZXMtZW11eCIsImEiOiJjazliZ3hyZGUwNDFtM29ueXl1NGI2Z2tsIn0.uoDRkTJQ14Etd-z0X9jb2w";

$(function() {
    map = new mapboxgl.Map({
        container: "mapContent",
        style: "mapbox://styles/james-emux/ck9bh227900zb1inw6yobvwbc"
    });

    map.on("load", function() {
        map.resize();
    });
});