

//create map layers

var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 12,
    id: "mapbox.satellite",
    accessToken: api_key
});

var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 12,
    id: "mapbox.light",
    accessToken: api_key
});


// Perform a GET request to the query URL
var queryUrl = "/geomap";

d3
    .json(queryUrl)
    .then(function (fifaDataArray) {
        console.log(fifaDataArray);

        fifaDataArray.forEach(function (country) {
            country.Overall = Math.round(country.Overall)
        })

        createMarkers(fifaDataArray)
    });

//create markers with Nationality and overall average score

function createMarkers(fifaDataArray) {

    // Initialize an array to hold bike markers
    var countriesMarkers = [];

    // Loop through the stations array
    for (var index = 0; index < fifaDataArray.length; index++) {
        var country = fifaDataArray[index];

        var countriesMarker = L.circleMarker([country.Latitude, country.Longitude], {
            fillOpacity: 0.8,
            color: 'white',
            fillColor: '#00a0d1',
            radius: country.Overall * 0.15
        }).bindPopup("<h3>" + country.Nationality + "<h3><h3>Overall Average Score: " + country.Overall + "<h3>");

        countriesMarkers.push(countriesMarker);
    }

    // Create a layer group made from the bike markers array, pass it into the createMap function

    var countryLayerGroup = L.layerGroup(countriesMarkers);

    // Create a baseMaps object to hold the lightmap layer
    var baseMaps = {
        "Satellite": satellite,
        "Light Map": lightmap
    };

    // Create an overlayMaps object to hold the overall score layer
    var overlayMaps = {
        'Overall Avg Score': countryLayerGroup
    }

    //create map

    var map = L.map("map", {
        center: [33, 20],
        zoom: 2,
        layers: [satellite, countryLayerGroup]
    });

    // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map);

}