var app = angular.module('CitRep', ["ui.router", "firebase", "ngMaterial"]);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey', {
      'default': '400', // by default use shade 400 from the palette for primary intentions
      'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
      'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
      'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
    });
});

app.constant('fb', {
    //Firebase URL goes here
});

var width = 1200;
var height = 800;

var projection = d3.geo.orthographic().scale(380).translate([width/2, height/2]).clipAngle(90);

var path = d3.geo.path().projection(projection);

var svg = d3.select("#map").append("svg")
.attr("width", width)
.attr("height", height)
.on("mousedown", mouseDown);

var zoom = d3.behavior.zoom().translate([0, 0]).scale(1).scaleExtent([1, 8]).on("zoom", zoomed);

//d3.json("data/worldCountries.json", function(collection) {
//    svg.selectAll("features").data(collection.features)
//    .enter()
//    .append("path")
//    .attr("d", path);
//});

d3.json("data/worldCountries110.json", function(collection) {
//    if (typeof collection.objects.subunits === "undefined") {
//        alert("property is undefined");
//    }
//    console.log(collection.objects.subunits);
    svg.append("path")
        .datum(topojson.feature(collection, collection.objects.subunits))
        .attr("d", path);
});

var mouse0, origin0;

d3.select(window)
    .on("mousemove", mouseMove)
    .on("mouseup", mouseUp);

function mouseDown() {
    mouse0 = [d3.event.pageX, d3.event.pageY];
    origin0 = projection.origin();
    d3.event.preventDefault();
};

function mouseMove() {
    if (mouse0) {
        var mouse1 = [d3.event.pageX, d3.event.pageY];
        var origin1 = [origin0[0] + (mouse0[0] - mouse1[0]) / 8, origin0[1] + (mouse1[1] - mouse0[1]) / 8];
        projection.origin(origin1);
        //circle.origin(origin1);
        //refresh();
    }
};

function mouseUp() {
    if (mouse0) {
        mouseMove();
        m0 = null;
    }
};

function refresh(duration) {
    (duration ? feature.transition().duration(duration) : feature).attr("d", clip);
};

function zoomed() {
  svg.style("stroke-width", 1.5 / d3.event.scale + "px");
  svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
};

function clip(d) {
  return path(circle.clip(d));
};