(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _settings = require('./settings');

var _d = require('d3');

var drawDonut = function drawDonut(el, data) {
  var wrapper = el.insert('g', ':first-child').attr('class', 'industry');
  var colours = ['rgba(143, 232, 149, 0.08)', 'rgba(54, 133, 214, 0.08)', 'rgba(95, 1, 185, 0.08)'];
  var arc = _d.svg.arc().outerRadius(_settings.innerRadius + 180).innerRadius(_settings.innerRadius);

  var pie = _d.layout.pie().sort(null).value(function (d) {
    return d.count;
  });

  var g = wrapper.selectAll('g').data(pie(data)).enter().append('g').attr('class', 'industry__section');

  g.append("path").attr("d", arc).style('fill', function (d, i) {
    return colours[i % colours.length];
  });
  g.append('text').attr('class', 'industry__text').attr("x", function (d) {
    var c = arc.centroid(d),
        x = c[0],
        y = c[1],

    // pythagorean theorem for hypotenuse
    h = Math.sqrt(x * x + y * y);
    return x / h * (_settings.innerRadius + 180);
  }).attr("y", function (d) {
    var c = arc.centroid(d),
        x = c[0],
        y = c[1],

    // pythagorean theorem for hypotenuse
    h = Math.sqrt(x * x + y * y);
    return y / h * (_settings.innerRadius + 180);
  }).text(function (d) {
    return _settings.industryIcons[d.data.industry];
  });
};

exports.default = drawDonut;


},{"./settings":3,"d3":"d3"}],2:[function(require,module,exports){
'use strict';

var _d = require('d3');

var _settings = require('./settings');

var _utils = require('./utils');

var _donut = require('./donut');

var _donut2 = _interopRequireDefault(_donut);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  // get industry data
  var industries = [];
  var industriesCount = companies.reduce((0, _utils.aggregateIndustries)(industries), []);
  industriesCount.sort((0, _utils.sortAsc)('industry'));

  (0, _donut2.default)(_settings.svg, industriesCount);

  // First sort the company list before doing anything
  companies.sort((0, _utils.sortAsc)('industry'));

  var hier = packageHierarchy(companies);
  var nodes = _settings.cluster.nodes(hier);
  var links = packageImports(nodes, companies);

  SVGLinks = SVGLinks.data((0, _settings.bundle)(links)).enter().append("path").each(function (d) {
    d.source = d[0];
    d.target = d[d.length - 1];
  }).attr("class", "link").attr("d", _settings.line);

  SVGNodes = SVGNodes.data(nodes).enter().append("text").attr("class", "node").attr("dy", ".1em").attr('dx', '.2em').attr("transform", function (d) {
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


},{"./donut":1,"./settings":3,"./utils":4,"d3":"d3"}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.industryIcons = exports.boldedCompanies = exports.svg = exports.line = exports.bundle = exports.cluster = exports.innerRadius = exports.radius = exports.diameter = undefined;

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var diameter = exports.diameter = 720;
var radius = exports.radius = diameter / 2;
var innerRadius = exports.innerRadius = radius - 120;
var svgWidth = document.body.clientWidth > diameter + 280 ? document.body.clientWidth : diameter + 280;

var cluster = exports.cluster = d3.layout.cluster().size([radius, innerRadius]).value(function (d) {
  return d.size;
});

var bundle = exports.bundle = d3.layout.bundle();

var line = exports.line = d3.svg.line.radial().interpolate("bundle").tension(.85).radius(function (d) {
  return d.y;
}).angle(function (d) {
  return d.x / 180 * Math.PI;
});

var svg = exports.svg = d3.select(".wheel").append("svg").attr("width", svgWidth).attr("height", diameter + 200).append("g").attr("transform", "translate(" + (svgWidth / 2 + 100) + "," + (radius + 100) + ")");

var boldedCompanies = exports.boldedCompanies = ["Volkswagen Group", "Daimler", "BMW", "Schaeffler", "Robert Bosch", "Sixt"];

var industryIcons = exports.industryIcons = {
  "Automakers, Trucks & Buses": "\uF0D1",
  "Electric Vehicles & Connected Cars": "\uF0E7",
  "Computer Software & Computer Vision": "\uF109",
  "Miscellaneous": "\uF29C",
  "Mapping & Location Services": "\uF124",
  "Car Hailing & Sharing": "\uF087",
  "VCs, Accelerators & Incubators": "\uF0D6",
  "Mobility": "\uF06E",
  "Rentals & Marketplaces": "\uF291"
};


},{"d3":"d3"}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var sortAsc = exports.sortAsc = function sortAsc(prop) {
  return function (a, b) {
    // https://github.com/d3/d3-3.x-api-reference/blob/master/Arrays.md#d3_ascending
    return a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : a[prop] >= b[prop] ? 0 : NaN;
  };
};

var aggregateIndustries = exports.aggregateIndustries = function aggregateIndustries(industries) {
  return function (acc, curr) {
    if (industries.includes(curr.industry)) {
      acc[industries.indexOf(curr.industry)].count++;
    } else {
      industries.push(curr.industry);
      acc.push({
        industry: curr.industry,
        count: 1
      });
    }
    return acc;
  };
};


},{}]},{},[2]);
