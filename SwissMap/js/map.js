$(document).ready(function(){
    showMap();
    $('#toggleLakes').click(function(){
        toggleHide($('.lake'));
    });
    
    $('#toggleCantons').click(function(){
        toggleHide($('.canton-boundaries'));
    });
    
    $('#toggleMunicipals').click(function(){
        toggleHide($('.municipality-boundaries'));
    });
    
    $( window ).resize(function() {
        resize();   
    });
});

function showMap() {    
    var width = $('#map').width(), height = 500;
    var country = d3.geo.path().projection(null);
    var path = d3.geo.path().projection(null);
    var svg = d3.select("#map").append("svg").attr("width", width).attr("height", height).attr("class", "svg");

    //Objects: {municipalities, cantons, districts, country, lakes}
    d3.json("topo/ch.json", function(error, ch) {
        svg.append("path").datum(topojson.feature(ch, ch.objects.country))
            .attr("class", "country").attr("d", country);
        
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
}