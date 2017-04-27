import {
  json as getJSON, select
} from 'd3';

import {
  diameter, radius, innerRadius, svg, cluster, bundle, line, boldedCompanies
} from './settings';

import {
  sortAsc, aggregateIndustries
} from './utils';

import drawIndustriesDonut from './donut';


let SVGLinks = svg.append("g").selectAll(".link");
let SVGNodes = svg.append("g").selectAll(".node");
let mappedRelationships = {};

// Get Data
getJSON("data/autotech.json", (error, companies) => {
  if (error) {
    throw error
  };

  mappedRelationships = companies.reduce((acc, company) => {
    acc[company.name] = company;
    return acc;
  }, mappedRelationships);

  // get industry data
  const industries = [];
  const industriesCount = companies.reduce(aggregateIndustries(industries), []);
  industriesCount.sort(sortAsc('industry'));

  drawIndustriesDonut(svg, industriesCount);

  // First sort the company list before doing anything
  companies.sort(sortAsc('industry'));

  const hier = packageHierarchy(companies);
  const nodes = cluster.nodes(hier);
  const links = packageImports(nodes, companies);

  SVGLinks = SVGLinks.data(bundle(links))
        .enter().append("path")
        .each((d) => {
          d.source = d[0];
          d.target = d[d.length - 1];
        })
        .attr("class", "link")
        .attr("d", line);

  SVGNodes = SVGNodes.data(nodes)
          .enter().append("text")
          .attr("class", "node")
          .attr("dy", ".1em")
          .attr('dx', '.2em')
          .attr("transform", (d) => {
            return `rotate(${ (d.x - 90) }), translate(${ (d.y + 2) },0)${ d.x < 180 ? "" : "rotate(180)" }`;
          })
          .style("text-anchor", (d) => {
            return d.x < 180 ? "start" : "end";
          })
          .text(d => d.name)
          .classed("node--bolded", (d) => {
            return boldedCompanies.includes(d.name);
          })
          .on("mouseover", hoverAction)
          .on("mouseout", removeHoverAction);
});


function hoverAction(d) {
  SVGNodes.each((n) => {
    n.target = n.source = false;
  })

  const relationships = ["mentoredBy", "foundedBy", "investedBy", "acquiredBy", "partneredWith", "mentors", "founded", "investedIn", "acquired"];

  relationships.forEach((rel) => {
    SVGNodes.classed("node--faded", (node) => {
      return !(mappedRelationships[d.name][rel] && mappedRelationships[d.name][rel].includes(node.name));
    });
    SVGLinks.classed(`link--${rel}`, (path) => {
      if (path.target !== d && path.source !== d) {
        return false;
      }
      return (mappedRelationships[d.name][rel] && (mappedRelationships[d.name][rel].includes(path.source.name) || mappedRelationships[d.name][rel].includes(path.target.name)));
    });
    SVGNodes.classed(`node--${rel}`, (n) => {
      return (mappedRelationships[d.name][rel] && mappedRelationships[d.name][rel].includes(n.name));
    });
  });

  SVGLinks.classed("link--faded", (l) => { return l.target !== d && l.source !== d; })
      .filter((l) => { return l.target === d || l.source === d; })
      .each(() => { this.parentNode.appendChild(this); });
}

function removeHoverAction(d) {
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
  nodes.forEach((d) => {
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
