<script>
  import { onMount } from "svelte";
  import { links, nodes, graph, map, selected, zooming } from "../store";

  let el;

  const click = node => {
    $graph.centerAt(node.x, node.y, 300);
    $selected = node.id;
    if (node.el) node.el.focus();
  };

  function latLng2Point(latLng, map) {
    var topRight = map
      .getProjection()
      .fromLatLngToPoint(map.getBounds().getNorthEast());
    var bottomLeft = map
      .getProjection()
      .fromLatLngToPoint(map.getBounds().getSouthWest());
    var scale = Math.pow(2, map.getZoom());
    var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
    return new google.maps.Point(
      (worldPoint.x - bottomLeft.x) * scale,
      (worldPoint.y - topRight.y) * scale
    );
  }

  onMount(async () => {
    const images = [1, 2, 3, 4].map(i => {
      const img = new Image();
      img.src = `house${i}.svg`;
      return img;
    });

    $nodes.map(n => (n.img = images[2]));

    const NODE_REL_SIZE = 4;
    const config = ForceGraph()
      .dagMode("radialOut")
      .dagLevelDistance(100)
      .backgroundColor(() => "rgba(255,0,0,0.5)")
      .linkColor(() => "rgba(255,255,255,0.8)")
      .nodeRelSize(NODE_REL_SIZE)
      .nodeId("id")
      .nodeVal(node => 100 / (node.level + 1))
      .nodeLabel(
        node =>
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
      )
      .nodeAutoColorBy("module")
      .onNodeClick(click)
      .onNodeDragEnd(node => {
        node.fx = node.x;
        node.fy = node.y;


      })
      .onNodeHover((node, prevNode) => {
        el.style.cursor = "pointer";
        if (!node) el.style.cursor = "auto";
      })
      .onZoom(({ k }) => {
        /*
        if ($map && $map.setZoom)
          $map.setZoom(Math.floor(k * 12));
          */
      })
      .linkWidth(link => link.value * 0.5)
      .linkCurvature("curvature")
      .linkDirectionalParticles(2)
      .linkDirectionalParticleWidth(2)
      .linkColor("color")
      .linkLabel(link =>
        link.target.neighbor
          ? `latency: ${link.target.stats.latency.avg}`
          : `metric: ${link.target.metric}`
      )
      .linkDirectionalParticleColor("white")
      .d3Force("charge", d3.forceManyBody().strength(-3000))
      .nodeCanvasObject(({ x, y, label, img, id }, ctx, globalScale) => {
        const size = 36;
        const fontSize = 16 / globalScale;
        ctx.font = `${id === $selected ? "bold" : ""} ${fontSize * 4}px Sans-Serif`;

        if (id === $selected && !$zooming) {
          $zooming = true;
          $graph.centerAt(x, y, 300);
          $graph.zoom(8, 600);
        }

        const text = label || id.substr(-4);
        const textWidth = ctx.measureText(text).width;
        const bckgDimensions = [textWidth, fontSize].map(
          n => n + fontSize * 0.2
        ); // some padding
        ctx.fillStyle = "rgba(255, 255, 255, 0)";
        ctx.fillRect(
          x - bckgDimensions[0] / 2,
          y - bckgDimensions[1] / 2,
          ...bckgDimensions
        );
        // ctx.rect(x - bckgDimensions[0] / 2, y - bckgDimensions[1] / 2, 100, 20);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.scale(0.25, 0.25)
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 16;
        ctx.strokeText(text, x * 4, (y + 26) * 4);
        ctx.miterLimit=2;
        ctx.fillStyle = "black";
        ctx.fillText(text, x * 4, (y + 26) * 4);
        ctx.fillStyle = "#51AFEF";
        ctx.scale(4, 4)
        // ctx.beginPath();
        // ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.drawImage(img, x - size / 2, y - size / 2, 26, 36);
      });

    const graphData = { nodes: $nodes, links: $links };
    $graph = config(el).graphData(graphData);
    $graph.width(el.offsetWidth);
  });

  const resize = () => {
    $graph.width(el.offsetWidth).d3ReheatSimulation();
    let map = document.getElementById("map");
    map.style.width = `${el.offsetWidth + 2}px`;
    map.style.height = `${el.offsetHeight}px`;
  };

  const zoomOut = () => $graph.zoom(1, 100);
</script>

<style>
  .full-screen {
    position: absolute;
    width: 20px;
    top: 40px;
    right: 40px;
    z-index: 1;
    cursor: pointer;
  }
</style>

<svelte:window on:resize={resize} />

<svelte:head>
  <script src="//unpkg.com/three">

  </script>
  <script src="//unpkg.com/three-spritetext">

  </script>
  <script src="//unpkg.com/force-graph">

  </script>
  <script src="//unpkg.com/d3-quadtree@1.0.6/dist/d3-quadtree.min.js">

  </script>
  <script src="//unpkg.com/d3-force">

  </script>
</svelte:head>
<div class="relative rounded shadow-lg px-4 py-4 m-4">
  <img
    src="screen-full.svg"
    class="full-screen"
    on:click={zoomOut}
    alt="Zoom Out"
    title="Zoom Out" />

  <div id="graph" bind:this={el} />
</div>
