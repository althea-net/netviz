<script>
  import { onMount } from "svelte";
  import { links, nodes, graph, selected, zooming } from "../store";

  let el;

  const click = node => {
    $zooming = false;
    $graph.centerAt(node.x, node.y);
    $selected = node.id;
    if (node.el) node.el.focus();
  };

  onMount(async () => {
    const images = [1, 2, 3, 4].map(i => {
      const img = new Image();
      img.src = `house${i}.svg`;
      return img;
    });

    $nodes.map(n => (n.img = images[n.level - 1]));

    const NODE_REL_SIZE = 4;
    const config = ForceGraph()
      .dagMode("radialout")
      .dagLevelDistance(100)
      .backgroundColor("#F5EFD3")
      .linkColor(() => "rgba(255,255,255,0.8)")
      .nodeRelSize(NODE_REL_SIZE)
      .nodeId("id")
      .nodeVal(node => 100 / (node.level + 1))
      .nodeLabel("id")
      .nodeAutoColorBy("module")
      .onNodeClick(click)
      .onNodeHover((node, prevNode) => {
        el.style.cursor = "pointer";
        if (!node) el.style.cursor = "auto";
      })
      .linkWidth(link => link.value * 0.5)
      .linkCurvature("curvature")
      .linkDirectionalParticles(3)
      .linkDirectionalParticleWidth(2)
      .linkColor("color")
      .linkDirectionalParticleColor("white")
      .d3Force("charge", d3.forceManyBody().strength(-2000))
      .nodeCanvasObject(({ x, y, label, img, id }, ctx, globalScale) => {
        const size = 36;
        const fontSize = 16 / globalScale;
        ctx.font = `${id === selected ? "bold" : ""} ${fontSize}px Sans-Serif`;

        if (id === $selected && !$zooming) {
          $zooming = true;
          $graph.centerAt(x, y, 300);
          $graph.zoom(4, 600);
        }

        const text = label || id;
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
        ctx.rect(x - bckgDimensions[0] / 2, y - bckgDimensions[1] / 2, 100, 20);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.fillText(text, x, y + 40);
        ctx.fillStyle = "#51AFEF";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.drawImage(img, x - size / 2, y - size / 2, 36, 48);
      });

    const graphData = { nodes: $nodes, links: $links };
    $graph = config(el).graphData(graphData);
    $graph.width(el.offsetWidth);
  });

  const resize = () => {
    $graph.width(el.offsetWidth).refresh();
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
  <script src="//unpkg.com/d3-quadtree">

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

  <div bind:this={el} />
</div>
