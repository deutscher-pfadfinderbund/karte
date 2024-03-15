function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Erstelle die IMG HTML Elemente in einem Container für eine oder mehrere Bild URLs.
 *
 * @param  {string | string[]} wappen
 * @return {HTMLElement}
 */
function formatImage(image, type) {
    if (type == "gruppe") {
        var img_path = "gruppen";
    } else if (type == "heim") {
        var img_path = "heime";
    }

    if (!Array.isArray(image)) {
        image = [image];
    }

    const imageContainer = document.createElement("div");
    if (type == "gruppe") {
    imageContainer.className = "wappen-container";
    } else if (type == "heim") {
    imageContainer.className = "image-container";
    }
    imageContainer.append(
        ...image.map((url) => {
            const picture = document.createElement("picture");
            const img = document.createElement("img");
            if (isValidUrl(url) == true) {
                //wenn FQDN... dann lade direkt
                img.src = url;
            } else {
                // wenn kein FQDN dann Suche in assets
                img.src = "./assets/img/" + img_path + "/" + url;
            }
            picture.className = "image";
            picture.append(img);
            return picture;
        })
    );
    return imageContainer;
}




function formatParent(parent) {
    
    if (!Array.isArray(parent)) {
        parent = [parent];
    }

    const parentContainer = parent.map(function (parent) {
        return '<div>' + parent + '</div>';
    }).join('')
    return parentContainer;
    };

function formatParentS(parent) {
    
        if (!Array.isArray(parent)) {
            parent = [parent];
        }
    
        const parentContainer = parent.map(function (parent) {
            return parent;
        }).join(' - ')
        return parentContainer;
        };

        
function formatWebsite(website) {

    if (!Array.isArray(website)) {
        website = [website];
    }

    const websiteContainer = website.map(function (website) {
        var websiteElement = "<div>&#x1F30D;&nbsp;&nbsp;<a href='" + website + "' target='_blank' rel='noopener noreferrer'>"+ website + "</a></div>";
        return websiteElement;
    }).join('')


    return websiteContainer;
    };

// Erstelle die Details für die Popups/Detailansichten

function createDetailsGruppen(layer) {

    var item = layer.feature.properties;

    var details = `
            <div class="offcanvas-header">
                <img src="./assets/img/fa-users-solid.svg" class="fs-1_2" aria-title="Gruppe">
            </div>
            <div class="offcanvas-title">
                <h2>${item["label"] ?? ""}</h2>
                <div class="text-centered">${item["addressLocality"] ?? ""}</div>
            </div>
            <div class="offcanvas-body"> 
                <div class="detailWappen">${item["imageWappen"] ? formatImage(item["imageWappen"], ['gruppe']).outerHTML : ""}</div>
                <div class="detailDescription">${item["description"] ?? ""}</div>
                <hr>
                <address>
                        ${item["contact"] ? `<div>&#x1F464;&nbsp;&nbsp;${item["contact"]}</div>` : ""} 
                        ${item["email"] ? `<div>&#x1F4E7;&nbsp;&nbsp;<a href='mailto:${item["email"]}' target='_blank' rel='noopener noreferrer'>${item["email"]}</a></div>` : ""} 
                        ${item["website"] ? formatWebsite(item["website"]) : ""} 
                        ${item["streetAddress"] ? `<div>&#x1F3E0;&nbsp;&nbsp;${item["streetAddress"]}, ${item["postalCode"]} ${item["addressLocality"]}</div>` : ""} 
                </address>   
                ${item["parent"] ? `<h3>Übergeordnete Gliederung(en)</h3><div>${formatParent(item["parent"])}</h3>` : ""} 
            </div>
        `;

    return details;
}

function createDetailsHeime(layer) {

    var item = layer.feature.properties;

    var details = `
        <div class="offcanvas-header">
            <img src="./assets/img/fa-house-solid.svg" class="fs-1_2" aria-title="Gruppe">
        </div>
        <div class="offcanvas-title">
            <h2 class="text-center">${item["label"] ?? ""}</h2>
            <h3 class="text-center">${item["addressLocality"] ?? ""}</h3>
        </div>
        <div class="offcanvas-body"> 
            ${item["imageLogo"] ? `<p class="text-center"><img class="self-align-center heimlogo" src="${item["imageLogo"]}" alt="Logo von ${item["label"]}"</p>` : ""}
            <div class="detailWappen">${item["imageWappen"] ? formatImage(item["imageWappen"], ['gruppe']).outerHTML : ""}</div>
            <div class="detailDescription">${item["description"] ?? ""}</div>
           <hr>
            <address">
                        ${item["contact"] ? `<div>${item["contact"]}</div>` : ""} 
                        ${item["email"] ? `<div>&#x1F4E7;&nbsp;&nbsp;<a href='mailto:${item["email"]}' target='_blank' rel='noopener noreferrer'>${item["email"]}</a></div>` : ""} 
                        ${item["website"] ? formatWebsite(item["website"]) : ""} 
                       ${item["streetAddress"] ? `<div>&#x1F3E0;&nbsp;&nbsp;${item["streetAddress"]}, ${item["postalCode"]} ${item["addressLocality"]}</div>` : ""} 
            </address>  
            <hr>
            <div>${item["imagePicture"] ? formatImage(item["imagePicture"], ['heim']).outerHTML : ""}</div>  
        </div>
    `;

    return details;
}

// Erstellung der eigentlichen Marker
function createMarkers(feature, type) {
    if (type == "gruppe") {
        var img_path = "gruppen";
        var img_generic = "bundeslilie.svg";
        var logo = feature.properties.imageLogo;
        var image = feature.properties.imageWappen;
        var markerColor = "var(--primary)"
    } else if (type == "heim") {
        var img_path = "heime";
        var img_generic = "fa-house-solid.svg";
        var scalinghack = true;
        var logo = feature.properties.imageLogo;
        var image = false;
        var markerColor = "#000000"
    }

    /* if (feature.properties.imageLogo && !Array.isArray(feature.properties.imageLogo)) {
         if (isValidUrl(feature.properties.imageLogo)) {
             var markerIcon = feature.properties.imageLogo;
           
         } else {
             var markerIcon = "./assets/img/" + img_path + "/" + logo;
         }
     } else if (image && !Array.isArray(image)) {
         if (isValidUrl(image)) {
             var markerIcon = image;
         } else {
             var markerIcon =  "./assets/img/" + img_path + "/" + image;
         }
     } else {
         var markerIcon =  "./assets/img/" + img_generic;
     }*/

    if (image) {
        if (!Array.isArray(image)) { // Bei mehreren Bildern wird im Marker nur das erste angezeigt.
            image = image;
        } else {
            image = image[0];
        }
        if (isValidUrl(image)) {
            var markerIcon = image;
        } else {
            var markerIcon = "./assets/img/" + img_path + "/" + image;
        }
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
        html: `<div class="marker-pin" style="--marker-color: ` + markerColor + `;"  title="` + feature.properties.label + `"><div class="marker-pin-inner"><img class="marker-image" src="` + markerIcon + `" style="--markerImageMargin: ` + markerImageMargin + `;"></div></div>`,
        iconSize: [40, 40],
        iconAnchor: [25, 50]
    });

    return logoMarker;
}


// Definition der Karte und Datenquellen

// Externe Tile-Server

const open_street_map = L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

const wanderwege = L.tileLayer("https://tile.waymarkedtrails.org/hiking/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://hiking.waymarkedtrails.org/">Waymarked Trails</a>',
});

// Karte initialisieren und Steuerelemente hinzufügen

const initialLatitude = 51.163375;
const initialLongitude = 10.447683;
const initialZoom = 6;

const map = L.map("map", {
    center: [initialLatitude, initialLongitude],
    zoom: initialZoom,
    layers: [open_street_map],
});

const control = L.control.layers(
    { OpenStreetMap: open_street_map },
    { Wanderwege: wanderwege },
    {
        hideSingleBase: true,
        sortLayers: true,
        collapsed: false,
    }
);

map.addControl(control);

// Datenlayer



const markerLayers = L.markerClusterGroup.layerSupport({
    iconCreateFunction: function(cluster) {
        var clusterIcon = L.divIcon({
        className: "marker-div-icon",
        html: `<div class="marker-pin" style="--marker-color: var(--primary);" ><div class="marker-pin-inner"><img class="marker-image" src="assets/img/bundeslilie.svg" style="--markerImageMargin: 3px 3px 3px 3px;"></div></div>`,
        iconSize: [40, 40],
        iconAnchor: [25, 50]
        });
        return clusterIcon;
    	},
    maxClusterRadius: 5,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: true,
    animate:false,
    
});





/*markerLayers.on("clusterclick", function (a) {
    a.layer.zoomToBounds({ padding: [20, 20] });
});
*/
map.addLayer(markerLayers);

const layers = ['gruppen', 'heime'];

layers.forEach(createDataLayer)

function createDataLayer(value, index, array) {

    const file = "./assets/geo/" + value + ".geojson";

    fetch(file)
        .then((response) => response.json())
        .then((json) => {
            var dataLayer = L.geoJSON("", {
                // Combine Label and AddressLocality for search function
                onEachFeature: function (feature, layer) {
                    if(layer.feature.properties.parent) {
                        var parentS = formatParentS(layer.feature.properties.parent)
                        layer.feature.properties.searchItem = layer.feature.properties.label + ' - ' + parentS + ' (' + layer.feature.properties.addressLocality + ')';
                    }
                    else {
                        layer.feature.properties.searchItem = layer.feature.properties.label + ' (' + layer.feature.properties.addressLocality + ')';
                    }
                },
                // Create the Markers
                pointToLayer: function (feature, latlng) {
                    if (value == "gruppen") {
                        var logoMarker = createMarkers(feature, ['gruppe']);
                    } else if (value == "heime") {
                        var logoMarker = createMarkers(feature, ['heim']);
                    }

                    return L.marker(latlng, { icon: logoMarker });
                },
            });
            // Add the Layer to map and controls
            dataLayer.addData(json);

            if (value == "gruppen") {
                //dataLayer.bindPopup(createDetailsGruppen);
                control.addOverlay(dataLayer, "Gruppen");
                markerLayers.addLayer(dataLayer);
            } else if (value == "heime") {
                // dataLayer.bindPopup(createDetailsHeime);
                control.addOverlay(dataLayer, "Heime");
                markerLayers.checkIn(dataLayer);
            }

            dataLayer.on("click", function (e) {
                if (e.layer instanceof L.Marker) {
                    var canvasElement = document.getElementById("detailPane");
                    var mapElement = document.getElementById("map");
                    canvasElement.classList.add("offcanvas-show");
                    mapElement.classList.add("map-offcanvas");
                    var canvasBodyElement = document.getElementById("detailPaneBody");
                    //var latlang = e.layer.feature.geometry.coordinates;
                    //map.setView([latlang[1], latlang[0]], 17);
                    if (value == "gruppen") {
                        canvasBodyElement.innerHTML = createDetailsGruppen(e.layer);
                    } else if (value == "heime") {
                        canvasBodyElement.innerHTML = createDetailsHeime(e.layer);
                    }

                }
            });
        });
}

markerLayers.addTo(map);


function closeOffcanvas() {
    var canvasElement = document.getElementById("detailPane");
    var mapElement = document.getElementById("map");
    var canvasBodyElement = document.getElementById("detailPaneBody");
    canvasElement.classList.remove("offcanvas-show");
    mapElement.classList.remove("map-offcanvas");
    canvasBodyElement.innerHTML = "";
};


const detailPaneClose = document.getElementById("detailPaneClose");


detailPaneClose.addEventListener("click", function (event) {
    event.preventDefault();
    closeOffcanvas();
});

map.on("click", function (event) {
    closeOffcanvas();
});


// Karteansicht zurücksetzen

L.control.resetView({
    position: "topleft",
    title: "Zoom zurücksetzen",
    latlng: L.latLng([initialLatitude, initialLongitude]),
    zoom: initialZoom,
}).addTo(map);


// Suchfunktion hinzufügen nachdem die Datenlayer geladen sind
var search = new L.Control.Search({
    layer: markerLayers,
    initial: false,
    collapsed: true,
    minLength: 1,
    propertyName: 'searchItem',
    textPlaceholder: 'Suche in aktiven Ebenen',
    textErr: 'Nicht gefunden',
    zoom: '19',
    firstTipSubmit: true,
});

map.addControl(search);

// Einfache Koordinatenanzeige bei Rechtscklick 

map.on("contextmenu", function (event) {
    alert(
        "Die Koordinaten des gewählten Punktes sind: \n \n" +
        event.latlng.lng.toString() + ", " + event.latlng.lat.toString()
    );
});



