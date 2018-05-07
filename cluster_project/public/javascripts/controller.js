function openTab(evt, name) {
    // Declare all variables
    var i, tabcontent, tablinks;
    var mymap = L.map('mapid').setView([-37.814, 144.96332], 10);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
      accessToken: 'pk.eyJ1IjoibWFwYm94YW50OTIiLCJhIjoiY2pnbnNxMHM5MTg1cDMzcm05b3h5a3dyZCJ9.9RFYeawcSEckqpspzzhKxQ'
    }).addTo(mymap);

    var shpfile = new L.Shapefile('public/javascripts/Shapefile.zip', {
        onEachFeature: function(feature, layer) {
            if (feature.properties) {
                layer.bindPopup(Object.keys(feature.properties).map(function(k) {
                    return k + ": " + feature.properties[k];
                }).join("<br />"), {
                    maxHeight: 200
                });
            }
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });
        },
        style: style
    });

    shpfile.addTo(mymap);

    function getColor(d) {
        return d > 1000 ? '#7a0177' :
            d > 500  ? '#ae017e' :
            d > 200  ? '#dd3497' :
            d > 100  ? '#f768a1' :
            d > 50   ? '#fa9fb5' :
            d > 20   ? '#fcc5c0' :
            d > 10   ? '#fde0dd' :
            '#fff7f3';
    }

    function style(feature) {
        return {
            fillColor: getColor(Math.floor(Math.random() * 1000) + 1),
            weight: 1,
            opacity: 1,
            color: 'black',
            dashArray: '3',
            fillOpacity: 0.7
        };
    }

    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 3,
            color: 'black',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
        shpfile.resetStyle(e.target);
        info.update();
    }

    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

// method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>Name of the Suburb</h4>' +  (props ?
            '<b>' + props.sa2_name16 + '</b><br />' + 'Happy people :-)'
            : 'Hover over a suburb');
    };

    info.addTo(mymap);


    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 20, 50, 100, 200, 500, 1000],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(mymap);



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







