export default (ip, neighbors, routes) => {
  const ids = [];
  let nodes = [
    ...neighbors.map(n => {
      if (ids.includes(n.ip)) return undefined;
      ids.push(n.ip);
      let level = 2;
      let group = 1;
      let id = n.ip;

      return { ...n, id, group, level, neighbor: true };
    }),
    ...routes
      .filter(r => r.installed)
      .map(r => {
        if (ids.includes(r.neigh_ip)) return undefined;
        ids.push(r.neigh_ip);
        let level = 3;
        let group = 1;
        let id = r.neigh_ip;

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
