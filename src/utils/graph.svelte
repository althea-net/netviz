<script>
  import { graph, map, selected, zoom, zooming } from "../store";

  export const utils = {
    linkLabel(link) {
      link.target.neighbor
        ? `latency: ${link.target.stats.latency.avg}`
        : `metric: ${link.target.metric}`;
    },
    nodeCanvasObject({ x, y, label, img, id }, ctx, globalScale) {
      const size = 36;
      const fontSize = 16 / globalScale;
      const text = label || id.substr(-4);
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

      ctx.drawImage(img, x - size / 2, y - size / 2, 26, 36);

      if (id === $selected && !$zooming) {
        $zooming = true;
        $graph.centerAt(x, y, 300);
        $graph.zoom(1.2, 600);
      }
    },
    nodeLabel(node) {
      `${node.id}<br>` +
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
    },
    onNodeDragEnd(node) {
      node.fx = node.x;
      node.fy = node.y;

      if ($map) {
        node.latlng = point2LatLng(point, $map);
      }
    },
    onNodeHover(node, el) {
      el.style.cursor = "pointer";
      if (!node) el.style.cursor = "auto";
    },
    onZoom({ k }) {
      $zoom = k;
      if ($map && $map.setZoom) {
        let z = $map.getZoom();
        let r = 0;

        if (k < 0.5) r = -1;
        if (k < 0.25) r = -2;
        if (k > 1.5) r = +1;
        if (k > 2) r = +2;

        $map.setZoom(15 + r);
      }
    }
  };
</script>
