var app = angular.module('CitRep', ["ui.router", "firebase"]);


app.constant('fb', {
    //Firebase URL goes here
});
var width = 1200;
var height = 800;
var active = d3.select(null);

//var projection = d3.geo.orthographic().scale(380).translate([width/2, height/2]).clipAngle(90);
var projection = d3.geo.mercator().scale(1000).translate([width/2, height/2]);

var path = d3.geo.path().projection(projection);

var zoom = d3.behavior.zoom().translate([0, 0]).scale(1).scaleExtent([1, 8]).on("zoom", zoomed);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

svg.append("rect").attr("class", "background").attr("width", width).attr("height", height).on("click", reset);

var gr = svg.append("gr");

svg.call(zoom).call(zoom.event);

d3.json("data/worldCountries.json", function(error, collection) {
    if (error) {
        throw error;
    }
    gr.selectAll("features").data(collection.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "feature")
    .on("click", clicked);
    
    //Needs TopoJSON
    //gr.append("path").datum()
});

function clicked(d) {
    if (active.node() === this) {
        return reset();
    }
    active.classed("active", false);
    active = d3.select(this).classed("active", true);
    
    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = .9 / Math.max(dx / width, dy / height),
        translate = [width / 2 - scale * x, height / 2 - scale * y];
    
    svg.transition().duration(750).call(zoom.translate([0, 0]).scale(1).event);
}

function reset() {
    active.classed("active", false);
    active = d3.select(null);

    svg.transition()
        .duration(750)
        .call(zoom.translate([0, 0]).scale(1).event);
}

function zoomed() {
    gr.style("stroke-width", 1.5 / d3.event.scale + "px");
    gr.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}