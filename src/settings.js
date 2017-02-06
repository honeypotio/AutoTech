import * as d3 from 'd3';

export const diameter = 720;
export const radius = diameter / 2;
export const innerRadius = radius - 120;
const svgWidth = document.body.clientWidth > (diameter + 400) ? document.body.clientWidth : (diameter + 400);

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
                    .attr("width", svgWidth)
                    .attr("height", (diameter + 200))
                    .append("g")
                    .attr("transform", `translate(${((svgWidth / 2) + 140)},${(radius + 100)})`);
