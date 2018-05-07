$(function () {
    var handleTab = {
        openTab: function (view) {
            if (view == "mapView") {
                // if(this.map === undefined) {
                var that = this;
                this.shpfile;
                this.map = this.openMapView();
                $('#chartbutton').removeClass('active');
                $('#mapbutton').addClass('active');
                $.ajax({
                    type: "GET",
                    url: '/getSentiment',
                    contentType: 'application/json',
                    success: function (response) {
                        console.log(response);
                        // blob = new Blob([response], {type: "octet/stream"});
                        // var shpfile = new L.Shapefile(fr.readAsArrayBuffer(reponse), {
                        that.info = L.control();
                        that.shpfile = new L.Shapefile('public/javascripts/vic_shapefile.zip', {
                            onEachFeature: function (feature, layer) {
                                if (feature.properties) {
                                    layer.bindPopup(Object.keys(feature.properties).map(function (k) {
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
                            style: function(){
                                return {
                                    fillColor: that.getColor(Math.floor(Math.random() * 1000) + 1),
                                    weight: 1,
                                    opacity: 1,
                                    color: 'black',
                                    dashArray: '3',
                                    fillOpacity: 0.7
                                };
                            }
                        });
                        //
                        that.shpfile.addTo(that.map);
                        that.info.onAdd = function (map) {
                            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
                            this.update();
                            return this._div;
                        };

                        // method that we will use to update the control based on feature properties passed
                        that.info.update = function (props) {
                            this._div.innerHTML = '<h4>Name of the Suburb</h4>' + (props ?
                                '<b>' + props.sa2_name16 + '</b><br />' + 'Happy people :-)'
                                : 'Hover over a suburb');
                        };

                        that.info.addTo(that.map);

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
                            that.info.update(layer.feature.properties);
                        }

                        function resetHighlight(e){
                            that.shpfile.resetStyle(e.target);
                            that.info.update();
                        }

                        that.addLegend();

                    },
                    error: function (response) {
                        console.log(response);
                    }
                });
            } else {
                if (this.map !== undefined) {
                    this.map.remove();
                }
                this.openChartView();
                $('#mapbutton').removeClass('active');
                $('#chartbutton').addClass('active');
            }
        },
        openMapView: function () {
            var i, tabcontent, tablinks;
            var shpfile;
            var styleMap;
            var that = this;

            var mymap = L.map('mapid').setView([-37.814, 144.96332], 10);
            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox.streets',
                accessToken: 'pk.eyJ1IjoibWFwYm94YW50OTIiLCJhIjoiY2pnbnNxMHM5MTg1cDMzcm05b3h5a3dyZCJ9.9RFYeawcSEckqpspzzhKxQ'
            }).addTo(mymap);
            return mymap;
        },
        openChartView: function () {
            // alert('hello');
        },
        getColor: function (d) {
            return d > 1000 ? '#7a0177' :
                d > 500 ? '#ae017e' :
                    d > 200 ? '#dd3497' :
                        d > 100 ? '#f768a1' :
                            d > 50 ? '#fa9fb5' :
                                d > 20 ? '#fcc5c0' :
                                    d > 10 ? '#fde0dd' :
                                        '#fff7f3';
        },
        addLegend: function(){
            var that = this;
            this.legend = L.control({position: 'bottomright'});
            this.legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend'),
                    grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                    labels = [];
                // loop through our density intervals and generate a label with a colored square for each interval
                for (var i = 0; i < grades.length; i++) {
                    div.innerHTML +=
                        '<i style="background:' + that.getColor(grades[i] + 1) + '"></i> ' +
                        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                }
                return div;
            };
            this.legend.addTo(this.map);
        },
        refreshContent: function(){
            var selectedContent = $('.comboBox').val();
            alert(selectedContent);
        }
    };

    $('.tablinks').on('click', function (e) {
        var name = e.target.getAttribute('data-val');
        handleTab.openTab(name);
    });
    handleTab.openTab("mapView");
    $('#viewContent').on('click', function (e) {
        handleTab.refreshContent();
    });
});







