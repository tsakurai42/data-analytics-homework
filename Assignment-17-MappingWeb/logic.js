USGSurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson" // week
// USGSurl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson" // 30 days
function linspace(start, end, n) {
    var out = [];
    var delta = (end - start) / (n - 1);

    var i = 0;
    while (i < (n - 1)) {
        out.push(start + (i * delta));
        i++;
    }

    out.push(end);
    return out;
}

d3.json(USGSurl).then(EQdata => {
    // console.log(EQdata)
    console.log(+d3.min(EQdata.features.map(d => d.properties.mag)))
    var magmin = 1.0;   // can easily read the min EQ magnitude from the data, but A) the minimum found is -1.37, which, what is a negative magnitude earthquake?
                        // Instead, manually setting the minimum magnitude earthquake to map lends to a clearer image.
                        // also, I googled it. Since earthquake magnitude is a logarithmic scale. Magnitude 3 is 10x "stronger" than Magnitude 2.
                        // On the flip side, Magnitude 0 is 1/1000 compared to Magnitude 3 and -1 is 1/10000 compared to Magnitude 3.
    var magmax = +d3.max(EQdata.features.map(d => d.properties.mag))
    // console.log(magmin, magmax)
    EQscale = d3.scaleSequential(d3.interpolateInferno).domain([magmax, magmin])
    var earthquakes = L.geoJSON(EQdata.features, {
        pointToLayer: function (feature, latlng) {
            var geojsonMarkerOptions = {
                radius: feature.properties.mag * 5,
                fillColor: EQscale(feature.properties.mag),
                color: ["#000"],
                weight: 2,
                opacity: 1,
                fillOpacity: 0.9
            }
            return L.circleMarker(latlng, geojsonMarkerOptions)
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`size of EQ: ${feature.properties.mag}; @ ${new Date(feature.properties.time)}`)
        },
        filter : function(feature,layer) {
            return feature.properties.mag >= magmin;
        }
    })
    var EQlat = EQdata.features.map(d => +d.geometry.coordinates[1]);
    var EQlng = EQdata.features.map(d => +d.geometry.coordinates[0]);
    var EQmag = EQdata.features.map(d => +d.properties.mag)

    // console.log(EQlat, EQlng, EQmag)

    var points = [];

    // EQheatmapData

    EQlat.forEach((d, i) => {
        var point = [
            EQlat[i],
            EQlng[i]
            , EQmag[i]
        ]
        points.push(point)
    })

    console.log(points)
    var EQheatmap = L.heatLayer(points, { minOpacity: 0.3, radius: 25, max: magmax, blur: 10 })

    var xScale = d3.scaleLinear()
        .domain([magmin, magmax])
        .range([0, 400]);
    var magrange = magmax - magmin;
    console.log(`magrange: ${magrange}`)
    const svg = d3.select("#scale").append('svg').append('g');
    var splits = 100;
    var EQmagsplit = []
    for (i = 0; i <= splits; i++) {
        EQmagsplit.push(magmax - i/splits*magrange)
    }
    console.log(EQmagsplit)
    console.log(xScale(EQmagsplit[0]))
    svg.selectAll('rect')
        .data(EQmagsplit)
        .enter().append('rect')
        .attr('height', 10)
        .attr('x', d => xScale(d))
        .attr('width', d => xScale(1 / splits * magrange + magmin))
        .attr('fill', d => EQscale(d))
    svg.call(d3.axisBottom(xScale)
        .tickSize(15) //test this
        .tickValues(EQmagsplit.filter((d, i) => { return i % (splits / 10) == 0 }))
    )
    svg.append("text")
        .attr("class", "caption")
        .attr("x", 170)
        .attr("y", 35)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-size",14)
        .attr("font-weight", "bold")
        .text("Magnitude");


    // var scaleAxisTop = d3.scaleLinear().domain(EQscale.domain()).range([50, 450])

    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(faultData => {
        console.log(faultData)
        var faultlines = L.geoJSON(faultData, { "color": "orangered", "weight": 5 })


        var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            id: "mapbox.light",
            maxZoom: 18,
            accessToken: API_KEY
        })

        var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            id: "mapbox.dark",
            maxZoom: 18,
            accessToken: API_KEY
        })

        var outdoorsmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            id: "mapbox.outdoors",
            maxZoom: 18,
            accessToken: API_KEY
        })
        var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            id: "mapbox.satellite",
            maxZoom: 18,
            accessToken: API_KEY
        })

        baseMaps = {
            "Light": lightmap,
            "Dark": darkmap,
            "Outdoors": outdoorsmap,
            "Satellite": satellitemap
        }

        overlayMaps = {
            "Earthquakes": earthquakes,
            "Faultlines": faultlines,
            "Heatmap": EQheatmap
        }
        var myMap = L.map("mapid", {
            center: [39.8283, -98.5795],
            zoom: 5,
            layers: [outdoorsmap, earthquakes, faultlines]
        });
        L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);
    })
})

