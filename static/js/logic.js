// At the beginning of the file, add:
console.log("logic.js loaded");

// Define base maps
// OpenStreetMap layer
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Topographic map layer
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.opentopomap.org">OpenTopoMap</a> contributors'
});

// Satellite imagery layer
let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Create the map object with initial center, zoom level, and default layer
let myMap = L.map("map", {
    center: [37.8, -96], // Center of the United States
    zoom: 4,
    layers: [street] // Default layer
});

// Create layer groups for different data sets
let earthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();
let orogens = new L.LayerGroup();
let steps = new L.LayerGroup();
let plates = new L.LayerGroup();

// Define base maps object for layer control
let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo,
    "Satellite": satellite
};

// Define overlay maps object for layer control
let overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates,
    "Orogens": orogens,
    "Steps": steps,
    "Plates": plates
};

// Add layer control to the map
L.control.layers(baseMaps, overlayMaps, {collapsed: false}).addTo(myMap);

// Load earthquake data (All Earthquakes of Past 7 Days)
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
    
    // Function to determine marker size based on magnitude
    function markerSize(magnitude) {
        return magnitude * 4; // Scale factor for visibility
    }

    // Function to determine marker color based on depth
    function markerColor(depth) {
        // Color scale from light green to red based on depth
        if (depth > 90) return "#FF0000";
        else if (depth > 70) return "#FF4500";
        else if (depth > 50) return "#FFA500";
        else if (depth > 30) return "#FFD700";
        else if (depth > 10) return "#FFFF00";
        else return "#90EE90";
    }

    // Create a GeoJSON layer for earthquakes
    L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            // Create circle markers
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: markerColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function(feature, layer) {
            // Bind popup with earthquake information
            layer.bindPopup(`
                <h3>${feature.properties.place}</h3>
                <hr>
                <p>Magnitude: ${feature.properties.mag}</p>
                <p>Depth: ${feature.geometry.coordinates[2]} km</p>
                <p>Time: ${new Date(feature.properties.time).toLocaleString()}</p>
            `);
        }
    }).addTo(earthquakes);

    // Add earthquake layer to the map
    earthquakes.addTo(myMap);

    // Create a legend
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend'),
            depths = [-10, 10, 30, 50, 70, 90],
            labels = [];

        div.innerHTML = '<h4>Depth (km)</h4>';
        // Generate a label with a colored square for each interval
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(depths[i] + 1) + '"></i> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }

        return div;
    };

    // Add error handling for legend creation
    try {
        legend.addTo(myMap);
    } catch (error) {
        console.error("Error adding legend to map:", error);
    }

    legend.addTo(myMap);
});

// Load and add tectonic plates data
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json").then(function(plateData) {
    L.geoJson(plateData, {
        style: function(feature) {
            return {
                color: "orange",
                weight: 2,
                fillColor: "transparent"
            };
        },
        onEachFeature: function(feature, layer) {
            // Bind popup with plate information
            layer.bindPopup(`
                <h3>Plate: ${feature.properties.PlateName}</h3>
                <p>Code: ${feature.properties.Code}</p>
            `);
        }
    }).addTo(tectonicPlates);

    // Add tectonic plates layer to the map
    tectonicPlates.addTo(myMap);
}).catch(function(error) {
    console.error("Error loading tectonic plates data:", error);
});

// Load and add orogens data
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_orogens.json").then(function(orogenData) {
    L.geoJson(orogenData, {
        style: function(feature) {
            return {
                color: "purple",
                weight: 2,
                fillColor: "purple",
                fillOpacity: 0.3
            };
        },
        onEachFeature: function(feature, layer) {
            // Bind popup with orogen information
            layer.bindPopup(`
                <h3>Orogen: ${feature.properties.Name}</h3>
                <p>Type: ${feature.geometry.type}</p>
            `);
        }
    }).addTo(orogens);

    // Add orogens layer to the map
    orogens.addTo(myMap);
}).catch(function(error) {
    console.error("Error loading orogens data:", error);
});

// Load and add steps data
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_steps.json").then(function(stepData) {
    L.geoJson(stepData, {
        color: "blue",
        weight: 1
    }).addTo(steps);

    // Add steps layer to the map
    steps.addTo(myMap);
}).catch(function(error) {
    console.error("Error loading steps data:", error);
});

// Load and add plates data
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json").then(function(plateData) {
    console.log("Plate data loaded:", plateData); // Debug: Log the loaded data
    L.geoJson(plateData, {
        style: function(feature) {
            return {
                color: "orange",
                weight: 2,
                fill: false
            };
        },
        onEachFeature: function(feature, layer) {
            console.log("Processing feature:", feature); // Debug: Log each feature
            // Bind popup with plate information
            layer.bindPopup(`
                <h3>Plate: ${feature.properties.PlateName}</h3>
                <p>Code: ${feature.properties.Code}</p>
            `);
        }
    }).addTo(plates);

    // Add plates layer to the map
    plates.addTo(myMap);
    console.log("Plates layer added to map"); // Debug: Confirm layer addition
});

// Function to generate random colors for plate fill
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// At the end of the file, add:
console.log("Map initialization complete");
