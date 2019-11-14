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

  let links = nodes.map(n => {
    let curvature = (1 + Math.random()) * 0.1;
    let source;

    if (n.level === 1) {
      return undefined;
    } 

    if (n.level === 2) {
      source = nodes.find(p => p.level === 1).id;
    } 

    if (n.level === 3) {
      source = nodes.find(p => p.id.substr(-19) === n.neigh_ip.substr(-19))
    }

    if (!source) return undefined;
    return { target: n.id, source: source, curvature };
  });

  links = links.filter(l => l);

  return { links, nodes };
};
