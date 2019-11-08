export default (ip, neighbors, routes) => {
  const ids = [];
  let nodes = [
    ...neighbors.map(n => {
      let id = n.ip;
      if (id.startsWith("fd00") || ids.map(id => id.substr(-9)).includes(n.ip.substr(-9))) return undefined;
      let level = 2;
      let group = 1;
      ids.push(id);

      return { ...n, id, group, level, neighbor: true };
    }),
    ...routes
      .filter(r => r.installed)
      .map(r => {
        let id = r.prefix.substr(0, r.prefix.length - 4);
        if (id.startsWith("fd00") || ids.map(id => id.substr(-9)).includes(id.substr(-9))) return undefined;
        let level = 3;
        let group = 1;
        ids.push(id);

        return { ...r, id, group, level, route: true };
      })
  ];

  nodes.push({
    level: 1,
    group: 1,
    id: ip,
    neighbor: false
  });

  nodes = nodes.filter(n => n);

  let links = nodes.map(n => {
    let parents = nodes.filter(p => p.level === n.level - 1);
    let source = parents[Math.floor(parents.length * Math.random())];
    let value = Math.ceil(Math.random() * 4);
    if (!source) return undefined;
    let curvature = (1 + Math.random()) * 0.1;
    let color = "#F5EFD3";
    return { target: n.id, source: source.id, value, curvature, color };
  });

  links = links.filter(l => l);

  return { links, nodes };
};
