$(function () {
    var handleTab = {
        openTab: function (view) {
            var tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
            }

            document.getElementById(view).style.display = "block";
            if (view == "mapView") {
                // if(this.map === undefined) {
                this.keymap={
                    "tot_tot":"Total Income",
                    "M0_tot_p_":"Number of Immigrants",
                    "M0_prtc_t":"Percentage of family areas in suburb",
                    "M0_hl_p_h":"Number of Homeless people",
                    "M0_p_tot":"Total occupation",
                    "sa2_name16":"Suburb"
                };
                var that = this;
                this.shpfile;
                this.map = this.openMapView();
                $('#chartbutton').removeClass('active');
                $('#mapbutton').addClass('active');
                var sum_Income =0;
                var count = 0;
                that.averageIncome = 1211.465367965368;
                $.ajax({
                    type: "GET",
                    url: '/getSentiment',
                    contentType: 'application/json',
                    success: function (response) {
                        that.response = response;
                        that.incomeVsSentiment = new Array();
                        that.info = L.control();
                        that.shpfile = new L.Shapefile('public/javascripts/vic_shapefile.zip', {
                            onEachFeature: function (feature, layer) {
                                if (feature.properties) {
                                    var suburbmapdata = getInfoFrom(Object,feature).join(" <br/>");
                                    layer.bindPopup(suburbmapdata);
                                    if(feature.properties.sentimentDensity) {
                                        that.incomeVsSentiment.push([feature.properties.sentimentDensity, feature.properties.tot_tot]);
                                    }

                                    // sum_Income += feature.properties.tot_tot;
                                    // count++;
                                    // that.averageIncome = (sum_Income*1.0)/count;
                                    // if(feature.properties.tot_tot > 2000){
                                    //     L.marker([feature.geometry.bbox[1],feature.geometry.bbox[0]]).addTo(that.map);
                                    // }
                                }
                                layer.on({
                                    mouseover: highlightFeature,
                                    mouseout: resetHighlight
                                });
                            },
                            style: function(feature){
                                if(feature.properties.sentimentDensity === undefined) {
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
                        // that.addMapPoints();
                        that.info.onAdd = function (map) {
                            this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
                            this.update();
                            return this._div;
                        };

                        // method that we will use to update the control based on feature properties passed
                        that.info.update = function (props) {
                            if(props !== undefined) {
                                var sentimentText = that.getSentimentText(props.sentimentDensity);
                            }
                            this._div.innerHTML = '<h4>Name of the Suburb</h4>' + (props ?
                                '<b>' + props.sa2_name16 + '</b><br />' + sentimentText+  ''
                                : 'Hover over a suburb');
                        };

                        that.info.addTo(that.map);

                        function getInfoFrom(object,feature) {
                            var displayRequiredData = [];
                            object.keys(feature.properties).map(function (k) {
                                if(isNaN(parseInt(k))){
                                    key = k;
                                }else{
                                    key = k.substring(parseInt(k).toString().length);
                                }
                                if(that.keymap[key] !== undefined) {
                                    displayRequiredData.push(that.keymap[key] + ": " + feature.properties[k]);
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
        getColor: function (d) {
            return d > 0.75 ? '#587D0B' :
                    d > 0.5 ? '#4EB60B' :
                    d > 0.25 ? '#82BE0A' :
                    d > 0 ? '#BAC608' :
                    d > -0.25 ? '#CEA306' :
                    d > -0.5 ? '#D67004' :
                    d > -0.75 ? '#DE3602' :
                    '#E60008';
        },
        addLegend: function(){
            var that = this;
            this.legend = L.control({position: 'bottomright'});
            this.legend.onAdd = function (map) {
                var div = L.DomUtil.create('div', 'info legend'),
                    grades = [-1, -0.75, -0.5, -0.25, 0.0, 0.25, 0.5, 0.75, 1],
                    labels = [];
                // loop through our density intervals and generate a label with a colored square for each interval
                for (var i = 0; i < grades.length-1; i++) {
                    div.innerHTML +=
                        '<i style="background:' + that.getColor(grades[i] + 0.01) + ' "></i> ' +
                        grades[i] + ' - ' + grades[i + 1] + '<br>';
                }
                return div;
            };
            this.legend.addTo(this.map);
        },
        refreshContent: function(){
            var selectedContent = $('.comboBox').val();
            this.addMapPoints();
            // alert(selectedContent);
            // if(selectedContent !== "Happiness"){
            //     this.removeMapPoints();
            // }
        },
        getSentimentDensity: function(suburbId) {
            var sentimentDensity;
            this.response.rows.forEach(function(doc) {
                if(doc.key == suburbId) {
                    sentimentDensity =doc.value.total/doc.value.count;
                }
            });
            return sentimentDensity;
        },
        getSentimentText: function(sentiment){
            var d = sentiment;
            if(d !== undefined) {
                return d > 0.75 ? 'Very happy people :) :)' :
                    d > 0.5 ? 'Happy people :)' :
                        d > 0.25 ? "<i class='fa fa-smile'>" :
                            d > 0 ? "<i class='fa fa-meh'>" :
                                d > -0.25 ? "<i class='fa fa-frown'>" :
                                    d > -0.5 ? 'Unhappy people :(' :
                                        d > -0.75 ? 'Very unhappy people :( :(' :
                                            'unknown';
            }
        },
        addMapPoints:function(){
            var that = this;
            var avgIncome = that.averageIncome;
            this.richSuburbMarkers = [];
            var redMarker = L.AwesomeMarkers.icon({
                icon: 'dollar-sign',
                markerColor: 'black',
                prefix:'fa'
            });
            this.map.eachLayer(function(layer){
               if(layer.feature && layer.feature.properties.tot_tot > (avgIncome*2.0)){
                    that.richSuburbMarkers.push(L.marker([layer._latlngs[0][0].lat,layer._latlngs[0][0].lng],{icon:redMarker}));
               }
               var s = 10;
            });
            this.richSuburbMarkerLayerGroup = L.layerGroup(this.richSuburbMarkers);
            this.richSuburbMarkerLayerGroup.addTo(that.map);
        },
        // removeMapPoints:function(){
        //     if(this.richSuburbMarkerLayerGroup !== undefined){
        //         this.map.removeLayer(this.richSuburbMarkerLayerGroup);
        //     }
        // }

        openChartView: function () {
            var myData = this.incomeVsSentiment.sort(function(a,b) {
                return a[0]-b[0]
            });
            var myChart = new JSChart('chartId', 'line');
            myChart.setDataArray(myData);
            myChart.setAxisNameFontSize(10);
            myChart.setAxisNameX('Sentiment Values');
            myChart.setAxisNameY('Total Income');
            myChart.setAxisNameColor('#787878');
            myChart.setAxisValuesNumberX(20);
            myChart.setAxisValuesNumberY(20);
            myChart.setAxisValuesColor('#38a4d9');
            myChart.setAxisColor('#38a4d9');
            myChart.setLineColor('#C71112');
            myChart.setTitle('Income VS Sentiment chart');
            myChart.setTitleColor('#383838');
            myChart.setGraphExtend(true);
            myChart.setGridColor('#38a4d9');
            myChart.setSize(800, 500);
            myChart.setAxisPaddingLeft(140);
            myChart.setAxisPaddingRight(140);
            myChart.setAxisPaddingTop(60);
            myChart.setAxisPaddingBottom(45);
            myChart.setTextPaddingLeft(105);
            myChart.setTextPaddingBottom(12);
            myChart.setBackgroundImage('/javascripts/chart_bg.jpg');
            myChart.draw();

            // var ctx = document.getElementById("myChart");
            // var myChart = new Chart(ctx, {
            //     type: 'line',
            //     data: {
            //         labels: [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1],
            //         datasets: [{
            //             label: 'Income vs Sentiment Value',
            //             // xaxisId: [1,2,3,4,5,6,7,8,9,10],
            //             //     //[-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1],
            //             // yaxisId: [1,2,3,4,5,6,7,8,9,10],
            //             data: [
            //                 {x:0.22,y:1},
            //                 {x:-0.762,y:2},
            //                 {x:0.43,y:3},
            //                 {x:0.964,y:4},
            //                 {x:-0.53,y:5}
            //             ],
            //             // data: [{
            //             //     x: -10,
            //             //     y: 0
            //             // }, {
            //             //     x: 0,
            //             //     y: 10
            //             // }, {
            //             //     x: 10,
            //             //     y: 5
            //             // }],
            //             pointBackgroundColor: 'blue',
            //             pointRadius: 3,
            //             pointHoverBackground: 'darkBlue',
            //             pointHoverRadius: 4,
            //             showLine: true,
            //
            //
            //         }]
            //     },
            //     options: {
            //         scales: {
            //             yAxes: [{
            //                 ticks: {
            //                     // min: 1,
            //                     // max: 9,
            //                     stepSize: 1
            //                 }
            //             }],
            //             // xAxes: [{
            //             //     ticks: {
            //             //         min: 1,
            //             //         max: 9,
            //             //         stepSize: 1
            //             //     }
            //             // }]
            //         }
            //     }
            //
            // });

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







