var app = angular.module('CitRep', ['ui.router', 'firebase', 'ngMaterial']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey', {
            'default': '400', // by default use shade 400 from the palette for primary intentions
            'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
            'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
            'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
        })
        .accentPalette('light-blue');
});

app.constant('fb', {
    //Firebase URL goes here
});

var width = 1000,
    height = 650,
    active = d3.select(null);

//var projection = d3.geo.orthographic()
//    .scale(250)
//    .translate([width / 2, height / 2])
//    .clipAngle(90);

var projection = d3.geo.mercator()
    .scale(175)
    .translate([width / 2, height / 2]);

var zoom = d3.behavior.zoom()
    .translate([0, 0])
    .scale(1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g");

svg
    .call(zoom) // delete this line to disable free zooming as well as click and drag
    .call(zoom.event);

d3.json("data/worldCountries110.json", function(collection) {
//    if (typeof collection.objects.subunits === "undefined") {
//        alert("property is undefined");
//    }
//    console.log(collection.objects.subunits);
//    svg.append("path")
//      .datum(topojson.feature(collection, collection.objects.subunits))
//      .attr("d", path);
    g.selectAll("path")
        .data(topojson.feature(collection, collection.objects.subunits).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "feature")
        .on("click", clicked);

    g.append("path")
        .datum(topojson.mesh(collection, collection.objects.subunits, function(a, b) { return a !== b; }))
        .attr("class", "mesh")
        .attr("d", path);
//    svg.append("path")
//        .datum(topojson.mesh(collection, collection.objects.subunits, function(a, b) { return a !== b; }))
//        .attr("class", "mesh")
//        .attr("d", path);
});

function clicked(d) {
  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

  svg.transition()
      .duration(750)
      .call(zoom.translate(translate).scale(scale).event);
}

function reset() {
  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
}

function zoomed() {
  g.style("stroke-width", 1.5 / d3.event.scale + "px");
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

//jbodilytm@gmail.com