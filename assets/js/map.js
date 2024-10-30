/**
 * Checks if the given string is a valid URL.
 *
 * @param {string} url - The string to check if it is a valid URL.
 * @return {boolean} Returns true if the input is a valid URL, false otherwise.
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Create HTML img elements in a container for one or more image URLs.
 *
 * @param {string | string[]} images - The image URL(s) to be displayed.
 * @param {string} type - The type of image container ("gruppe" or "heim").
 * @returns {HTMLElement} The container element with image elements.
 */
function formatImage(images, type) {
    let imgPath;
    if (type === "gruppe") {
        imgPath = "gruppen";
    } else if (type === "heim") {
        imgPath = "heime";
    } else {
        throw new Error("Invalid image type. Supported types are 'gruppe' or 'heim'.");
    }

    if (!Array.isArray(images)) {
        images = [images];
    }

    const imageContainer = document.createElement("div");
    if (type === "gruppe") {
        imageContainer.className = "wappen-container";
    } else if (type === "heim") {
        imageContainer.className = "image-container";
    }

    imageContainer.append(
        ...images.map((imageUrl) => {
            const picture = document.createElement("picture");
            const img = document.createElement("img");

            if (isValidUrl(imageUrl)) {
                img.src = imageUrl; // Load directly if it's a valid URL
            } else {
                img.src = `./assets/img/${imgPath}/${imageUrl}`; // Search in assets if not a valid URL
            }

            picture.className = "image";
            picture.append(img);
            return picture;
        })
    );

    return imageContainer;
}




/**
 * Format parent names into a string with 'im' separator.
 *
 * @param {string | string[]} parents - The parent name(s) to format.
 * @returns {string} The formatted parent names joined with 'im'.
 */
function formatParent(parents) {
    if (!Array.isArray(parents)) {
        parents = [parents];
    }

    const parentContainer = parents.map(function (parent) {
        return parent;
    }).join(' im ');

    return parentContainer;
}



/**
 * Format website URLs into HTML anchor elements.
 *
 * @param {string | string[]} websites - The website URL(s) to format.
 * @returns {string} The formatted HTML anchor elements for the website URLs.
 */
function formatWebsite(websites) {
    if (!Array.isArray(websites)) {
        websites = [websites];
    }

    const websiteContainer = websites.map(function (website) {
        var websiteElement = `<div>&#x1F30D;&nbsp;&nbsp;<a href='${website}' target='_blank' rel='noopener noreferrer'>${website}</a></div>`;
        return websiteElement;
    }).join('');

    return websiteContainer;
}



/**
 * Create details for group popups/detail views based on layer properties.
 *
 * @param {Object} layer - The layer object containing feature properties.
 * @returns {string} Details for the group with HTML structure.
 */
function createDetailsGruppen(layer) {
    var item = layer.feature.properties;
    var details = `
        <div class="offcanvas-title">
            <h2>
                ${item.address["streetAddress"] ? `${item.address["streetAddress"]}<br>` : ""}
                ${item.address["postalCode"] ? `${item.address["postalCode"]} ` : ""}
                ${item.address["locality"]}
            </h2>
        </div>
        <div class="offcanvas-body">
    `;

    item.groups.forEach(element => {
        details += `
            <div class="group">
                <div class="group-header">
                    <h3>${element["name"]}</h3>
                    ${element["parent"] ? formatParent(element.parent) : ""}
                </div>
                ${element["imageWappen"] ? formatImage(element["imageWappen"], 'gruppe').outerHTML : ""}
    	        ${element["description"] ? `<div class="group-description">${element["description"]}</div>` : ""}
        `;

        if (element.contact || element.email || element.website) {
            details += `
                <div class="group-contact">
                    ${element.contact ? `<div>&#x1F464;&nbsp;&nbsp;${element.contact}</div>` : ""}
                    ${element.email ? `<div>&#x1F4E7;&nbsp;&nbsp;<a href='mailto:${element.email}' target='_blank' rel='noopener noreferrer'>${element.email}</a></div>` : ""}
                    ${element.website ? formatWebsite(element.website) : ""}
                </div>
            `;
        }

        details += `</div>`;
    });

    details += `</div>`;
    return details;
}

/**
 * Create details for residential locations based on layer properties.
 *
 * @param {Object} layer - The layer object containing feature properties.
 * @returns {string} Details for the residential location with HTML structure.
 */
function createDetailsHeime(layer) {
    var item = layer.feature.properties;
    var details = `
        <div class="offcanvas-title">
            <h2 class="heime">${item["name"] ?? ""}</h2>
            <h3 class="text-centered">${item["addressLocality"] ?? ""}</h3>
        </div>
        <div class="offcanvas-body"> 
            ${item["imageLogo"] ? `<p class="text-center"><img class="self-align-center heimlogo" src="${item["imageLogo"]}" alt="Logo von ${item["name"]}"></p>` : ""}
            <div class="detailDescription">${item["description"] ?? ""}</div>
            <address>
                ${item["contact"] ? `<div>${item["contact"]}</div>` : ""} 
                ${item["email"] ? `<div>&#x1F4E7;&nbsp;&nbsp;<a href='mailto:${item["email"]}' target='_blank' rel='noopener noreferrer'>${item["email"]}</a></div>` : ""} 
                ${item["website"] ? formatWebsite(item["website"]) : ""} 
                ${item["streetAddress"] ? `<div>&#x1F3E0;&nbsp;&nbsp;${item["streetAddress"]}, ${item["postalCode"]} ${item["addressLocality"]}</div>` : ""} 
            </address>  
            <div>${item["imagePicture"] ? formatImage(item["imagePicture"], 'heim').outerHTML : ""}</div>  
        </div>
    `;
    return details;
}
/**
 * Create custom markers for map features based on type.
 * 
 * @param {object} feature - The feature to create a marker for.
 * @param {string} type - The type of the feature ("gruppe" or "heim").
 * @returns {L.DivIcon} - The custom marker icon.
 */
function createMarkers(feature, type) {
    // Initialize variables for image paths and types
    var img_path;
    var img_generic;
    let scalinghack;

    // Check the type of feature to determine which marker to create
    if (type == "gruppe") {
        img_path = "gruppen";
        img_generic = "Bundeslilie_dynamic.svg";

        var image = null;
        if ((feature.properties.groups.length != 1) && (feature.properties.globalWappen != null)) {
            image = feature.properties.globalWappen;
        } else if ((feature.properties.groups.length == 1) && (feature.properties.groups[0].imageWappen != null)) {
            image = feature.properties.groups[0].imageWappen;
        }

        var markerColor = "var(--primary)";
        var markerTitle = [];

        feature.properties.groups.forEach(function (element, index) {
            if (element.parent != null) {
                var parentS = formatParent(element.parent);
                if (index == 0) {
                    markerTitle += element.name + ' - ' + parentS + ' (' + feature.properties.address.locality + ')';
                } else {
                    markerTitle += '\n' + element.name + ' - ' + parentS + ' (' + feature.properties.address.locality + ')';
                }
            } else {
                if (index == 0) {
                    markerTitle += element.name + ' (' + feature.properties.address.locality + ')';
                } else {
                    markerTitle += '\n' + element.name + ' (' + feature.properties.address.locality + ')';
                }
            }
        });
    } else if (type == "heim") {
        img_path = "heime";
        img_generic = "fa-house-solid.svg";
        scalinghack = true;
        var logo = feature.properties.imageLogo;
        var image = null;

        var markerColor = "#000000";
        var markerTitle = feature.properties.name;
    }

    if (image != null) {
        if (Array.isArray(image)) {
            image = image[0];
        }
        var markerIcon = (isValidUrl(image)) ? image : "./assets/img/" + img_path + "/" + image;
        var markerImageMargin = "7px 5px 5px 5px";
    } else {
        if (scalinghack == true) {
            var markerImageMargin = "8px 8px 8px 8px";
        }
        else {
            var markerImageMargin = "3px 3px 3px 3px";
        }
        var markerIcon = "./assets/img/" + img_generic;
    }

    var logoMarker = L.divIcon({
        className: "marker-div-icon",
        html: `<div class="marker-pin" style="--marker-color: ` + markerColor + `;" title="` + markerTitle + `"><div class="marker-pin-inner"><img class="marker-image" src="` + markerIcon + `" style="color-scheme: light; --markerImageMargin: ` + markerImageMargin + `;"></div></div>`,
        iconSize: [40, 40],
        iconAnchor: [25, 50]
    });

    return logoMarker;
}

/**
 *  * Define a tile layer for openstreet map.
 */
const openStreetMap = L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

/**
 * Define a tile layer for hiking trails map.
 */
const wanderwege = L.tileLayer("https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://hiking.waymarkedtrails.org/">Waymarked Trails</a>',
});

/**
 * Fetch the current year dynamically.
 */
const currYear = new Date().getFullYear();

/**
 * Define a tile layer for topplusOpen.
 */
const topplusOpen = L.tileLayer("https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png", {
    attribution: `Kartendarstellung und Präsentationsgraphiken: &copy; Bundesamt für Kartographie und Geodäsie (${currYear}), <a href="https://sgx.geodatenzentrum.de/web_public/gdz/datenquellen/Datenquellen_TopPlusOpen.html">Datenquellen</a>`,
});




/**
 * Initial latitude for the map center.
 * @type {number}
 */
const initialLatitude = 51.163375;

/**
 * Initial longitude for the map center.
 * @type {number}
 */
const initialLongitude = 10.447683;

/**
 * Initial zoom level for the map.
 * @type {number}
 */
const initialZoom = 6;

/**
 * Leaflet map initialization.
 */
const map = L.map("map", {
    center: [initialLatitude, initialLongitude],
    zoom: initialZoom,
    layers: [openStreetMap], // Assuming 'openStreetMap' is the base tile layer
});




/**
 * Define marker layers and controls for the Leaflet map.
 */
const markerLayers = L.markerClusterGroup.layerSupport({
    iconCreateFunction: function (cluster) {
        var clusterIcon = L.divIcon({
            className: "marker-div-icon",
            html: `<div class="marker-pin" style="--marker-color: var(--primary);"><div class="marker-pin-inner"><img class="marker-image" src="assets/img/Bundeslilie_dynamic.svg" style="color-scheme: light; --markerImageMargin: 3px 3px 3px 3px;"></div></div>`,
            iconSize: [40, 40],
            iconAnchor: [25, 50]
        });
        return clusterIcon;
    },
    maxClusterRadius: 0, // Disable clustering
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: true,
    animate: false,
});

/**
 * Define base and overlay maps for layer control.
 */
const baseMaps = {
    "OpenStreetMap": openStreetMap,
    "TopPlusOpen": topplusOpen,
};

const overlayMaps = {
    "Wanderwege": wanderwege,
};

const layers = ['gruppen', 'heime'];

/**
 * Initialize layer control for base and overlay maps.
 */
const control = L.control.layers(baseMaps, overlayMaps, {
    hideSingleBase: true,
    sortLayers: true,
    collapsed: true,
    position: "topright",
}).addTo(map);

/**
 * Set the position of the zoom control on the map.
 */
map.zoomControl.setPosition('topleft');

/**
 * Initialize the reset view control to reset map view to initial settings.
 */
L.control.resetView({
    position: "topleft",
    title: "Zoom zurücksetzen",
    latlng: L.latLng([initialLatitude, initialLongitude]),
    zoom: initialZoom,
}).addTo(map);


/**
 * Initialize the Leaflet search control for markerLayers.
 */
const searchControl = new L.Control.Search({
    layer: markerLayers,
    initial: false,
    collapsed: true,
    minLength: 1,
    propertyName: 'searchItem',
    textPlaceholder: 'Suche in aktiven Ebenen',
    textErr: 'Nicht gefunden',
    zoom: '15',
    firstTipSubmit: true,
    position: "topleft",
    autoCollapse: true,
});

/**
 * Event listener for the 'search:locationfound' event.
 */
searchControl.on('search:locationfound', function (event) {
    let searchValue;
    if (event.layer.feature.properties.addressLocality !== null) {
        searchValue = "heime";
    } else {
        searchValue = "gruppen";
    }

    if (event.layer instanceof L.Marker) {
        const canvasElement = document.getElementById("detailPane");
        canvasElement.classList.add("show");
        const canvasBodyElement = document.getElementById("detailPaneBody");
        // Uncomment if needed: const latLng = event.layer.feature.geometry.coordinates;
        // Uncomment if needed: map.setView([latLng[1], latLng[0]], 17);
        if (searchValue === "gruppen") {
            canvasBodyElement.innerHTML = createDetailsGruppen(event.layer);
        } else if (searchValue === "heime") {
            canvasBodyElement.innerHTML = createDetailsHeime(event.layer);
        }
    }
});

/**
 * create each datalayer.
 */
layers.forEach(createDataLayer)

/**
 * Create a data layer from GeoJSON, customize markers, and handle interactions.
 *
 * @param {string} value - The value to fetch GeoJSON data and create the data layer.
 */
function createDataLayer(value) {
    const file = `./assets/geo/${value}.geojson`;

    fetch(file)
        .then((response) => response.json())
        .then((json) => {
            const dataLayer = L.geoJSON("", {
                onEachFeature: function (feature, layer) {
                    let searchItem = "";
                    if (layer.feature.properties.groups) {
                        layer.feature.properties.groups.forEach(function (element, index) {
                            // Logic for combining label and address for search item
                            // ...
                        });
                    } else {
                        searchItem = `<strong>${layer.feature.properties.addressLocality}</strong><br>${layer.feature.properties.name}`;
                    }
                    layer.feature.properties.searchItem = searchItem;
                },
                pointToLayer: function (feature, latlng) {
                    let logoMarker;
                    if (value === "gruppen") {
                        logoMarker = createMarkers(feature, 'gruppe');
                    } else if (value === "heime") {
                        logoMarker = createMarkers(feature, 'heim');
                    }
                    return L.marker(latlng, { icon: logoMarker });
                },
            });

            // Add the data layer to the map and controls
            dataLayer.addData(json);

            if (value === "gruppen") {
                control.addOverlay(dataLayer, "Gruppen");
                markerLayers.addLayer(dataLayer);
            } else if (value === "heime") {
                control.addOverlay(dataLayer, "Heime");
                markerLayers.checkIn(dataLayer);
            }

            dataLayer.on("click", function (event) {
                if (event.layer instanceof L.Marker) {
                    const canvasElement = document.getElementById("detailPane");
                    canvasElement.classList.add("show");
                    const canvasBodyElement = document.getElementById("detailPaneBody");
                    // Uncomment if needed: const latLng = event.layer.feature.geometry.coordinates;
                    // Uncomment if needed: map.setView([latLng[1], latLng[0]], 17);
                    if (value === "gruppen") {
                        canvasBodyElement.innerHTML = createDetailsGruppen(event.layer);
                    } else if (value === "heime") {
                        canvasBodyElement.innerHTML = createDetailsHeime(event.layer);
                    }
                }
            });
        });
}
/**
 * Close the off-canvas element for details.
 */
function closeOffcanvas() {
    document.getElementById("detailPane").classList.remove("show");
}

/**
 * Handle the map click event to close the off-canvas element.
 */
map.on("click", function () {
    closeOffcanvas();
});

/**
 * Add search control after data layers are loaded.
 */
map.addControl(searchControl);

/**
 * Display coordinates on right-click.
 */
map.on("contextmenu", function (event) {
    alert(
        "Coordinates of the selected point: \n \n" +
        event.latlng.lng.toString() + ", " + event.latlng.lat.toString()
    );
});

/**
 * Adjust the map size when the container size changes.
 */
new ResizeObserver(() => {
    map.invalidateSize();
}).observe(document.getElementById("map"));