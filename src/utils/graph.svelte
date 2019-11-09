<script>
  import { graph, map, nodes, selected, zoom, zooming } from "../store";
  import { point2LatLng, latLng2Point } from "./map";

  const savePosition = node => {
      let { id, label, x, y, latlng } = node;
      node.fx = x;
      node.fy = y;

      if ($map) {
        latlng = point2LatLng({ x, y }, $map);
        node.latlng = latlng;
        let point = latLng2Point(latlng, $map);
        window.localStorage.setItem(id, JSON.stringify({ id, label, latlng }));
        $nodes.map(n => (n.lastTouched = false))
        node.lastTouched = true;
        $nodes = $nodes;
      }
  }

  export const utils = {
    linkLabel(link) {
      return link.target.neighbor
        ? `latency: ${link.target.stats.latency.avg}`
        : `metric: ${link.target.metric}`;
    },
    nodeCanvasObject({ x, y, label, img, id, latlng }, ctx, globalScale) {
      const size = 36;
      const fontSize = 16 / globalScale;

      let text = label || id.substr(-4);
      const textWidth = ctx.measureText(text).width;

      ctx.scale(0.25, 0.25);
      ctx.font = `${id === $selected ? "bold" : ""} ${fontSize *
        4}px Sans-Serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 16;
      ctx.strokeText(text, x * 4, (y + 26) * 4);
      ctx.miterLimit = 2;
      ctx.fillStyle = "black";
      ctx.fillText(text, x * 4, (y + 26) * 4);
      ctx.fillStyle = "#51AFEF";
      ctx.scale(4, 4);

      if (img)
        ctx.drawImage(img, x - size / 2, y - size / 2, 26, 36);

      if (id === $selected && !$zooming) {
        $zooming = true;
        $graph.centerAt(x, y, 300);
        $graph.zoom(1.2, 600);
      }
    },
    nodeLabel(node) {
      return `${node.id}<br>` +
        (node.neighbor
          ? `
          route_metric: ${node.route_metric}<br>
          route_metric_to_exit: ${node.route_metric_to_exit}<br>
          latency: ${node.stats.latency.avg}<br>
          packet_loss: ${node.stats.packet_loss.avg}<br>
          link_cost: ${node.link_cost}<br>
          `
          : "") +
        (node.route
          ? `
            iface: ${node.iface}<br>
            metric: ${node.metric}<br>
            refmetric: ${node.refmetric}<br>
            full_path_rtt: ${node.full_path_rtt}<br>
            price: ${node.price}<br>
            fee: ${node.fee}`
          : "");
    },
    onNodeClick(node) {
      $graph.centerAt(node.x, node.y, 300);
      $selected = node.id;
      if (node.el) node.el.focus();
      savePosition(node);
    },
    onNodeDragEnd: savePosition,
    onNodeHover(node, el) {
      el.style.cursor = "pointer";
      if (!node) el.style.cursor = "auto";
    },
    onZoom({ k }) {
      console.log(new Date(), "k", k);
      if (k > 2) return $graph.zoom(2);
      if (k < 2 && k > 1.75) return $graph.zoom(1.5);
      if (k < 1.75 && k > 1.5) return $graph.zoom(2);
      if (k < 1.5 && k > 1.25) return $graph.zoom(1);
      if (k < 1.25 && k > 1) return $graph.zoom(1.5);
      if (k < 1 && k > 0.75) return $graph.zoom(0.5);
      if (k < 0.75 && k > 0.5) return $graph.zoom(1);
      if (k < 0.5) return $graph.zoom(0.5);

      $zoom = k;
      if ($map && $map.setZoom) {
        let z = $map.getZoom();
        let r = 0;

        if (k === 0.25) r = -2;
        if (k === 0.5) r = -1;
        if (k === 1) r = 0;
        if (k === 1.5) r = +1;
        if (k === 2) r = +2;
        if (k === 2.5) r = +3;

        $map.setZoom(15 + r);
      }
    }
  };
</script>
