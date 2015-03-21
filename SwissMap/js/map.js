$(document).ready(function(){
    showMap();
    $('#toggleLakes').click(function(){
        toggleHide($('.lake'));
    });
    
    $('#toggleCantons').click(function(){
        toggleHide($('.cantons'));
    });
    
    $('#toggleMunicipals').click(function(){
        toggleHide($('.municipalities'));
    });
    
    $('#key').draggable({
        containment: "parent",
        handle: ".panel-heading"
    });
    
     $('input[type=radio][name=show]').change(function() {
        if(this.value == 'municipalities'){
            $('.cantons').attr('opacity', 0);
            if ($('.municipalities').attr('opacity'))
                $('.municipalities').removeAttr('opacity');
            
        } else if (this.value == 'cantons'){
            $('.municipalities').attr('opacity', 0);
            if ($('.cantons').attr('opacity'))
                $('.cantons').removeAttr('opacity');
        } else {
            $('.municipalities').attr('opacity', 0);
            $('.cantons').attr('opacity', 0);
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
    
    var rateById = d3.map();
    var rateCanton = d3.map();

    var quantize = d3.scale.quantize()
        .domain([900, 2800])
        .range(d3.range(9).map(function(i) { return "q" + i + "-9";}));
    
    
    d3.json("data/avg.json", function(d) { 
        for(var i = 0; i<d.length; i++){
            rateById.set(d[i].id, +d[i].avg);
        }
    });
    
    d3.json("data/canton_avg.json", function(d) { 
        for(var i = 0; i<d.length; i++){
            rateCanton.set(d[i].id, +d[i].avg);
        }
    });
    
    
    d3.json("data/topo/ch.json", function(error, ch) {
        
        svg.append("path").datum(topojson.feature(ch, ch.objects.country))
            .attr("class", "country").attr("d", country);
        
        svg.append("g")
          .attr("class", "municipalities")
        .selectAll("path")
          .data(topojson.feature(ch, ch.objects.municipalities).features)
        .enter().append("path")
          .attr("class", function(d) { return quantize(rateById.get(d.id)); })
          .attr("d", path);
        
        svg.append("g")
          .attr("class", "cantons")
        .attr("opacity", "0")
        .selectAll("path")
          .data(topojson.feature(ch, ch.objects.cantons).features)
        .enter().append("path")
          .attr("class", function(d) { return quantize(rateCanton.get(d.id)); })
          .attr("d", path);
                
        svg.append("path").datum(topojson.feature(ch, ch.objects.lakes))
            .attr("class", "lake").attr("d", path);        
        
        svg.append("path")
            .datum(topojson.mesh(ch, ch.objects.municipalities, function(a, b) { return a !== b; }))
            .attr("class", "municipality-boundaries").attr("d", path);
        
        svg.append("path")
            .datum(topojson.mesh(ch, ch.objects.cantons, function(a, b) { return a !== b; }))
            .attr("class", "canton-boundaries").attr("d", path);

    }); 
}

function toggleHide(cl){
    if (cl.attr('opacity'))
        cl.removeAttr('opacity');
    else cl.attr('opacity', 0);
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