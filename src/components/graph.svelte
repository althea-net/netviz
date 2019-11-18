<script>
  import { onMount } from "svelte";
  import { links, nodes, graph, showGraph, map, zoom } from "../store";
  import { latLng2Point, point2LatLng } from "../utils/map";
  import GraphUtils from "../utils/graph.svelte";

  let el, graphUtils;

  onMount(async () => {
    const {
      linkColor,
      linkDirectionalParticles,
      linkLabel,
      linkWidth,
      nodeLabel,
      onNodeHover,
      onNodeDragEnd,
      onNodeClick,
      nodeCanvasObject,
      onZoom
    } = graphUtils.utils;

    const NODE_REL_SIZE = 40;

    const config = ForceGraph()
      .backgroundColor(() => "rgba(0,0,0,0)")
      .d3Force("charge", d3.forceManyBody().strength(-3000))
      .linkColor(linkColor)
      .linkCurvature(0.1)
      .linkDirectionalParticleColor(() => "#fff")
      .linkDirectionalParticleWidth(n => linkWidth(n) + 2)
      .linkDirectionalParticles(linkDirectionalParticles)
      .linkLabel(linkLabel)
      .linkWidth(linkWidth)
      .nodeAutoColorBy("module")
      .nodeCanvasObject(nodeCanvasObject)
      .nodeId("id")
      .nodeLabel(nodeLabel)
      .nodeRelSize(NODE_REL_SIZE)
      .nodeVal(() => 1 / $zoom)
      .onNodeClick(onNodeClick)
      .onNodeDragEnd(onNodeDragEnd)
      .onNodeHover((node, prevNode) => onNodeHover(node, el))
      .onZoom(onZoom);

    const graphData = { nodes: $nodes, links: $links };
    $graph = config(el).graphData(graphData);
    $graph.width(el.offsetWidth);
    $graph.zoom(1);

    let px = 0;
    let py = 0;

    setInterval(() => {
      let { x, y } = $graph.centerAt();

      let dx = x - px;
      let dy = y - py;

      if ($map && $map.getProjection()) {
        let { x: mx, y: my } = latLng2Point($map.getCenter(), $map);
        if (dx || dy) {
          let point = { x: mx + dx * $zoom, y: my + dy * $zoom };
          let latLng = point2LatLng(point, $map);
          $map.setCenter(latLng);
        }
      }

      px = x;
      py = y;
    }, 10);
  });

  const resize = () => {
    $graph.width(el.offsetWidth).d3ReheatSimulation();
    let map = document.getElementById("map");
    map.style.width = `${el.offsetWidth + 2}px`;
    map.style.height = `${el.offsetHeight}px`;
  };

  const zoomOut = () => {
    $graph.zoom(1, 100);
    let center = window.localStorage.getItem("center");
    if (center) $graph.centerAt(0, 0);
  };
</script>

<style>
  #graph {
    z-index: 1;
  }

  .full-screen {
    position: absolute;
    width: 20px;
    top: 40px;
    right: 40px;
    z-index: 2;
    cursor: pointer;
  }

  @media (max-width: 600px) {
    .full-screen {
      top: 90px;
    }
  }
</style>

<svelte:window on:resize={resize} />

<div>
  <img
    src="screen-full.svg"
    class="full-screen"
    on:click={zoomOut}
    alt="Zoom Out"
    title="Zoom Out" />

  <div id="graph" bind:this={el} class:invisible={!$showGraph} />
</div>

<GraphUtils bind:this={graphUtils} />
