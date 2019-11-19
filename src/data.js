import chroma from "chroma-js";
export default (ip, neighbors, routes) => {
  const ids = [];
  let nodes = [
    ...neighbors.map(n => {
      let id = n.ip;
      if (id.startsWith("fd00") || ids.map(id => id.substr(-9)).includes(n.ip.substr(-9))) return undefined;
      let level = 2;
      ids.push(id);

      return { ...n, id, level, neighbor: true };
    }),
    ...routes
      .filter(r => r.installed)
      .map(r => {
        let id = r.prefix.substr(0, r.prefix.length - 4);
        if (id.startsWith("fd00") || ids.map(id => id.substr(-9)).includes(id.substr(-9))) return undefined;
        let level = 3;
        ids.push(id);

        return { ...r, id, level, route: true };
      })
  ];

  nodes.push({
    level: 1,
    group: 1,
    id: ip,
    neighbor: false
  });

  nodes = nodes.filter(n => n);

  let numbers = [... new Set(nodes.map(n => n.metric || n.route_metric).filter(n => n))];
  console.log(numbers);
  let ratio = Math.max(...numbers) / numbers.length;
  numbers = numbers.map(v => {
    return { metric: v, normalized: Math.round(v / ratio) }
  } );
  nodes.map((n, i) => {
    let colors = chroma.scale(['#F5EFD3','#D8B272']).mode('lch').colors(numbers.length);
    let metric = n.metric || n.route_metric;
    let metricIndex = numbers.findIndex(m => m.metric === metric);
    if (metricIndex < 0) metricIndex = 0;
    n.normalizedMetric = numbers[metricIndex].normalized;
    n.color = colors[metricIndex];
  }) 

  let links = nodes.map(target => {
    let source;

    if (target.level === 1) {
      return undefined;
    } 

    if (target.level === 2) {
      source = nodes.find(n => n.level === 1);
    } 

    if (target.level === 3) {
      source = nodes.find(n => n.id.substr(-19) === target.neigh_ip.substr(-19))
    }

    if (!source) return undefined;

    let color = target.color;

    return { target, source, color };
  });

  links = links.filter(l => l);

  return { links, nodes };
};
