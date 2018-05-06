function openTab(evt, name) {
    // Declare all variables
    var i, tabcontent, tablinks;
    var mymap = L.map('mapid').setView([-37.815,144.946], 13);
    // var mymap = L.map('mapid').setView([39.74739, -105], 4);
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
    var fr = new FileReader();
    var blob = new Blob('public/javascripts/shapefiles.zip');
    console.log(blob);
    var buf = fr.readAsArrayBuffer('public/javascripts/shapefiles.zip');
    var shpfile = new L.Shapefile(buf, {
        onEachFeature: function(feature, layer) {
            if (feature.properties) {
                layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                    return k + ": " + feature.properties[k];
                }).join("<br />"), {
                    maxHeight: 200
                });
            }
        }
    });

    shpfile.addTo(mymap);
    // shp("public/javascripts/shapefiles.zip").then(function(geojson){
    //     //do something with your geojson
    //     console.log(geojson)
    // });

    // var geojsonFeature1 = {
    //     "type": "Feature",
    //     "properties": {
    //         "name": "Melb Insta post",
    //         "amenity": "Something",
    //         "popupContent": "This is Abbotsford region!",
    //         "color":"yellow"
    //     },
    //     "geometry": {
    //         "type": "Polygon",
    //         "coordinates": [
    //             [
    //                 [
    //                     144.889476128,
    //                     -37.753934856
    //                 ],
    //                 [
    //                     144.9073224,
    //                     -37.755985044
    //                 ],
    //                 [
    //                     144.90640512,
    //                     -37.760597279
    //                 ],
    //                 [
    //                     144.903815392,
    //                     -37.759943045
    //                 ],
    //                 [
    //                     144.905010016,
    //                     -37.761700009
    //                 ],
    //                 [
    //                     144.904835872,
    //                     -37.762590506
    //                 ],
    //                 [
    //                     144.903335808,
    //                     -37.762409724
    //                 ],
    //                 [
    //                     144.903231008,
    //                     -37.762948999
    //                 ],
    //                 [
    //                     144.903966816,
    //                     -37.763380419
    //                 ],
    //                 [
    //                     144.903563648,
    //                     -37.764882545
    //                 ],
    //                 [
    //                     144.902198176,
    //                     -37.764734582
    //                 ],
    //                 [
    //                     144.901579744,
    //                     -37.765398473
    //                 ],
    //                 [
    //                     144.89816928,
    //                     -37.76465346
    //                 ],
    //                 [
    //                     144.89371936,
    //                     -37.765740482
    //                 ],
    //                 [
    //                     144.888945408,
    //                     -37.761904471
    //                 ],
    //                 [
    //                     144.889965376,
    //                     -37.756715035
    //                 ],
    //                 [
    //                     144.889083712,
    //                     -37.755558452
    //                 ],
    //                 [
    //                     144.889476128,
    //                     -37.753934856
    //                 ]
    //             ]
    //         ]
    //     }
    // }
    L.geoJSON(geojsonFeature, {
        style: function (feature) {
            return {color: feature.properties.color};
        }
    }).bindPopup(function (layer) {
        return layer.feature.properties.popupContent;
    }).addTo(mymap);

    // L.geoJSON(geojsonFeature1).addTo(mymap);
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







