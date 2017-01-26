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

let link = svg.append("g").selectAll(".link"),
    node = svg.append("g").selectAll(".node");

getJSON("data/test.json", function(error, classes) {

  if (error) {
    throw error
  };

  const hier = packageHierarchy(classes);
  const nodes = cluster.nodes(hier);
  const links = packageImports(nodes);

  link = link.data(bundle(links))
          .enter().append("path")
          .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
          .attr("class", "link")
          .attr("d", line);

  node = node.data(nodes.filter(function(n) {
            return !n.children;
          }))
          .enter().append("text")
          .attr("class", "node")
          .attr("dy", ".31em")
          .attr("transform", function(d) {
            return `rotate(${ (d.x - 90) })translate(${ (d.y + 8) },0)${ d.x < 180 ? "" : "rotate(180)" }`;
          })
          .style("text-anchor", function(d) {
            return d.x < 180 ? "start" : "end";
          })
          .text(function(d) {return d.key; })
          .on("mouseover", mouseovered)
          .on("mouseout", mouseouted);
});


function mouseovered(d) {
  node.each(function(n) { n.target = n.source = false; });

  link.classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
      .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
      .classed("link--faded", function(l){return l.target !== d && l.source !== d })
      .filter(function(l) { return l.target === d || l.source === d; })
      .each(function() { this.parentNode.appendChild(this); });

  node.classed("node--target", function(n) { return n.target; })
      .classed("node--source", function(n) { return n.source; });
}

function mouseouted(d) {
  link.classed("link--target", false)
      .classed("link--source", false)
      .classed("link--faded", false);

  node.classed("node--target", false)
      .classed("node--source", false);
}

select(self.frameElement).style("height", `${diameter}px`);

// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
  const map = {};

  function find(name, data) {
    let node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }

  classes.forEach(function(d) {
    find(d.name, d);
  });
  
  return map[""];
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
  var map = {},
      imports = [];

  // Compute a map from name to node.
  nodes.forEach(function(d) {
    map[d.name] = d;
  });

  // For each import, construct a link from the source to target node.
  nodes.forEach(function(d) {
    if (d.imports) d.imports.forEach(function(i) {
      imports.push({source: map[d.name], target: map[i]});
    });
  });

  return imports;
}
