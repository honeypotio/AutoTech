import * as d3 from 'd3';

export const diameter = 720;
export const radius = diameter / 2;
export const innerRadius = radius - 120;
const svgWidth = document.body.clientWidth > (diameter + 280) ? document.body.clientWidth : (diameter + 280);

export const cluster = d3.layout.cluster()
                        .size([radius, innerRadius])
                        .value(d => d.size);

export const bundle = d3.layout.bundle();

export const line = d3.svg.line.radial()
                      .interpolate("bundle")
                      .tension(.85)
                      .radius(d => d.y)
                      .angle(d => (d.x / 180 * Math.PI));

export const svg = d3.select(".wheel")
                    .append("svg")
                    .attr("width", svgWidth)
                    .attr("height", (diameter + 200))
                    .append("g")
                    .attr("transform", `translate(${((svgWidth / 2) + 100)},${(radius + 100)})`);

export const boldedCompanies = [
  "Volkswagen Group",
  "Daimler",
  "BMW",
  "Schaeffler",
  "Robert Bosch",
  "Sixt"
];

export const industryIcons = {
  "Automakers, Trucks & Buses": '\uf0d1',
  "Electric Vehicles & Connected Cars": '\uf0e7',
  "Computer Software & Computer Vision": '\uf109',
  "Miscellaneous": '\uf29c',
  "Mapping & Location Services": '\uf124',
  "Car Hailing & Sharing": '\uf1b9',
  "VCs, Accelerators & Incubators": '\uf0d6',
  "Mobility": '\uf06e',
  "Rentals & Marketplaces": '\uf291'
}
