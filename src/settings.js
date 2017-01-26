import * as d3 from 'd3';

export const diameter = (window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight);
export const radius = diameter / 2;
export const innerRadius = radius - 120;

export const cluster = d3.layout.cluster()
                  .size([360, innerRadius])
                  .value(function(d) { return d.size; });

export const bundle = d3.layout.bundle();

export const line = d3.svg.line.radial()
              .interpolate("bundle")
              .tension(0.2)
              .radius(function(d) { return d.y + 5; })
              .angle(function(d) { return (d.x / 180) * Math.PI; });

export const svg = d3.select("body").append("svg")
              .attr("width", window.innerWidth)
              .attr("height", diameter)
              .append("g")
              .attr("transform", "translate(" + (radius + 200) + "," + radius + ")");