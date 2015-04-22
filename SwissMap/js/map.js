var sptv = sptv || {};
 
$(document).ready(function(){
    sptv.map.draw();
    
    $('#key').draggable({
        containment: "parent",
        handle: ".panel-heading"
    });    
    
     $('input[type=radio][name=show]').change(function() {        
         sptv.helpers.showLayer(this.value);
         sptv.helpers.labelKey(sptv.constants.layers[this.value].mode);
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
            "lastMunicipalities": 
                {   
                    "cl" : "lastMunicipalities",
                    "rate": function(d) { return sptv.helpers.quantize.time(sptv.constants.rateLastMunicipality.get(d.id)); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' + sptv.helpers.showTime(sptv.constants.rateLastMunicipality.get(d.id));},
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
            "departuresPerPerson": 
                {   
                    "cl" : "departuresPerPerson",
                    "rate": function(d) { return sptv.helpers.quantize.density( (sptv.constants.municipalityCountDepartures.get(d.id)/sptv.constants.municipalityPopulation.get(d.id) )); },
                    "tooltip": function(d){return sptv.constants.municipalityName.get(d.id) + ': ' +    (sptv.constants.municipalityCountDepartures.get(d.id)/sptv.constants.municipalityPopulation.get(d.id));},
                    "display" : "none",
                    "data" : function(ch){return topojson.feature(ch, ch.objects.municipalities).features},
                    "mode" : "density"
                },
            "cantons": 
                {   
                    "cl" : "cantons",
                    "rate": function(d) { return sptv.helpers.quantize.time(sptv.constants.rateCanton.get(d.id)); },
                    "tooltip": function(d){return sptv.helpers.showTime(sptv.constants.rateCanton.get(d.id));},
                    "display" : "none",
                    "data" : function(ch) {return topojson.feature(ch, ch.objects.cantons).features},
                    "mode" : "time"
                }
        }, 
    rateMunicipality: d3.map(),
    rateLastMunicipality: d3.map(),
    rateCanton: d3.map(),
    municipalityName: d3.map(),
    municipalityArea: d3.map(),
    municipalityPopulation: d3.map(),
    municipalityCountDepartures: d3.map()
};


sptv.map = {
    
    draw: function() {    
        var width = $('#map').width(), height = 500;
        var country = d3.geo.path().projection(null);
        var path = d3.geo.path().projection(null);
        var svg = d3.select("#map").append("svg").attr("width", width).attr("height", height).attr("class", "svg");   

        d3.json("data/municipalities.json", function(d) { 
            for(var i = 0; i<d.length; i++){
                sptv.constants.rateMunicipality.set(d[i].id, +d[i].avg);
                sptv.constants.rateLastMunicipality.set(d[i].id, +d[i].max);
                sptv.constants.municipalityArea.set(d[i].id, +d[i].area);
                sptv.constants.municipalityPopulation.set(d[i].id, +d[i].population);
                sptv.constants.municipalityCountDepartures.set(d[i].id, +d[i].count_departures);
                sptv.constants.municipalityName.set(d[i].id, d[i].name);
            }
        });

        d3.json("data/canton_avg.json", function(d) { 
            for(var i = 0; i<d.length; i++){
                sptv.constants.rateCanton.set(d[i].id, +d[i].avg);
            }
        });


        d3.json("data/ch.json", function(error, ch) { 
            drawCountry(ch);
            for(var layer in sptv.constants.layers){
                drawLayer(ch, sptv.constants.layers[layer]);  
            }
            drawCantonBorders(ch);
        }); 

        function drawCountry(ch){
            svg.append("path").datum(topojson.feature(ch, ch.objects.country))
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
            svg.append("path").datum(topojson.feature(ch, ch.objects.lakes))
                .attr("class", "lake").attr("d", path);  
            
            svg.append("path")
                .datum(topojson.mesh(ch, ch.objects.cantons, function(a, b) { return a !== b; }))
                .attr("class", "canton-boundaries").attr("d", path);   
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

    showLayer: function (layer){
        var layersArr = Object.keys(sptv.constants.layers);
        for(var i = 0, len = layersArr.length; i < len; i++){
            if (layersArr[i] != layer){
                this.hide($('.'+ layersArr[i]));   
            } else {
                this.unhide($('.'+ layersArr[i]));
            }
        }
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