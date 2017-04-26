(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _settings = require('./settings');

var _d = require('d3');

var drawDonut = function drawDonut(el) {
  var wrapper = el.append('g');

  var arc = _d.svg.arc().outerRadius(_settings.innerRadius + 200).innerRadius(_settings.innerRadius);

  var pie = _d.layout.pie();

  var g = wrapper.selectAll('g').data(pie([1, 2, 3, 5])).enter().append('g');

  g.append("path").attr("d", arc).style('fill', function () {
    return 'rgba(' + Math.floor(Math.random() * 200) + ',' + Math.floor(Math.random() * 200) + ',' + Math.floor(Math.random() * 200) + ',0.4)';
  });
  g.append('text').attr("transform", function (d) {
    return 'translate(' + arc.centroid(d) + ')';
  }).attr("dy", ".35em").text(function (d) {
    return "Hello";
  });;
};

exports.default = drawDonut;


},{"./settings":3,"d3":"d3"}],2:[function(require,module,exports){
'use strict';

var _d = require('d3');

var _settings = require('./settings');

var _donut = require('./donut');

var _donut2 = _interopRequireDefault(_donut);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _donut2.default)(_settings.svg);

var SVGLinks = _settings.svg.append("g").selectAll(".link");
var SVGNodes = _settings.svg.append("g").selectAll(".node");
var mappedRelationships = {};

// Get Data
(0, _d.json)("data/autotech.json", function (error, companies) {
  if (error) {
    throw error;
  };

  mappedRelationships = companies.reduce(function (acc, company) {
    acc[company.name] = company;
    return acc;
  }, mappedRelationships);

  var hier = packageHierarchy(companies);
  var nodes = _settings.cluster.nodes(hier);
  var links = packageImports(nodes, companies);

  SVGLinks = SVGLinks.data((0, _settings.bundle)(links)).enter().append("path").each(function (d) {
    d.source = d[0];
    d.target = d[d.length - 1];
  }).attr("class", "link").attr("d", _settings.line);

  SVGNodes = SVGNodes.data(nodes).enter().append("text").attr("class", "node").attr("dy", ".31em").attr("transform", function (d) {
    return 'rotate(' + (d.x - 90) + '), translate(' + (d.y + 2) + ',0)' + (d.x < 180 ? "" : "rotate(180)");
  }).style("text-anchor", function (d) {
    return d.x < 180 ? "start" : "end";
  }).text(function (d) {
    return d.name;
  }).classed("node--bolded", function (d) {
    return _settings.boldedCompanies.includes(d.name);
  }).on("mouseover", hoverAction).on("mouseout", removeHoverAction);
});

function hoverAction(d) {
  var _this = this;

  SVGNodes.each(function (n) {
    n.target = n.source = false;
  });

  var relationships = ["mentoredBy", "foundedBy", "investedBy", "acquiredBy", "partneredWith", "mentors", "founded", "investedIn", "acquired"];

  relationships.forEach(function (rel) {
    SVGNodes.classed("node--faded", function (node) {
      return !(mappedRelationships[d.name][rel] && mappedRelationships[d.name][rel].includes(node.name));
    });
    SVGLinks.classed('link--' + rel, function (path) {
      if (path.target !== d && path.source !== d) {
        return false;
      }
      return mappedRelationships[d.name][rel] && (mappedRelationships[d.name][rel].includes(path.source.name) || mappedRelationships[d.name][rel].includes(path.target.name));
    });
    SVGNodes.classed('node--' + rel, function (n) {
      return mappedRelationships[d.name][rel] && mappedRelationships[d.name][rel].includes(n.name);
    });
  });

  SVGLinks.classed("link--faded", function (l) {
    return l.target !== d && l.source !== d;
  }).filter(function (l) {
    return l.target === d || l.source === d;
  }).each(function () {
    _this.parentNode.appendChild(_this);
  });
}

function removeHoverAction(d) {
  var relationships = ["mentoredBy", "foundedBy", "investedBy", "acquiredBy", "partneredWith", "mentors", "founded", "investedIn", "acquired"];

  relationships.forEach(function (rel) {
    SVGLinks.classed('link--' + rel, false);
    SVGNodes.classed('node--' + rel, false);
  });

  SVGLinks.classed("link--faded", false);
  SVGNodes.classed("node--faded", false);
}

(0, _d.select)(self.frameElement).style("height", _settings.diameter + 'px');

// Lazily construct the package hierarchy from class names.
function packageHierarchy(companies) {
  var map = companies.reduce(function (acc, el) {
    acc[""].children.push({ name: el.name, parent: acc[""] });
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

  // use one directional keys to avoid double linking btn two endpoints
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


},{"./donut":1,"./settings":3,"d3":"d3"}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.boldedCompanies = exports.svg = exports.line = exports.bundle = exports.cluster = exports.innerRadius = exports.radius = exports.diameter = undefined;

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var diameter = exports.diameter = 720;
var radius = exports.radius = diameter / 2;
var innerRadius = exports.innerRadius = radius - 120;
var svgWidth = document.body.clientWidth > diameter + 280 ? document.body.clientWidth : diameter + 280;

var cluster = exports.cluster = d3.layout.cluster().size([360, innerRadius]).value(function (d) {
  return d.size;
});

var bundle = exports.bundle = d3.layout.bundle();

var line = exports.line = d3.svg.line.radial().interpolate("bundle").tension(.85).radius(function (d) {
  return d.y;
}).angle(function (d) {
  return d.x / 180 * Math.PI;
});

var svg = exports.svg = d3.select(".autotech-wheel").append("svg").attr("width", svgWidth).attr("height", diameter + 200).append("g").attr("transform", "translate(" + (svgWidth / 2 + 100) + "," + (radius + 100) + ")");

var boldedCompanies = exports.boldedCompanies = ["Volkswagen Group", "Daimler", "BMW", "Schaeffler", "Robert Bosch", "Sixt"];


},{"d3":"d3"}]},{},[2]);
