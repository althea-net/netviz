export default neighbors => {
  const ids = [];

  let nodes = neighbors.map(n => {
    if (ids.includes(n.neigh_ip)) return undefined;
    ids.push(n.neigh_ip);
    let level = Math.ceil(Math.random() * 4);
    let group = 1;
    let id = n.neigh_ip;

    return { id, group, level };
  });

  nodes = nodes.filter(n => n);

  let links = nodes.map(n => {
    let parents = nodes.filter(p => p.level === n.level - 1);
    let target = parents[Math.floor(parents.length * Math.random())];
    let value = Math.ceil(Math.random() * 4);
    if (!target) return undefined;
    let curvature = (Math.random() / 2) * (1 - Math.random());

    let colors = ["#e17055", "#ff7675", "#81ecec", "#fd79a8"];
    let color = colors[value - 1];
    return { source: n.id, target: target.id, value, curvature, color };
  });

  links = links.filter(l => l);

  return { links, nodes };
};
