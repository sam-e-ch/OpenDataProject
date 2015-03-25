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
            $('.cantons').attr('display', 'none');
            if ($('.municipalities').attr('display'))
                $('.municipalities').removeAttr('display');            
        } else if (this.value == 'cantons'){
            $('.municipalities').attr('display', 'none');
            if ($('.cantons').attr('display'))
                $('.cantons').removeAttr('display');
        } else {
            $('.municipalities').attr('display', 'none');
            $('.cantons').attr('display', 'none');
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
    var rateCanton = d3.map();

    var quantize = d3.scale.quantize()
        .domain([900, 2800])
        .range(d3.range(9).map(function(i) { return "q" + i + "-9";}));
    
    
    d3.json("data/avg.json", function(d) { 
        for(var i = 0; i<d.length; i++){
            rateMunicipality.set(d[i].id, +d[i].avg);
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
            .text(function(d){return rateMunicipality.get(d.id);});
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
            .text(function(d){return rateCanton.get(d.id);});
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