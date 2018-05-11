$(function () {
    var handleTab = {
        openTab: function (view) {
            var tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }

            document.getElementById(view).style.display = "block";
            if (view == "mapView") {
                this.keymap = {
                    "tot_tot": "Total Income",
                    "M0_tot_p_": "Number of Immigrants",
                    "M0_prtc_t": "Percentage of family areas in suburb",
                    "M0_hl_p_h": "Number of Homeless people",
                    "M0_p_tot": "Total occupation",
                    "sa2_name16": "Suburb"
                };
                var that = this;
                this.shpfile;
                this.map = this.response == undefined ? this.openMapView() : this.map;
                $('#chartbutton').removeClass('active');
                $('#mapbutton').addClass('active');
                var sum_Income = 0;
                var count = 0;
                that.averageIncome = 1211.465367965368;
                that.averageHomeless = 53.673;
                that.averageOccupation = 5896.941558441558;
                that.averageImmigrants = 12811.867965367965;
                this.incomeMarker = L.AwesomeMarkers.icon({
                    icon: 'dollar-sign',
                    markerColor: 'black',
                    prefix: 'fa'
                });
                this.homelessMarker = L.AwesomeMarkers.icon({
                    markerColor: 'purple',
                    prefix: 'fa'
                });
                this.occupationMarker = L.AwesomeMarkers.icon({
                    icon: 'briefcase',
                    markerColor: 'blue',
                    prefix: 'fa'
                });
                this.immigrantMarker = L.AwesomeMarkers.icon({
                    icon: 'users',
                    markerColor: 'yellow',
                    prefix: 'fa'
                });
                if(!this.response) {
                    $("body").addClass("loading");
                    $.ajax({
                        type: "GET",
                        url: '/getSentiment',
                        contentType: 'application/json',
                        success: function (response) {
                            if(response.type !== undefined && response.type==="db"){
                                $("#error").text(response.message);
                                $("#viewContent").attr('disabled','true');
                                return;
                            }
                            that.response = response;
                            that.incomeVsSentiment = new Array();
                            that.occupationVsSentiment = new Array();
                            that.immigrantsVsSentiment = new Array();
                            that.homelessPeopleVsSentiment = new Array();
                            that.info = L.control();

                            that.calculateAndFindMinMaxRange(response);
                            that.shpfile = new L.Shapefile('public/javascripts/vic_shapefile.zip', {
                                onEachFeature: function (feature, layer) {
                                    if (feature.properties) {
                                        var suburbmapdata = getInfoFrom(Object, feature).join(" <br/>");
                                        layer.bindPopup(suburbmapdata);
                                        if (feature.properties.sentimentDensity) {
                                            that.incomeVsSentiment.push({x:feature.properties.sentimentDensity, y:feature.properties.tot_tot});
                                            that.occupationVsSentiment.push({x:feature.properties.sentimentDensity, y:feature.properties.M0_p_tot});
                                            that.immigrantsVsSentiment.push({x:feature.properties.sentimentDensity, y:feature.properties.M0_tot_p_});
                                            that.homelessPeopleVsSentiment.push({x:feature.properties.sentimentDensity, y:feature.properties.M0_hl_p_h});
                                        }
                                    }
                                    layer.on({
                                        mouseover: highlightFeature,
                                        mouseout: resetHighlight
                                    });
                                },
                                style: function (feature) {
                                    if (feature.properties.sentimentDensity === undefined) {
                                        feature.properties.sentimentDensity = that.getSentimentDensity(feature.properties.sa2_main16);
                                    }

                                    return {
                                        fillColor: that.getColor(feature.properties.sentimentDensity),
                                        weight: 1,
                                        opacity: 1,
                                        color: 'black',
                                        dashArray: '3',
                                        fillOpacity: 0.7
                                    };
                                }
                            });
                            that.shpfile.addTo(that.map);
                            that.info.onAdd = function (map) {
                                this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
                                this.update();
                                return this._div;
                            };

                            // method that we will use to update the control based on feature properties passed
                            that.info.update = function (props) {
                                if (props !== undefined) {
                                    var sentimentText = that.getSentimentText(props.sentimentDensity);
                                }
                                this._div.innerHTML = '<h4>Name of the Suburb</h4>' + (props ?
                                    '<b>' + props.sa2_name16 + '</b><br />' + sentimentText + ''
                                    : 'Hover over a suburb');
                            };

                            that.info.addTo(that.map);

                            function getInfoFrom(object, feature) {
                                var displayRequiredData = [];
                                object.keys(feature.properties).map(function (k) {
                                    if (isNaN(parseInt(k))) {
                                        key = k;
                                    } else {
                                        key = k.substring(parseInt(k).toString().length);
                                        feature.properties[key] = feature.properties[k];
                                        delete k;
                                    }
                                    if (that.keymap[key] !== undefined && (!isNaN(feature.properties[key]) || key === "sa2_name16")) {
                                        displayRequiredData.push(that.keymap[key] + ": " + feature.properties[key]);
                                    }
                                });
                                return displayRequiredData;
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
                                that.info.update(layer.feature.properties);
                                var popup = L.popup()
                                    .setLatLng(e.latlng)
                                    .setContent(that.getSentimentText(e.target.feature.properties.sentimentDensity))
                                    .openOn(that.map);
                            }

                            function resetHighlight(e) {
                                that.shpfile.resetStyle(e.target);
                                that.info.update();
                            }

                            that.addLegend();
                            $("body").removeClass("loading");
                        },
                        error: function (response) {
                            $("#error").text("Error: Incorrect request received, please check query again");
                            $("#viewContent").attr('disabled','true');
                            this.map.remove();
                            $("body").removeClass("loading");
                        }
                    });
                }

            } else {
                $("#chartComboBox").val($("#chartComboBox option:first").val());
                this.openChartView('incomeChart',handleTab.incomeVsSentiment.sort(function (a, b) {
                    return a.x - b.x
                }), 'Total Income of people', 'Income of people Vs Sentiments', 300);

                $('#homelessPeopleChart').hide();
                $('#immigrantChart').hide();
                $('#occupationChart').hide();
                $('#incomeChart').show();
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
        getColor: function (d) {
            var range = (this.max - this.min)/5;
            return d > this.max-range ? '#05C804' :
                d > this.max-(2*range) ? '#71D503' :
                    d > this.max-(3*range) ? '#E3DB02' :
                        d > this.max-(4*range) ? '#F06D01' :
                            d > this.max-(5*range) ? '#FE0010' :
                                            '#A9A9A9';
        },
        addLegend: function () {
            var that = this;
            this.legend = L.control({position: 'bottomright'});
            this.legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend'),
                    range = (that.max - that.min)/5;
                    grades = [that.min, that.max-(4*range), that.max-(3*range),
                        that.max-(2*range), that.max-range, that.max],
                    labels = [];
                // loop through our density intervals and generate a label with a colored square for each interval
                for (var i = 0; i < grades.length - 1; i++) {
                    div.innerHTML +=
                        '<i style="background:' + that.getColor(grades[i] + 0.01) + ' "></i> ' +
                        grades[i].toFixed(2) + ' - ' + grades[i + 1].toFixed(2) + '<br>';
                }
                return div;
            };
            this.legend.addTo(this.map);
        },
        getSentimentDensity: function (suburbId) {
            var sentimentDensity;
            var that = this;
            this.response.rows.forEach(function (doc) {
                if (doc.key == suburbId) {
                    sentimentDensity = doc.sentimentData;
                }
            });
            return sentimentDensity;
        },
        getSentimentText: function (sentiment) {
            var d = sentiment;
            if (d !== undefined) {
                var range = (this.max - this.min)/5;
                return d > this.max-range ? 'Happy people ' + "<i class='fa fa-smile popupicon'>" :
                    d > this.max-(2*range) ? "<i class='fa fa-smile popupicon'>" :
                        d > this.max-(3*range) ? "<i class='fa fa-meh popupicon'>" :
                            d > this.max-(4*range) ? "<i class='fa fa-frown popupicon'>" :
                                d > this.max-(5*range) ? 'Unhappy people ' + "<i class='fa fa-frown popupicon'>"  :
                                    'Unknown';
            } else
                return 'No Sentiment available'
        },
        addMapPoints: function () {
            var that = this;
            var avgIncome = that.averageIncome;
            this.richSuburbMarkers = [];
            this.homelessSuburbMarkers = [];
            this.occupationSuburbMarkers = [];
            this.immigrantSuburbMarkers = [];
            this.map.eachLayer(function (layer) {
                if (layer.feature && layer.feature.properties.tot_tot > (avgIncome * 1.9)) {
                    that.richSuburbMarkers.push(L.marker([layer._latlngs[0][0].lat, layer._latlngs[0][0].lng],
                        {icon: that.incomeMarker}).bindPopup("Avg weekly Income:"+layer.feature.properties.tot_tot));
                }
                if (layer.feature && layer.feature.properties.M0_hl_p_h > (that.averageHomeless * 3.5)) {
                    that.homelessSuburbMarkers.push(L.marker([layer._latlngs[0][0].lat, layer._latlngs[0][0].lng],
                        {icon: that.homelessMarker}).bindPopup("Number of Homeless people:"+ layer.feature.properties.M0_hl_p_h));
                }
                if (layer.feature && layer.feature.properties.M0_p_tot > (that.averageOccupation * 2.0)) {
                    that.occupationSuburbMarkers.push(L.marker([layer._latlngs[0][0].lat, layer._latlngs[0][0].lng],
                        {icon: that.occupationMarker}).bindPopup("Number of Occupation:"+ layer.feature.properties.M0_p_tot));
                }
                if (layer.feature && layer.feature.properties.M0_tot_p_ > (that.averageImmigrants * 2.0)) {
                    that.immigrantSuburbMarkers.push(L.marker([layer._latlngs[0][0].lat, layer._latlngs[0][0].lng],
                        {icon: that.immigrantMarker}).bindPopup("Number of Immigrants:"+ layer.feature.properties.M0_tot_p_));
                }
            });
            this.richSuburbMarkerLayerGroup = L.layerGroup(this.richSuburbMarkers);
            this.homelessSuburbMarkerLayerGroup = L.layerGroup(this.homelessSuburbMarkers);
            this.occupationSuburbMarkerLayerGroup = L.layerGroup(this.occupationSuburbMarkers);
            this.immigrantSuburbMarkerLayerGroup = L.layerGroup(this.immigrantSuburbMarkers);
            $('#richSuburb').removeAttr('disabled');
            $('#mostHomeless').removeAttr('disabled');
            $('#mostOccupations').removeAttr('disabled');
            $('#mostImmigrants').removeAttr('disabled');
        },
        removeMapLayer: function (layerGroup) {
            if (layerGroup !== undefined) {
                this.map.removeLayer(layerGroup);
            }
        },
        addLayerToMap: function (layer) {
            layer.addTo(this.map);
        },
        handleLayers:function(visual,operation){
            if(operation === "add") {
                if (visual === "richSuburb") {
                    this.addLayerToMap(this.richSuburbMarkerLayerGroup);
                } else if (visual === "mostOccupations") {
                    this.addLayerToMap(this.occupationSuburbMarkerLayerGroup);
                } else if (visual === "mostImmigrants") {
                    this.addLayerToMap(this.immigrantSuburbMarkerLayerGroup);
                } else {
                    this.addLayerToMap(this.homelessSuburbMarkerLayerGroup);
                }
            }else{
                if (visual === "richSuburb") {
                    this.removeMapLayer(this.richSuburbMarkerLayerGroup);
                } else if (visual === "mostOccupations") {
                    this.removeMapLayer(this.occupationSuburbMarkerLayerGroup);
                } else if (visual === "mostImmigrants") {
                    this.removeMapLayer(this.immigrantSuburbMarkerLayerGroup);
                } else {
                    this.removeMapLayer(this.homelessSuburbMarkerLayerGroup);
                }
            }
        },
        openChartView: function (chart, data, yAxis, title, interval) {
            var chart = new CanvasJS.Chart(chart,
                {
                    width: 650,
                    title:{
                        text: title,
                        fontWeight: "bolder",
                        fontColor: "black",
                        fontfamily: "Lucida Grande",
                        fontSize: 25
                    },
                    axisX: {
                        title: "Sentiment Density",
                        titleFontWeight: "normal",
                        titleFontColor: "black",
                        titleFontfamily: "Lucida Grande",
                        titleFontSize: 16,
                        fontSize: 14,
                        interval:0.1,
                        labelFontFamily: "Lucida Grande",
                        labelFontColor: "black",
                        labelFontSize: 10,
                        labelFontWeight: "normal",
                        intervalType: "number"
                    },
                    axisY:{
                        title: yAxis,
                        titleFontWeight: "normal",
                        titleFontColor: "black",
                        titleFontfamily: "Lucida Grande",
                        titleFontSize: 16,
                        includeZero: true,
                        interval: interval,
                        intervalType: "number",
                        labelFontFamily: "Lucida Grande",
                        labelFontColor: "black",
                        labelFontSize: 10,
                        labelFontWeight: "normal"
                    },
                    data: [{
                            type: "line",
                            dataPoints: data
                        }]
                });
            chart.render();
        },
        calculateAndFindMinMaxRange: function(twitterData) {
            var that = this;
            var min = 0;
            var max = 0;
            twitterData.rows.forEach(function (doc) {
                doc.sentimentData = doc.value.total / doc.value.count;
                if(doc.sentimentData < min){
                    min = doc.sentimentData;
                }else{
                    if(doc.sentimentData > max){
                        max = doc.sentimentData;
                    }
                }
            });
            that.min = min;
            that.max = max;
        }
    };

    $('.tablinks').on('click', function (e) {
        var name = e.target.getAttribute('data-val');
        handleTab.openTab(name);
    });
    handleTab.openTab("mapView");

    $('#viewContent').on('click', function (e) {
        handleTab.addMapPoints();
    });

    $('#richSuburb').click(function () {
        if (!$(this).is(':checked')) {
            handleTab.handleLayers("richSuburb","remove");
        }else{
            handleTab.handleLayers("richSuburb","add");
        }
    });
    $('#mostOccupations').click(function () {
        if (!$(this).is(':checked')) {
            handleTab.handleLayers("mostOccupations","remove");
        }else{
            handleTab.handleLayers("mostOccupations","add");
        }
    });
    $('#mostImmigrants').click(function () {
        if (!$(this).is(':checked')) {
            handleTab.handleLayers("mostImmigrants","remove");
        }else{
            handleTab.handleLayers("mostImmigrants","add");
        }
    });
    $('#mostHomeless').click(function () {
        if (!$(this).is(':checked')) {
            handleTab.handleLayers("mostHomeless","remove");
        }else{
            handleTab.handleLayers("mostHomeless","add");
        }
    });
    $('#chartComboBox').change(function () {
        switch(this.value) {
            case 'incomeVsSentiment':
                handleTab.openChartView('incomeChart',handleTab.incomeVsSentiment.sort(function (a, b) {
                    return a.x - b.x
                }), 'Total Income of people (Weeks)', 'Income of people Vs Sentiments', 300);

                $('#homelessPeopleChart').hide();
                $('#immigrantChart').hide();
                $('#occupationChart').hide();
                $('#incomeChart').show();
                break;
            case 'employmentVsSentiment':
                handleTab.openChartView('occupationChart',handleTab.occupationVsSentiment.sort(function (a, b) {
                    return a.x - b.x
                }), 'Number of Employed people', 'Number of Employed people Vs Sentiments', 2000);
                $('#incomeChart').hide();
                $('#homelessPeopleChart').hide();
                $('#immigrantChart').hide();
                $('#occupationChart').show();
                break;
            case 'immigrantsVsSentiment':
                handleTab.openChartView('immigrantChart',handleTab.immigrantsVsSentiment.sort(function (a, b) {
                    return a.x - b.x
                }), 'Number of Immigrants', 'Number of Immigrants Vs Sentiments', 5000);
                $('#incomeChart').hide();
                $('#occupationChart').hide();
                $('#homelessPeopleChart').hide();
                $('#immigrantChart').show();
                break;
            case 'homelessPeopleVsSentiment':
                handleTab.openChartView('homelessPeopleChart',handleTab.homelessPeopleVsSentiment.sort(function (a, b) {
                    return a.x - b.x
                }), 'Number of homeless people', 'Number of homeless people Vs Sentiments');
                $('#incomeChart').hide();
                $('#occupationChart').hide();
                $('#immigrantChart').hide();
                $('#homelessPeopleChart').show();
                break;
        }
    });
});