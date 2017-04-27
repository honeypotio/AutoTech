export const sortAsc = (prop) => (a, b) => {
  // https://github.com/d3/d3-3.x-api-reference/blob/master/Arrays.md#d3_ascending
  return a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : a[prop] >= b[prop] ? 0 : NaN;
}

export const aggregateIndustries = (industries) => (acc, curr) => {
  if (industries.includes(curr.industry)) {
    acc[industries.indexOf(curr.industry)].count++
  } else {
    industries.push(curr.industry);
    acc.push({
      industry: curr.industry,
      count: 1
    });
  }
  return acc;
}
