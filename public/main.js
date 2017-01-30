(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _d = require('d3');

var _settings = require('./settings');

var SVGLinks = _settings.svg.append("g").selectAll(".link"),
    SVGNodes = _settings.svg.append("g").selectAll(".node");

(0, _d.json)("data/prelim.json", function (error, companies) {

  if (error) {
    throw error;
  };

  var hier = packageHierarchy(companies);
  var nodes = _settings.cluster.nodes(hier);
  var links = packageImports(nodes, companies);

  SVGLinks = SVGLinks.data((0, _settings.bundle)(links)).enter().append("path").each(function (d) {
    d.source = d[0];
    d.target = d[d.length - 1];
  }).attr("class", "link").attr("d", _settings.line);

  SVGNodes = SVGNodes.data(nodes).enter().append("text").attr("class", "node").attr("dy", ".31em").attr("transform", function (d) {
    return 'rotate(' + (d.x - 90) + ')translate(' + (d.y + 2) + ',0)' + (d.x < 180 ? "" : "rotate(180)");
  }).style("text-anchor", function (d) {
    return d.x < 180 ? "start" : "end";
  }).text(function (d) {
    return d.name;
  }).on("mouseover", mouseovered).on("mouseout", mouseouted);
});

function mouseovered(d) {
  SVGNodes.each(function (n) {
    n.target = n.source = false;
  });

  SVGLinks.classed("link--target", function (l) {
    if (l.target === d) return l.source.source = true;
  }).classed("link--source", function (l) {
    if (l.source === d) return l.target.target = true;
  }).classed("link--faded", function (l) {
    return l.target !== d && l.source !== d;
  }).filter(function (l) {
    return l.target === d || l.source === d;
  }).each(function () {
    this.parentNode.appendChild(this);
  });

  SVGNodes.classed("node--target", function (n) {
    return n.target;
  }).classed("node--source", function (n) {
    return n.source;
  });
}

function mouseouted(d) {
  SVGLinks.classed("link--target", false).classed("link--source", false).classed("link--faded", false);

  SVGNodes.classed("node--target", false).classed("node--source", false);
}

(0, _d.select)(self.frameElement).style("height", _settings.diameter + 'px');

// Lazily construct the package hierarchy from class names.
function packageHierarchy(companies) {
  var map = companies.reduce(function (acc, el) {
    acc[""].children.push({ name: el.name });
    return acc;
  }, { "": { name: "", children: [] } });

  return map[""];
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes, companies) {
  var map = {};
  var links = [];

  // Compute a map from name to node.
  nodes.forEach(function (d) {
    map[d.name] = d;
  });

  // For each import, construct a link from the source to target node.
  var keys = ["mentoredBy", "foundedBy", "investedBy", "acquiredBy", "partneredWith"];

  companies.forEach(function (company) {
    keys.forEach(function (key) {
      if (company[key]) {
        company[key].forEach(function (rel) {
          links.push({ source: map[company.name], target: map[rel] });
        });
      }
    });
  });

  return links;
}


},{"./settings":2,"d3":"d3"}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
                      value: true
});
exports.svg = exports.line = exports.bundle = exports.cluster = exports.innerRadius = exports.radius = exports.diameter = undefined;

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var diameter = exports.diameter = 720;
var radius = exports.radius = diameter / 2;
var innerRadius = exports.innerRadius = radius - 120;

var cluster = exports.cluster = d3.layout.cluster().size([360, innerRadius]).value(function (d) {
                      return d.size;
});

var bundle = exports.bundle = d3.layout.bundle();

var line = exports.line = d3.svg.line.radial().interpolate("bundle").tension(.85).radius(function (d) {
                      return d.y;
}).angle(function (d) {
                      return d.x / 180 * Math.PI;
});

var svg = exports.svg = d3.select("body").append("svg").attr("width", window.innerWidth).attr("height", diameter).append("g").attr("transform", "translate(" + window.innerWidth / 2 + "," + radius + ")");


},{"d3":"d3"}]},{},[1]);
