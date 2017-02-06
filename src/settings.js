import * as d3 from 'd3';

export const diameter = 720;
export const radius = diameter / 2;
export const innerRadius = radius - 120;

export const cluster = d3.layout.cluster()
                        .size([360, innerRadius])
                        .value(function(d) { return d.size; });

export const bundle = d3.layout.bundle();

export const line = d3.svg.line.radial()
                      .interpolate("bundle")
                      .tension(.85)
                      .radius(function(d) { return d.y; })
                      .angle(function(d) { return d.x / 180 * Math.PI; });

export const svg = d3.select(".autotech-wheel").append("svg")
                    .attr("width", document.body.clientWidth)
                    .attr("height", (diameter + 200))
                    .append("g")
                    .attr("transform", `translate(${((document.body.clientWidth / 2) + 140)},${(radius + 100)})`);
