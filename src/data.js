export default (ip, neighbors, routes) => {
  const ids = [];
  let nodes = [
    {
      level: 1,
      group: 1,
      id: ip,
      neighbor: false
    },
    ...neighbors.map(n => {
      let id = n.ip;
      if (
        id.startsWith("fd00") ||
        ids.map(id => id.substr(-9)).includes(n.ip.substr(-9))
      )
        return undefined;
      let level = 2;
      ids.push(id);

      return { ...n, id, level, neighbor: true };
    }),
    ...routes
      .filter(r => r.installed)
      .map(r => {
        let id = r.prefix.substr(0, r.prefix.length - 4);
        if (
          id.startsWith("fd00") ||
          ids.map(id => id.substr(-9)).includes(id.substr(-9))
        )
          return undefined;
        let level = 3;
        ids.push(id);

        return { ...r, id, level, route: true };
      })
  ];

  nodes = nodes.filter(n => n);

  let links = nodes.map(target => {
    let source;

    if (target.level === 1) {
      return undefined;
    }

    if (target.level === 2) {
      source = nodes.find(n => n.level === 1);
    }

    if (target.level === 3) {
      source = nodes.find(
        n => n.id.substr(-19) === target.neigh_ip.substr(-19)
      );
    }

    if (!source) return undefined;

    return { target, source };
  });

  links = links.filter(l => l);

  return { links, nodes };
};
