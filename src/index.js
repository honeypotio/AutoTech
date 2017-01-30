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

let SVGLinks = svg.append("g").selectAll(".link"),
    SVGNodes = svg.append("g").selectAll(".node");

getJSON("data/prelim.json", function(error, companies) {

  if (error) {
    throw error
  };

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
          .classed("node--root", node => (node.parent && node.parent.name === ''))
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
          .classed("node--root", false);

  SVGLinks.classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
      .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
      .classed("link--faded", function(l){return l.target !== d && l.source !== d })
      .filter(function(l) { return l.target === d || l.source === d; })
      .each(function() { this.parentNode.appendChild(this); });

  SVGNodes.classed("node--target", function(n) { return n.target; })
      .classed("node--source", function(n) { return n.source; });
}

function mouseouted(d) {
  SVGLinks.classed("link--target", false)
      .classed("link--source", false)
      .classed("link--faded", false);

  SVGNodes.classed("node--target", false)
      .classed("node--source", false)
      .classed("node--root", node => (node.parent && node.parent.name === ''));
}

select(self.frameElement).style("height", `${diameter}px`);

// Lazily construct the package hierarchy from class names.
function packageHierarchy(companies) {

  const parentKeys = ["mentoredBy", "foundedBy", "investedBy", "acquiredBy"];

  let map = companies.reduce((acc, el) => {
    acc[el.name] = {name: el.name};
    return acc;
  }, { "": {name: "", children: []}});

  companies.forEach(company => {
    let isRootNode = true;

    parentKeys.forEach(key => {
      if (company[key]) {
        isRootNode = false;
        map[company.name].parent = map[company[key][0]];
        map[company.name].parent.children = map[company.name].parent.children || [];
        map[company.name].parent.children.push(map[company.name]);
      }
    });
    // Partnerships are weird
    if (company["partneredWith"]) {

      // company["partneredWith"].forEach(partner => {
      //   if (!(map[company.name].children && map[company.name].children.includes(map[partner]))) {
      //     isRootNode = false;
      //     map[company.name].parent = map[partner];
      //     map[company.name].parent.children = map[company.name].parent.children || [];
      //     map[company.name].parent.children.push(map[company.name]);
      //   }
      // });
    }

    if (isRootNode) {
      map[""].children.push(map[company.name]);
      map[company.name].parent = map[""];
    }
  });

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

  // For each import, construct a link from the source to target node.
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
