var app = angular.module('CitRep');

app.controller('mapsCtrl', function($scope) {
    //Create an array with the map selections and their file paths to pass into the d3.json method
    
var width = 975,
    height = 799,
    sens = 0.25,
    centered,
    focused;

var projection = d3.geo.orthographic()
    .translate([width / 2, height / 2])
    .scale(375)
    .rotate([0, 0])
    .clipAngle(90)
    .precision(.1);

var path = d3.geo.path().projection(projection);

var svg = d3.select("#map").append("svg").attr({width: width, height: height});

var countryTooltip = d3.select("#map").append("div").attr("class", "countryTooltip"),
    //appending the country selection box to the search section instead of the map section:
    countryList = d3.select("#search").append("select").attr("name", "countries");

queue().defer(d3.json, "data/worldCountriesEdited.json").await(ready);

function ready(error, worldData) {
    
    var countryById = [],
        countries = worldData.features;
    
    countries.forEach(function(d) {
        countryById.push(d.properties.geounit);
        option = countryList.append("option");
        option.text(d.properties.geounit);
        option.property("value", d.name);
    })
    
    var ocean = svg.append("path")
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
    .on("click", clicked)

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
      countryTooltip.text(d.properties.geounit)
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
                    svg.selectAll("path.land").attr("d", path)
                    .classed("focused", function(d, i) { 
                        return d.properties.geounit == focusedCountry.properties.geounit ? focused = d : false; });
                };
            })
        })();
    });

    function country(arr, sel) {
        for(var i = 0, l = arr.length; i < l; i++) {
            if(arr[i].properties.geounit == sel.value) { return arr[i];}
        }
    };
    
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

        world.selectAll("path")
            .classed("active", centered && function(d) { return d === centered; });

        world.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
        
        ocean.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
    };
};