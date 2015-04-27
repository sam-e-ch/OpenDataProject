var sptv = sptv || {};
 
$(document).ready(function(){
    sptv.map.draw();
    
    $('#key').draggable({
        containment: "parent",
        handle: ".panel-heading"
    });    
    
     $('input[type=radio][name=show]').change(function() {
         sptv.activeLayer.base = sptv.constants.layers[this.value];
         sptv.helpers.showLayer();
     });
    
    var $filterDay = $('.filter-day');    
    $filterDay.click(function(){
        $filterDay.removeClass('active');
        $(this).addClass('active');
        var filter = $(this).attr('name')
        sptv.activeLayer.filter = filter;
        sptv.helpers.showLayer();
    });
    
    sptv.helpers.positionKey();
    
    $( window ).resize(function() {
        sptv.helpers.resize();   
    });
});

sptv.constants = {
    layers : {
        "avgMunicipalities": 
                {   
                    "cl" : "avgMunicipalities",
                    "rate": function(d){ return sptv.helpers.quantize.time(sptv.constants.rateMunicipality.get(d.id));},
                    "tooltip": function(d){ return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.helpers.showTime(sptv.constants.rateMunicipality.get(d.id))},
                    "display": "initial",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "time"
                },
        "avgMunicipalitiesWeek": 
                {   
                    "cl" : "avgMunicipalitiesWeek",
                    "rate": function(d){ return sptv.helpers.quantize.time(sptv.constants.rateMunicipalityWeek.get(d.id));},
                    "tooltip": function(d){ return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.helpers.showTime(sptv.constants.rateMunicipalityWeek.get(d.id))},
                    "display": "initial",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "time"
                },
        "avgMunicipalitiesWeekend": 
                {   
                    "cl" : "avgMunicipalitiesWeekend",
                    "rate": function(d){ return sptv.helpers.quantize.time(sptv.constants.rateMunicipalityWeekend.get(d.id));},
                    "tooltip": function(d){ return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.helpers.showTime(sptv.constants.rateMunicipalityWeekend.get(d.id))},
                    "display": "initial",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "time"
                },
        "avgMunicipalitiesSun": 
                {   
                    "cl" : "avgMunicipalitiesSun",
                    "rate": function(d){ return sptv.helpers.quantize.time(sptv.constants.rateMunicipalitySun.get(d.id));},
                    "tooltip": function(d){ return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.helpers.showTime(sptv.constants.rateMunicipalitySun.get(d.id))},
                    "display": "initial",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "time"
                },
        "lastMunicipalities": 
                {   
                    "cl" : "lastMunicipalities",
                    "rate": function(d) { return sptv.helpers.quantize.time(sptv.constants.rateLastMunicipality.get(d.id)); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.helpers.showTime(sptv.constants.rateLastMunicipality.get(d.id));},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "time"
                },
        "lastMunicipalitiesWeek": 
                {   
                    "cl" : "lastMunicipalitiesWeek",
                    "rate": function(d) { return sptv.helpers.quantize.time(sptv.constants.rateLastMunicipalityWeek.get(d.id)); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.helpers.showTime(sptv.constants.rateLastMunicipalityWeek.get(d.id));},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "time"
                },
        "lastMunicipalitiesWeekend": 
                {   
                    "cl" : "lastMunicipalitiesWeekend",
                    "rate": function(d) { return sptv.helpers.quantize.time(sptv.constants.rateLastMunicipalityWeekend.get(d.id)); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.helpers.showTime(sptv.constants.rateLastMunicipalityWeekend.get(d.id));},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "time"
                },
        "lastMunicipalitiesSun": 
                {   
                    "cl" : "lastMunicipalitiesSun",
                    "rate": function(d) { return sptv.helpers.quantize.time(sptv.constants.rateLastMunicipalitySun.get(d.id)); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.helpers.showTime(sptv.constants.rateLastMunicipalitySun.get(d.id));},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "time"
                },
        "countMunicipalities": 
                {   
                    "cl" : "countMunicipalities",
                    "rate": function(d) { return sptv.helpers.quantize.count(Math.log(sptv.constants.municipalityCountDepartures.get(d.id))); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.constants.municipalityCountDepartures.get(d.id);},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "log"
                },
        "countMunicipalitiesWeek": 
                {   
                    "cl" : "countMunicipalitiesWeek",
                    "rate": function(d) { return sptv.helpers.quantize.count(Math.log(sptv.constants.municipalityCountDeparturesWeek.get(d.id))); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.constants.municipalityCountDeparturesWeek.get(d.id);},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "log"
                },
        "countMunicipalitiesWeekend": 
                {   
                    "cl" : "countMunicipalitiesWeekend",
                    "rate": function(d) { return sptv.helpers.quantize.count(Math.log(sptv.constants.municipalityCountDeparturesWeekend.get(d.id))); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.constants.municipalityCountDeparturesWeekend.get(d.id);},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "log"
                },
        "countMunicipalitiesSun": 
                {   
                    "cl" : "countMunicipalitiesSun",
                    "rate": function(d) { return sptv.helpers.quantize.count(Math.log(sptv.constants.municipalityCountDeparturesSun.get(d.id))); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.constants.municipalityCountDeparturesSun.get(d.id);},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "log"
                },
        "departuresPerPerson": 
                {   
                    "cl" : "departuresPerPerson",
                    "rate": function(d) { return sptv.helpers.quantize.density( (sptv.constants.municipalityCountDepartures.get(d.id)/sptv.constants.municipalityPopulation.get(d.id) )); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' +    (sptv.constants.municipalityCountDepartures.get(d.id)/sptv.constants.municipalityPopulation.get(d.id));},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "density"
                },
        "departuresPerPersonWeek": 
                {   
                    "cl" : "departuresPerPersonWeek",
                    "rate": function(d) { return sptv.helpers.quantize.density( (sptv.constants.municipalityCountDeparturesWeek.get(d.id)/sptv.constants.municipalityPopulation.get(d.id) )); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' +    (sptv.constants.municipalityCountDeparturesWeek.get(d.id)/sptv.constants.municipalityPopulation.get(d.id));},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "density"
                },
        "departuresPerPersonWeekend": 
                {   
                    "cl" : "departuresPerPersonWeekend",
                    "rate": function(d) { return sptv.helpers.quantize.density( (sptv.constants.municipalityCountDeparturesWeekend.get(d.id)/sptv.constants.municipalityPopulation.get(d.id) )); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' +    (sptv.constants.municipalityCountDeparturesWeekend.get(d.id)/sptv.constants.municipalityPopulation.get(d.id));},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "density"
                },
        "departuresPerPersonSun": 
                {   
                    "cl" : "departuresPerPersonSun",
                    "rate": function(d) { return sptv.helpers.quantize.density( (sptv.constants.municipalityCountDeparturesSun.get(d.id)/sptv.constants.municipalityPopulation.get(d.id) )); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' +    (sptv.constants.municipalityCountDeparturesSun.get(d.id)/sptv.constants.municipalityPopulation.get(d.id));},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "density"
                }
        }, 
    rateMunicipality: d3.map(),
    rateMunicipalityWeek: d3.map(),
    rateMunicipalityWeekend: d3.map(),
    rateMunicipalitySun: d3.map(),
    rateLastMunicipality: d3.map(),
    rateLastMunicipalityWeek: d3.map(),
    rateLastMunicipalityWeekend: d3.map(),
    rateLastMunicipalitySun: d3.map(),
    municipalityName: d3.map(),
    municipalityArea: d3.map(),
    municipalityPopulation: d3.map(),
    municipalityCountDepartures: d3.map(),
    municipalityCountDeparturesWeek: d3.map(),
    municipalityCountDeparturesWeekend: d3.map(),
    municipalityCountDeparturesSun: d3.map()
};

sptv.activeLayer = {
    base : sptv.constants.layers.avgMunicipalities,
    filter : ""
};

sptv.map = {
    
    draw: function() {    
        var width = $('#map').width(), height = 500;
        var zoom = d3.behavior.zoom().scaleExtent([1,8]).on("zoom", zoomed);
        var country = d3.geo.path().projection(null);
        var path = d3.geo.path().projection(null);
        var svg = d3.select("#map").append("svg").attr("width", width).attr("height", height).attr("class", "svg");   
        
        var xTranslate = 0;
        var yTranslate = 0;
        var scale = 1;

        d3.json("data/municipalities_all.json", function(d) { 
            for(var i = 0; i<d.length; i++){
                sptv.constants.rateMunicipality.set(d[i].id, +d[i].avg);
                sptv.constants.rateLastMunicipality.set(d[i].id, +d[i].max);
                sptv.constants.municipalityArea.set(d[i].id, +d[i].area);
                sptv.constants.municipalityPopulation.set(d[i].id, +d[i].population);
                sptv.constants.municipalityCountDepartures.set(d[i].id, +d[i].count_departures);
                sptv.constants.municipalityName.set(d[i].id, d[i].name);
            }
        });
        
        d3.json("data/municipalities_week.json", function(d) { 
            for(var i = 0; i<d.length; i++){
                sptv.constants.rateMunicipalityWeek.set(d[i].id, +d[i].avg);
                sptv.constants.rateLastMunicipalityWeek.set(d[i].id, +d[i].max);
                sptv.constants.municipalityCountDeparturesWeek.set(d[i].id, +d[i].count_departures);
            }
        });
        
        d3.json("data/municipalities_we.json", function(d) { 
            for(var i = 0; i<d.length; i++){
                sptv.constants.rateMunicipalityWeekend.set(d[i].id, +d[i].avg);
                sptv.constants.rateLastMunicipalityWeekend.set(d[i].id, +d[i].max);
                sptv.constants.municipalityCountDeparturesWeekend.set(d[i].id, +d[i].count_departures);
            }
        });
        
        d3.json("data/municipalities_sun.json", function(d) { 
            for(var i = 0; i<d.length; i++){
                sptv.constants.rateMunicipalitySun.set(d[i].id, +d[i].avg);
                sptv.constants.rateLastMunicipalitySun.set(d[i].id, +d[i].max);
                sptv.constants.municipalityCountDeparturesSun.set(d[i].id, +d[i].count_departures);
            }
        });

        d3.json("data/ch.json", function(error, ch) { 
            svg.call(zoom);
            drawCountry(ch);
            for(var layer in sptv.constants.layers){
                drawLayer(ch, sptv.constants.layers[layer]);  
            }
            drawCantonBorders(ch);
        }); 

        function drawCountry(ch){
            svg.append("g").append("path").datum(topojson.feature(ch, ch.objects.country))
                .attr("class", "country").attr("d", country);   
        }
        
        function drawLayer(ch, layer){
            svg .append("g")
                .attr("class", layer.cl +" highlight")
                .attr("display", layer.display)
                .selectAll("path")
                .data(layer.data(ch))
                .enter().append("path")
                .attr("class", function(d) { return layer.rate(d); })
                .attr("d", path)
                .append("title")
                .text(function(d){return layer.tooltip(d);});
        }

        function drawCantonBorders(ch){
            svg.append("g").append("path").datum(topojson.feature(ch, ch.objects.lakes))
                .attr("class", "lake").attr("d", path);  
            
            svg.append("g").append("path")
                .datum(topojson.mesh(ch, ch.objects.cantons, function(a, b) { return a !== b; }))
                .attr("class", "canton-boundaries").attr("d", path);   
        }
        
        function zoomed(){
            scale = d3.event.scale;
            xTranslate = d3.event.translate[0];
            yTranslate = d3.event.translate[1];
            console.log(d3.event.translate);
            $('g').attr("transform", "translate(" + xTranslate + ", " + yTranslate + ") scale(" + scale + ")");
        }
    }
};

sptv.helpers = {
    quantize: {
       time: d3.scale.quantize()
            .domain([1000, 2800])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9";})),

       count: d3.scale.quantize()
            .domain([1, 13.5])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9";})),
        
        density: d3.scale.quantize()
            .domain([0, 1.6])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9";}))
    },

    showLayer: function (){
        layer = sptv.activeLayer.base.cl + sptv.activeLayer.filter;
        var layersArr = Object.keys(sptv.constants.layers);
        for(var i = 0, len = layersArr.length; i < len; i++){
            if (layersArr[i] != layer){
                this.hide($('.'+ layersArr[i]));   
            } else {
                this.unhide($('.'+ layersArr[i]));
            }
        }        
         sptv.helpers.labelKey(sptv.activeLayer.base.mode);
    },

    hide: function (cl){    
        cl.attr('display', 'none');
    }, 

    unhide: function (cl){    
        if (cl.attr('display'))
            cl.removeAttr('display');
    },

    resize: function (){
        $('svg').width($('#map').width());
        this.positionKey();
    },

    positionKey: function (){
        var p = $('#map').position();
        $('#key').css({
            top : p.top+40, 
            left: p.left+5
        });
    },

    labelKey: function (mode){
        var time = ['10:00-11:59', '12:00-13:59', '14:00-15:59', '16:00-17:59', '18:00-19:59', '20:00-21:59','22:00-23:59', '00:00-01:59', '02:00-03:59'];
        var log = [1,4,16,65,260,1043,4188,16815,67508];
        var density = ['0-0.2','0.21-0.4','0.41-0.6','0.61-0.8','0.81-1','1.01-1.2','1.21-1.4','1.41-1.6','>1.6'];

        var keys = $('#key > .panel > .panel-body > p > small');
        var keyTitle = $('#key > .panel > .panel-heading > h3');
        
        keyTitle.text(sptv.activeLayer.base.cl);
        
        var m;
        
        switch(mode){
            case "log":
                m = log;
                break;
            case "time":
                m = time;
                break;
            case "density":
                m = density;
                break;
        }

        for(var i=0; i<keys.length;i++){
                $(keys[i]).text(m[i]); 
        }
    },

    showTime: function (time){
        if(isNaN(time)){
            return 'No Departures';   
        }

        time = Math.round(time);
        var h = Math.floor(time/100);    
        var m = time-(h*100);
        time = h * 3600 + m * 60;

        var hours   = Math.floor(time / 3600);
        var minutes = Math.floor((time - (hours * 3600)) / 60);
        var seconds = time - (hours * 3600) - (minutes * 60);

        if (hours >= 24) { hours-= 24;}
        if (hours   < 10) { hours   = "0"+hours; }
        if (minutes < 10) { minutes = "0"+minutes; }
        var t = hours + ':' + minutes;
        return t;
    }
};