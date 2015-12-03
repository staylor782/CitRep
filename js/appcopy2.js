var app = angular.module('CitRep', ['ui.router', 'firebase', 'ngMaterial']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue-grey', {
            'default': '500', // by default use shade 400 from the palette for primary intentions
            'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
            'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
            'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
        })
        .accentPalette('light-blue');
});

app.constant('fb', {
    //Firebase URL goes here
});

var width = 975,
    height = 799,
    centered;
    //active = d3.select(null);

var projection = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .scale(375)
    .clipAngle(90)
    .precision(.1);

var path = d3.geo.path().projection(projection);

var svg = d3.select("#map").append("svg").attr({width: width, height: height});

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
//    
//    if (active.node() === this) return reset();
//  active.classed("active", false);
//  active = d3.select(this).classed("active", true);
//
//  var bounds = path.bounds(d),
//      dx = bounds[1][0] - bounds[0][0],
//      dy = bounds[1][1] - bounds[0][1],
//      x = (bounds[0][0] + bounds[1][0]) / 2,
//      y = (bounds[0][1] + bounds[1][1]) / 2,
//      scale = .9 / Math.max(dx / width, dy / height),
//      translate = [width / 2 - scale * x, height / 2 - scale * y];
//
//  g.transition()
//      .duration(750)
//      .call(zoom.translate(translate).scale(scale).event);
//}
//
//function reset() {
//  active.classed("active", false);
//  active = d3.select(null);
//
//  svg.transition()
//      .duration(750)
//      .call(zoom.translate([0, 0]).scale(1).event);
//}

function zoomed() {
  g.style("stroke-width", 1.5 / d3.event.scale + "px");
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

//d3.json("data/worldCountries.json", function(collection) {
//    svg.selectAll("path")
//        .data(collection.features)
//        .enter()
//        .append("path")
//        .attr("d", path)
//        .attr("class", "country")
//        .attr("fill", "black")
//        .attr("stroke", "white")
//        .attr("stroke-width", ".75px");
//});

//jbodilytm@gmail.com