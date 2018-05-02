function openTab(evt, name) {
    // Declare all variables
    var i, tabcontent, tablinks;
    var mymap = L.map('mapid').setView([-37.815,144.946], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoibWFwYm94YW50OTIiLCJhIjoiY2pnbnNxMHM5MTg1cDMzcm05b3h5a3dyZCJ9.9RFYeawcSEckqpspzzhKxQ'
    }).addTo(mymap);

    var geojsonFeature = {
        "type": "Feature",
        "properties": {
            "name": "Melb Insta post",
            "amenity": "Something",
            "popupContent": "This is where an Instagram post came from!",
            "color":"green"
        },
        "geometry":{ "type": "Polygon", "coordinates": [ [ [ 144.7, -37.5 ], [ 144.85, -37.5 ], [ 144.85, -37.65 ], [ 144.7, -37.65 ], [ 144.7, -37.5 ] ] ] }

    };
    L.geoJSON(geojsonFeature, {
        style: function (feature) {
            return {color: feature.properties.color};
        }
    }).bindPopup(function (layer) {
        return layer.feature.properties.popupContent;
    }).addTo(mymap);

    // L.geoJSON(geojsonFeature).addTo(mymap);
    // L.marker([-37.823, 144.950]).addTo(mymap)
    //     .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
    //     .openPopup();
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(name).style.display = "block";
    evt.currentTarget.className += " active";
}

function refreshContent() {
    var selectedContent = $('.comboBox').val();
    alert(selectedContent);
}







