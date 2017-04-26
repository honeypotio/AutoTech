import {
  diameter,
  innerRadius,
  radius
} from './settings';

import {
  svg,
  layout
} from 'd3';

const drawDonut = function(el) {
  const wrapper = el.append('g');

  const arc = svg.arc()
              .outerRadius(innerRadius + 200)
              .innerRadius(innerRadius);

  const pie = layout.pie();

  const g = wrapper.selectAll('g')
              .data(pie([1, 2, 3, 5]))
              .enter()
              .append('g');

  g.append("path")
    .attr("d", arc)
    .style('fill', () => `rgba(${Math.floor(Math.random() * 200)},${Math.floor(Math.random() * 200)},${Math.floor(Math.random() * 200)},0.4)`)
  g.append('text')
    .attr("transform", function(d) { return `translate(${ arc.centroid(d) })`; })
    .attr("dy", ".35em")
    .text(function(d) { return "Hello"; });;
};

export default drawDonut;
