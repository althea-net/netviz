<script context="module">
  export async function preload(page, session) {
    const res = await this.fetch("installed.json");
    const neighbors = await res.json();

    return { neighbors };
  }
</script>

<script>
  import { onMount } from "svelte";

  export let neighbors = [];
  let selected;
  let nodes = [];
  let graph;
  let el;
  let zooming = false;

  const resize = () => {
    graph.width(el.offsetWidth).refresh();
  };

  onMount(async () => {
    const images = [1, 2, 3, 4].map(i => {
      const img = new Image();
      img.src = `house${i}.svg`;
      return img;
    });

    const ids = [];

    nodes = neighbors.map(n => {
      if (ids.includes(n.neigh_ip)) return undefined;
      ids.push(n.neigh_ip);
      let level = Math.ceil(Math.random() * 4);
      let img = images[level - 1];
      let group = 1;
      let id = n.neigh_ip;

      return { id, group, level, img };
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

    const graphData = { nodes, links };

    const NODE_REL_SIZE = 4;
    el = document.getElementById("graph");

    let config = ForceGraph()
      .width(el.offsetWidth)
      .dagMode("radialout")
      .dagLevelDistance(100)
      .backgroundColor("#F5EFD3")
      .linkColor(() => "rgba(255,255,255,0.8)")
      .nodeRelSize(NODE_REL_SIZE)
      .nodeId("id")
      .nodeVal(node => 100 / (node.level + 1))
      .nodeLabel("id")
      .nodeAutoColorBy("module")
      .onNodeClick(node => {
        zooming = false;
        graph.centerAt(node.x, node.y);
        selected = node.id;
        if (node.el) node.el.focus();
      })
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
      // Deactivate existing forces
      // Add collision and bounding box forces
      .nodeCanvasObject(({ x, y, label, img, id }, ctx, globalScale) => {
        const size = 36;
        const fontSize = 16 / globalScale;
        ctx.font = `${id === selected ? "bold" : ""} ${fontSize}px Sans-Serif`;

        if (id === selected && !zooming) {
          zooming = true;
          graph.centerAt(x, y, 300);
          graph.zoom(4, 600);
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

    graph = config(el).graphData({ nodes, links });
  });
</script>

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

<svelte:window on:resize={resize} />
<div class="flex w-100">
  <div class="w-1/2">
    <div class="rounded shadow-lg px-6 py-4 m-4">
      <div id="graph" />
    </div>
  </div>
  <div class="w-1/2">
    <div class="rounded shadow-lg px-6 py-4 m-4">
      {#each nodes as n (n.id)}
        <div class="flex justify-between mb-2">
          <div
            on:click={() => (selected = n.id) && (zooming = false)}
            class={`my-auto w-1/2 cursor-pointer ${n.id === selected ? 'font-bold' : ''}`}>
            {n.id}
          </div>
          <input
            bind:value={n.label}
            class="border p-2 w-1/2"
            bind:this={n.el} />
        </div>
      {/each}
    </div>
  </div>
</div>
