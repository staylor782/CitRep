var app = angular.module('CitRep');

app.controller('mapsCtrl', function($scope) {
    //Create an array with the map selections and their file paths to pass into the d3.json method

    console.log('hello');
    
var width = 975,
    height = 800,
    centered;
    //active = d3.select(null);

var projection = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .scale(375)
    .clipAngle(90)
    .precision(.1);

var path = d3.geo.path().projection(projection);

var svg = d3.select("#map").append("svg").attr({width: width, height: height});

var tooltip = d3.select("#map").append("div").attr("class", "tooltip hidden");

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", clicked);

var g = svg.append("g");

//svg.call(zoom).call(zoom.event);

d3.json("data/worldCountries.json", function(collection) {
    g.selectAll("path")
        .data(collection.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", "gray")
//        .attr("stroke", "white")
//        .attr("stroke-width", ".75px")
        .on("click", clicked);
});

var zoom = d3.behavior.zoom()
    .scaleExtent([1, 9])
    .on("zoom", zoomed);

function clicked(d) {
    var x, y, k;
    
    if (d && centered !== d) {
        var centroid = path.centroid(d);
        x = centroid[0];
        y = centroid[1];
        k = 4;
        centered = d;
  } else {
      x = width / 2;
      y = height / 2;
      k = 1;
      centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
};

function zoomed() {
    g.style("stroke-width", 1.5 / d3.event.scale + "px");
    g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
};
});