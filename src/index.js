import {
  json as getJSON,
  select
} from 'd3';
import {
  diameter,
  radius,
  innerRadius,
  svg,
  cluster,
  bundle,
  line
} from './settings';

let SVGLinks = svg.append("g").selectAll(".link");
let SVGNodes = svg.append("g").selectAll(".node");
let mappedRelationships = {};

getJSON("data/prelim.json", function(error, companies) {

  if (error) {
    throw error
  };
  mappedRelationships = companies.reduce((acc, company) => {
    acc[company.name] = company;
    return acc;
  }, mappedRelationships);
  const hier = packageHierarchy(companies);
  const nodes = cluster.nodes(hier);
  const links = packageImports(nodes, companies);

  SVGLinks = SVGLinks.data(bundle(links))
        .enter().append("path")
        .each(function(d) {
          d.source = d[0];
          d.target = d[d.length - 1];
        })
        .attr("class", "link")
        .attr("d", line);

  SVGNodes = SVGNodes.data(nodes)
          .enter().append("text")
          .attr("class", "node")
          .attr("dy", ".31em")
          .attr("transform", function(d) {
            return `rotate(${ (d.x - 90) })translate(${ (d.y + 2) },0)${ d.x < 180 ? "" : "rotate(180)" }`;
          })
          .style("text-anchor", function(d) {
            return d.x < 180 ? "start" : "end";
          })
          .text(function(d) {return d.name; })
          .on("mouseover", mouseovered)
          .on("mouseout", mouseouted);
});


function mouseovered(d) {
  SVGNodes.each(function(n) { n.target = n.source = false; })

  const relationships = ["mentoredBy", "foundedBy", "investedBy", "acquiredBy", "partneredWith", "mentors", "founded", "investedIn", "acquired"];

  relationships.forEach((rel) => {
    SVGLinks.classed(`link--${rel}`, function(path) {
      return (mappedRelationships[d.name][rel] && (mappedRelationships[d.name][rel].includes(path.source.name) || mappedRelationships[d.name][rel].includes(path.target.name)));
    });
    SVGNodes.classed(`node--${rel}`, function(n) {
      return (mappedRelationships[d.name][rel] && mappedRelationships[d.name][rel].includes(n.name));
    });
  });

  SVGLinks.classed("link--faded", function(l){return l.target !== d && l.source !== d })
      .filter(function(l) { return l.target === d || l.source === d; })
      .each(function() { this.parentNode.appendChild(this); });
}

function mouseouted(d) {
  const relationships = ["mentoredBy", "foundedBy", "investedBy", "acquiredBy", "partneredWith", "mentors", "founded", "investedIn", "acquired"];

  relationships.forEach(rel => {
    SVGLinks.classed(`link--${rel}`, false);
    SVGNodes.classed(`node--${rel}`, false);
  });

  SVGLinks.classed("link--faded", false);
  SVGNodes.classed("node--faded", false);
}

select(self.frameElement).style("height", `${diameter}px`);

// Lazily construct the package hierarchy from class names.
function packageHierarchy(companies) {
  let map = companies.reduce((acc, el) => {
    acc[""].children.push({name: el.name, parent: acc[""]});
    return acc;
  }, { "": {name: "", children: []}});

  return map[""];
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes, companies) {
  let map = {};
  let links = [];
  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.name] = d;
  });

  // use one directional keys to avoid double linking btn two endpoints
  const keys = ["mentoredBy", "foundedBy", "investedBy", "acquiredBy", "partneredWith"];

  companies.forEach(company => {
    keys.forEach(key => {
      if (company[key]) {
        company[key].forEach(rel => {
          links.push({source: map[company.name], target: map[rel]});
        });
      }
    });
  });

  return links;
}
