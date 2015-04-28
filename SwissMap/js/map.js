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
                    "rate": function(id){ 
                        var r = sptv.constants.rateMunicipality[sptv.activeLayer.filter].get(id);
                        return r?sptv.helpers.quantize.time(r):"no-data";},
                    "tooltip": function(id){ 
                        var r = sptv.constants.rateMunicipality[sptv.activeLayer.filter].get(id);
                        var t = r?sptv.helpers.showTime(r):"No data aviable.";
                        return sptv.constants.municipalityName.get(id) + ': ' + t
                    },
                    "mode" : "time"
                },
        "lastMunicipalities": 
                {   
                    "cl" : "lastMunicipalities",
                    "rate": function(id) { 
                        var r = sptv.constants.rateLastMunicipality[sptv.activeLayer.filter].get(id);                        
                        return r?sptv.helpers.quantize.time(r):"no-data"; },
                    "tooltip": function(id){
                        var r = sptv.constants.rateLastMunicipality[sptv.activeLayer.filter].get(id);
                        var t = r?sptv.helpers.showTime(r):"No data aviable.";
                        return sptv.constants.municipalityName.get(id) + ': ' + t;
                    },
                    "mode" : "time"
                },
        "countMunicipalities": 
                {   
                    "cl" : "countMunicipalities",
                    "rate": function(id) {
                        var r = sptv.constants.municipalityCountDepartures[sptv.activeLayer.filter].get(id);
                        return r?sptv.helpers.quantize.count(Math.log(r)):"no-data"; 
                    },
                    "tooltip": function(id){
                        return sptv.constants.municipalityName.get(id) + ': ' + (sptv.constants.municipalityCountDepartures[sptv.activeLayer.filter].get(id)||"No data aviable.");
                    },
                    "mode" : "log"
                },
        "departuresPerPerson": 
                {   
                    "cl" : "departuresPerPerson",
                    "rate": function(id) { 
                        var r = sptv.constants.municipalityCountDepartures[sptv.activeLayer.filter].get(id);
                        return r?sptv.helpers.quantize.density((r/sptv.constants.municipalityPopulation.get(id))):"no-data"; 
                    },
                    "tooltip": function(id){
                        var r = sptv.constants.municipalityCountDepartures[sptv.activeLayer.filter].get(id);
                        var t = r?(r/sptv.constants.municipalityPopulation.get(id)):"No data aviable.";
                        return sptv.constants.municipalityName.get(id) + ': ' + t;
                    },
                    "mode" : "density"
                },
        }, 
    rateMunicipality: {
        all: d3.map(),
        week: d3.map(),
        weekend: d3.map(),
        sun: d3.map()
    },
    rateLastMunicipality: {
        all: d3.map(),
        week: d3.map(),
        weekend: d3.map(),
        sun: d3.map()   
    },
    municipalityName: d3.map(),
    municipalityArea: d3.map(),
    municipalityPopulation: d3.map(),
    municipalityCountDepartures: {
        all: d3.map(),
        week: d3.map(),
        weekend: d3.map(),
        sun: d3.map()    
    }    
};

sptv.activeLayer = {
    base : sptv.constants.layers.avgMunicipalities,
    filter : "all"
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

        d3.json("data/municipalities.json", function(d) { 
            for(var i = 0; i<d.length; i++){
                sptv.constants.rateMunicipality.all.set(d[i].id, +d[i].avg_all);
                sptv.constants.rateLastMunicipality.all.set(d[i].id, +d[i].max_all);
                sptv.constants.municipalityCountDepartures.all.set(d[i].id, +d[i].count_departures_all);
                
                sptv.constants.rateMunicipality.week.set(d[i].id, +d[i].avg_week);
                sptv.constants.rateLastMunicipality.week.set(d[i].id, +d[i].max_week);
                sptv.constants.municipalityCountDepartures.week.set(d[i].id, +d[i].count_departures_week);
                
                sptv.constants.rateMunicipality.weekend.set(d[i].id, +d[i].avg_weekend);
                sptv.constants.rateLastMunicipality.weekend.set(d[i].id, +d[i].max_weekend);
                sptv.constants.municipalityCountDepartures.weekend.set(d[i].id, +d[i].count_departures_weekend);
                
                sptv.constants.rateMunicipality.sun.set(d[i].id, +d[i].avg_sun);
                sptv.constants.rateLastMunicipality.sun.set(d[i].id, +d[i].max_sun);
                sptv.constants.municipalityCountDepartures.sun.set(d[i].id, +d[i].count_departures_sun);
                
                sptv.constants.municipalityArea.set(d[i].id, +d[i].area);
                sptv.constants.municipalityPopulation.set(d[i].id, +d[i].population);
                sptv.constants.municipalityName.set(d[i].id, d[i].name);
            }
        });

        d3.json("data/ch.json", function(error, ch) { 
            svg.call(zoom);
            drawCountry(ch);
            drawMunicipalities(ch);
            drawCantonBorders(ch);
            
            sptv.helpers.showLayer();
        }); 

        function drawCountry(ch){
            svg.append("g").append("path").datum(topojson.feature(ch, ch.objects.country))
                .attr("class", "country").attr("d", country);   
        }
        
        function drawMunicipalities(ch){
            svg.append("g")
                .attr("class", "municipality highlight ")
                .selectAll("path")
                .data(topojson.feature(ch, ch.objects.municipalities).features)
                .enter()
                .append("path")
                .attr("id" , function(d) { return ("muni-" + d.id);})
                .attr("d", path)
                .append("title");   
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
            $('g').attr("transform", "translate(" + xTranslate + ", " + yTranslate + ") scale(" + scale + ")");
        }
    }
};

sptv.helpers = {
    quantize: {
       time: d3.scale.quantize()
            .domain([1000, 2800])
            .range(d3.range(9).map(function(v) { return "q" + v + "-9";})),

       count: d3.scale.quantize()
            .domain([1, 13.5])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9";})),
        
        density: d3.scale.quantize()
            .domain([0, 1.6])
            .range(d3.range(9).map(function(i) { return "q" + i + "-9";}))
    },

    showLayer: function (){
        var layer = sptv.activeLayer.base;
        var muni = $('.municipality > path');
        var elem;
        var id;
        for(var i = 0, l = muni.length; i<l; i++){
            elem = $(muni[i]);
            id = parseInt(elem.attr("id").substr(5, elem.attr("id").length));
            elem.children("title").text(layer.tooltip(id));  
            elem.attr("class", layer.rate(id));  
        }
        $("svg").html($("svg").html());
        sptv.helpers.labelKey(sptv.activeLayer.base.mode);
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
        var modes = {
            time : ['10:00-11:59', '12:00-13:59', '14:00-15:59', '16:00-17:59', '18:00-19:59', '20:00-21:59','22:00-23:59', '00:00-01:59', '02:00-03:59'],
            log : [1,4,16,65,260,1043,4188,16815,67508],
            density : ['0-0.2','0.21-0.4','0.41-0.6','0.61-0.8','0.81-1','1.01-1.2','1.21-1.4','1.41-1.6','>1.6']
        };
        var keys = $('#key > .panel > .panel-body > p > small');
        var keyTitle = $('#key > .panel > .panel-heading > h3');
        
        keyTitle.text(sptv.activeLayer.base.cl);
        
        var m = modes[mode];

        for(var i=0; i<keys.length;i++){
                $(keys[i]).text(m[i]); 
        }
    },

    showTime: function (time){
        if(isNaN(time)){
            return 'No Data';   
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