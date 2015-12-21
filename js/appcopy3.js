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

//Side Menu code: put in it's own file
//app.controller('mapMenuCtrl', function($scope, $mdSidenav) {
//    
//    $scope.toggleLeft = buildToggler('left');
//    $scope.isOpenLeft = function() {
//        return $mdSidenav('left').isOpen();
//    };    
//    
//    function buildToggler(navID) {
//        return function() {
//            $mdSidenav(navID)
//            .toggle();
//        }
//    };
//    
//    $scope.close = function () {
//        $mdSidenav('right').close();
//    };
//});

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

//svg.append("path")
//    .datum({type: "Sphere"})
//    .attr("class", "water")
//    .attr("d", path);

var countryTooltip = d3.select("#map").append("div").attr("class", "countryTooltip"),
    //appending the country selection box to the search section instead of the map section:
    countryList = d3.select("#search").append("select").attr("name", "countries");

queue().defer(d3.json, "data/worldCountriesEdited.json").await(ready);

//
//function clicked(d) {
//    var x, y, k;
//    
//    if (d && centered !== d) {
//        var centroid = path.centroid(d);
//        x = centroid[0];
//        y = centroid[1];
//        k = 4;
//        centered = d;
//  } else {
//      x = width / 2;
//      y = height / 2;
//      k = 1;
//      centered = null;
//  }
//
//  svg.selectAll("path.land")
//      .classed("active", centered && function(d) { return d === centered; });
//
//  svg.transition()
//      .duration(750)
//      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
//      .style("stroke-width", 1.5 / k + "px");
//};
//
//function zoomed() {
//    svg.style("stroke-width", 1.5 / d3.event.scale + "px");
//    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
//}

function ready(error, worldData) {
    
    //"use strict";
    //console.log(worldData.features[0].properties.geounit);
    
//    var zoom = d3.behavior.zoom()
//        .scaleExtent([1, 9])
//        .on("zoom", zoomed);
    
    var countryById = [],
        countries = worldData.features;
    
//    var countryById = {},
//        countries = worldData.features;

    //Adding countries to select
//    for (var i = 0; i < countries.length; i++) {
//        countryById[i].name = countries[i].properties.geounit;
//        option = countryList.append("option");
//        option.text(countryById[i].name);
//        option.property("value", countryById[i].name);
//    }
    
    //console.log(countries);
    
    countries.forEach(function(d) {
        countryById.push(d.properties.geounit);
        option = countryList.append("option");
        option.text(d.properties.geounit);
        option.property("value", d.name);
    })

//    countries.forEach(function(d) {
//        console.log(d);
//      countryById[d.name] = d.properties.geounit;
//      option = countryList.append("option");
//      option.text(d.properties.geounit);
//      option.property("value", d.name);
//    });
    
    //console.log(countryById);

    
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
    
    //Zoom event
//    .call(zoom)
//    .call(d3.behavior.zoom()
//        .translate([0, 0])
//        .scale(1)
//        .scaleExtent([1, 8])
//        .on("zoom", function() {
//            svg.style("stroke-width", 1.5 / d3.event.scale + "px");
//            svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
//        })
//    )
    
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
    
    //Works, but shifts the globe and doesn't move the water as well
//    function zoomed() {
//        var t = d3.event.translate;
//        var s = d3.event.scale; 
//        zscale = s;
//        var h = height/4;
//
//        t[0] = Math.min(
//            (width/height)  * (s - 1), 
//            Math.max( width * (1 - s), t[0] )
//        );
//
//        t[1] = Math.min(
//            h * (s - 1) + h * s, 
//            Math.max(height  * (1 - s) - h * s, t[1])
//        );
//
//        zoom.translate(t);
//        world.attr("transform", "translate(" + t + ")scale(" + s + ")");
////        ocean.attr("transform", "translate(" + t + ")scale(" + s + ")");
//
//            //adjust the country hover stroke width based on zoom level
//        d3.selectAll(".country").style("stroke-width", 1.5 / s);
////        world.style("stroke-width", 1.5 / d3.event.scale + "px");
////        world.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
////        ocean.style("stroke-width", 1.5 / d3.event.scale + "px");
////        ocean.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
//    };
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
//            .style("stroke-width", 1.5 / k + "px");
        ocean.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");
    };
};
