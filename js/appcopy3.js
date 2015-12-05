var app = angular.module('CitRep', ['ui.router', 'firebase', 'ngMaterial']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('blue', {
            'default': '900', // by default use shade 400 from the palette for primary intentions
            'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
            'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
            'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
        })
        .accentPalette('blue-grey');
});

app.constant('fb', {
    //Firebase URL goes here
});

var width = 975,
    height = 799,
    sens = 0.25,
    focused;

var projection = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .scale(375)
    .rotate([0, 0])
    .clipAngle(90)
    .precision(.1);

var path = d3.geo.path().projection(projection);

var svg = d3.select("#map").append("svg").attr({width: width, height: height});

svg.append("path")
    .datum({type: "Sphere"})
    .attr("class", "water")
    .attr("d", path);

var countryTooltip = d3.select("#map").append("div").attr("class", "countryTooltip"),
  countryList = d3.select("#map").append("select").attr("name", "countries");

queue().defer(d3.json, "data/worldCountries.json").await(ready);

function ready(error, worldData) {
    
    //console.log(worldData.features[0].properties.geounit);
    
    var countryById = {},
        countries = worldData.features;

    //Adding countries to select

    countries.forEach(function(d) {
      countryById[d.id] = d.properties.geounit;
      option = countryList.append("option");
      option.text(d.name);
      option.property("value", d.id);
    });

    
    var ocean =     svg.append("path")
        .datum({type: "Sphere"})
        .attr("class", "water")
        .attr("d", path)
        .call(d3.behavior.drag()
        .origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
        .on("drag", function() {
            var rotate = projection.rotate();
            projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
            svg.selectAll("path.land").attr("d", path);
            svg.selectAll(".focused").classed("focused", focused = false);
    }));
    //Drawing countries on the globe

    var world = svg.selectAll("path.land")
    .data(countries)
    .enter().append("path")
    .attr("class", "land")
    .attr("d", path)

    //Drag event

    .call(d3.behavior.drag()
        .origin(function() { var r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
        .on("drag", function() {
            var rotate = projection.rotate();
            projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
            svg.selectAll("path.land").attr("d", path);
            svg.selectAll(".focused").classed("focused", focused = false);
        })
    )
    
    //Mouse events

    .on("mouseover", function(d) {
      countryTooltip.text(countryById[d.id])
      .style("left", (d3.event.pageX + 7) + "px")
      .style("top", (d3.event.pageY - 15) + "px")
      .style("display", "block")
      .style("opacity", 1);
    })
    .on("mouseout", function(d) {
      countryTooltip.style("opacity", 0)
      .style("display", "none");
    })
    .on("mousemove", function(d) {
      countryTooltip.style("left", (d3.event.pageX + 7) + "px")
      .style("top", (d3.event.pageY - 15) + "px");
    });

    //Country focus on option select

    d3.select("select").on("change", function() {
      var rotate = projection.rotate(),
      focusedCountry = country(countries, this),
      p = d3.geo.centroid(focusedCountry);

      svg.selectAll(".focused").classed("focused", focused = false);
        
    //Globe rotating

    (function transition() {
      d3.transition()
      .duration(2500)
      .tween("rotate", function() {
        var r = d3.interpolate(projection.rotate(), [-p[0], -p[1]]);
        return function(t) {
          projection.rotate(r(t));
          svg.selectAll("path").attr("d", path)
          .classed("focused", function(d, i) { return d.id == focusedCountry.id ? focused = d : false; });
        };
      })
      })();
    });

    function country(cnt, sel) { 
      for(var i = 0, l = cnt.length; i < l; i++) {
        if(cnt[i].id == sel.value) {return cnt[i];}
      }
    };    
};
