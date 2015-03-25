$(document).ready(function(){
    showMap();
    $('#toggleLakes').click(function(){
        toggleHide($('.lake'));
    });
    
    $('#toggleCantons').click(function(){
        toggleHide($('.canton-boundaries'));
    });
    
    $('#key').draggable({
        containment: "parent",
        handle: ".panel-heading"
    });
    
     $('input[type=radio][name=show]').change(function() {
        if(this.value == 'municipalities'){
            hide($('.cantons'));
            hide($('.lastMunicipalities'));
            unhide($('.municipalities'));        
        } else if (this.value == 'cantons'){
            hide($('.lastMunicipalities'));
            hide($('.municipalities'));
            unhide($('.cantons'));
        } else if (this.value == 'lastMunicipalities'){
            hide($('.municipalities'));
            hide($('.cantons'));
            unhide($('.lastMunicipalities'));
        } else {
            hide($('.municipalities'));
            hide($('.cantons'));
            hide($('.lastMunicipalities'));
        }     
     });
    
    positionKey();
    
    $( window ).resize(function() {
        resize();   
    });
});

function showMap() {
    
    var width = $('#map').width(), height = 500;
    var country = d3.geo.path().projection(null);
    var path = d3.geo.path().projection(null);
    var svg = d3.select("#map").append("svg").attr("width", width).attr("height", height).attr("class", "svg");
    
    var rateMunicipality = d3.map();
    var rateLastMunicipality = d3.map();
    var rateCanton = d3.map();
    
    var municipalityName = d3.map();

    var quantize = d3.scale.quantize()
        .domain([1000, 2800])
        .range(d3.range(9).map(function(i) { return "q" + i + "-9";}));
    
    
    d3.json("data/avg.json", function(d) { 
        for(var i = 0; i<d.length; i++){
            rateMunicipality.set(d[i].id, +d[i].avg);
            municipalityName.set(d[i].id, d[i].name);
        }
    });
    
    d3.json("data/last.json", function(d) { 
        for(var i = 0; i<d.length; i++){
            rateLastMunicipality.set(d[i].id, +d[i].max);
        }
    });
    
    d3.json("data/canton_avg.json", function(d) { 
        for(var i = 0; i<d.length; i++){
            rateCanton.set(d[i].id, +d[i].avg);
        }
    });
    
    
    d3.json("data/ch.json", function(error, ch) {        
        drawCountry(ch);        
        drawMunicipalities(ch);
        drawLastMunicipality(ch);
        drawCantons(ch);                
        drawLakes(ch);   
        drawCantonBorders(ch);
    }); 
    
    function drawCountry(ch){
        svg.append("path").datum(topojson.feature(ch, ch.objects.country))
            .attr("class", "country").attr("d", country);
    }
    
    function drawMunicipalities(ch){
        svg .append("g")
            .attr("class", "municipalities")
            .selectAll("path")
            .data(topojson.feature(ch, ch.objects.municipalities).features)
            .enter().append("path")
            .attr("class", function(d) { return quantize(rateMunicipality.get(d.id)); })
            .attr("d", path)
            .append("title")
            .text(function(d){return municipalityName.get(d.id) + ': ' + showTime(rateMunicipality.get(d.id));});
    }
    
    function drawLastMunicipality(ch){
        svg .append("g")
            .attr("class", "lastMunicipalities")
            .attr("display", "none")
            .selectAll("path")
            .data(topojson.feature(ch, ch.objects.municipalities).features)
            .enter().append("path")
            .attr("class", function(d) { return quantize(rateLastMunicipality.get(d.id)); })
            .attr("d", path)
            .append("title")
            .text(function(d){return municipalityName.get(d.id) + ': ' + showTime(rateLastMunicipality.get(d.id));});
    }
    
    function drawCantons(ch){
        svg .append("g")
            .attr("class", "cantons")
            .attr("display", "none")
            .selectAll("path")
            .data(topojson.feature(ch, ch.objects.cantons).features)
            .enter().append("path")
            .attr("class", function(d) { return quantize(rateCanton.get(d.id)); })
            .attr("d", path)
            .append("title")
            .text(function(d){return showTime(rateCanton.get(d.id));});
    }
    
    function drawLakes(ch){
        svg.append("path").datum(topojson.feature(ch, ch.objects.lakes))
            .attr("class", "lake").attr("d", path);     
    }
    
    function drawCantonBorders(ch){
        svg.append("path")
            .datum(topojson.mesh(ch, ch.objects.cantons, function(a, b) { return a !== b; }))
            .attr("class", "canton-boundaries").attr("d", path);   
    }
}


function toggleHide(cl){    
    if (cl.attr('display'))
        cl.removeAttr('display');
    else cl.attr('display', 'none');
}

function hide(cl){    
    cl.attr('display', 'none');
}

function unhide(cl){    
    if (cl.attr('display'))
        cl.removeAttr('display');
}

function resize(){
    $('svg').width($('#map').width());
    positionKey();
}

function positionKey(){
    var p = $('#map').position();
    $('#key').css({
        top : p.top+5, 
        left: p.left+5
    });
}

function showTime(time){
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