import {
  diameter,
  innerRadius,
  radius,
  industryIcons
} from './settings';

import {
  svg,
  layout
} from 'd3';

const drawDonut = function(el, data) {
  const wrapper = el.insert('g', ':first-child')
                    .attr('class', 'industry');
  const colours = [
    `rgba(143, 232, 149, 0.08)`,
    `rgba(54, 133, 214, 0.08)`,
    `rgba(95, 1, 185, 0.08)`
  ];
  const arc = svg.arc()
              .outerRadius(innerRadius + 180)
              .innerRadius(innerRadius);

  const pie = layout.pie()
                    .sort(null)
                    .value(d => d.count);

  const g = wrapper.selectAll('g')
              .data(pie(data))
              .enter()
              .append('g')
              .attr('class', 'industry__section');

  g.append("path")
    .attr("d", arc)
    .style('fill', (d, i) => colours[i % colours.length])
  g.append('text')
    .attr('class', 'industry__text')
    .attr("x", d => {
      var c = arc.centroid(d),
              x = c[0],
              y = c[1],
              // pythagorean theorem for hypotenuse
              h = Math.sqrt(x*x + y*y);
          return (x/h * (innerRadius + 180));
    })
    .attr("y", d => {
      var c = arc.centroid(d),
              x = c[0],
              y = c[1],
              // pythagorean theorem for hypotenuse
              h = Math.sqrt(x*x + y*y);
          return (y/h * (innerRadius + 180));
    })
    .text(d => {
      return industryIcons[d.data.industry];
    });
};

export default drawDonut;
