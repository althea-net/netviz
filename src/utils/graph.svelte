<script>
  import { graph, map, nodes, selected, zoom, zooming } from "../store";
  import { point2LatLng, latLng2Point } from "./map";

  const savePosition = node => {
    let { id, label, x, y, latlng } = node;
    node.fx = x;
    node.fy = y;
    $selected = id;

    if ($map) {
      const center = JSON.parse(window.localStorage.getItem("center"));
      let referenceLatLng = new google.maps.LatLng(center.lat, center.lng);
      let referencePoint = latLng2Point(referenceLatLng, $map);
      let z = 1;
      switch ($map.getZoom()) {
        case 17:
          z = 4;
          break;
        case 16:
          z = 2;
          break;
        case 14:
          z = 0.5;
          break;
        case 13:
          z = 0.25;
          break;
        default:
        case 15:
          z = 1;
          break;
      }

      latlng = point2LatLng(
        { x: x * z + referencePoint.x, y: y * z + referencePoint.y },
        $map
      );
      node.latlng = latlng;
      node.lat = latlng.lat();
      node.lng = latlng.lng();
      let point = latLng2Point(latlng, $map);
      window.localStorage.setItem(id, JSON.stringify({ id, label, latlng }));
      $nodes.map(n => (n.lastTouched = false));
      node.lastTouched = true;
      $nodes = $nodes;
    }
  };

  export const utils = {
    linkLabel(link) {
      return link.target.neighbor
        ? `latency: ${link.target.stats.latency.avg}`
        : `metric: ${link.target.metric}`;
    },
    nodeCanvasObject(node, ctx, globalScale) {
      const { x, y, label, img, id, latlng } = node;
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
      ctx.strokeText(text, x * 4, (y + 40 / $zoom) * 4);
      ctx.miterLimit = 2;
      ctx.fillStyle = "black";
      ctx.fillText(text, x * 4, (y + 40 / $zoom) * 4);
      ctx.fillStyle = "#51AFEF";
      ctx.scale(4, 4);

      if (img) ctx.drawImage(img, x - (36 / $zoom)/ 2, y - (48 / $zoom)/ 2, 36/$zoom, 48/$zoom);

      if (id === $selected && !$zooming) {
        $zooming = true;
        // $graph.centerAt(x, y, 300);
      }
    },
    nodeLabel(node) {
      return (
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
          : "")
      );
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
      if (k > 4) return $graph.zoom(4);
      if (k < 4 && k > 3) return $graph.zoom(2);
      if (k < 3 && k > 2) return $graph.zoom(4);
      if (k < 2 && k > 1.5) return $graph.zoom(1);
      if (k < 1.5 && k > 1) return $graph.zoom(2);
      if (k < 1 && k > 0.75) return $graph.zoom(0.5);
      if (k < 0.75 && k > 0.5) return $graph.zoom(1);
      if (k < 0.5 && k > 0.375) return $graph.zoom(0.25);
      if (k < 0.375 && k > 0.25) return $graph.zoom(0.5);
      if (k < 0.25) return $graph.zoom(0.25);

      $zoom = k;
      if ($map && $map.setZoom) {
        let z = $map.getZoom();
        let r = 0;

        if (k === 0.25) r = -3;
        if (k === 0.5) r = -2;
        if (k === 1) r = -1;
        if (k === 2) r = 0;
        if (k === 4) r = +1;
        if (k > 4) r = +2;

        $map.setZoom(16 + r);
      }
    }
  };
</script>
