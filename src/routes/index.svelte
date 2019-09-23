<script context="module">
  export async function preload(page, session) {
    const res = await this.fetch("installed.json");
    const neighbors = await res.json();

    return { neighbors };
  }
</script>

<script>
  import { onMount } from "svelte";

  export let neighbors;
  let selected;
  let nodes = [];
  let graph;
  let el;

  const resize = () => {
    graph.width(el.offsetWidth).refresh();
  };

  onMount(async () => {
    const ids = [];

    nodes = neighbors.map(n => {
      if (ids.includes(n.neigh_ip)) return undefined;
      ids.push(n.neigh_ip);
      return { id: n.neigh_ip, group: 1, level: Math.ceil(Math.random() * 4) };
    });

    nodes = nodes.filter(n => n);

    let links = nodes.map(n => {
      let parents = nodes.filter(p => p.level === n.level - 1);
      let target = parents[Math.floor(parents.length * Math.random())];
      let value = Math.ceil(Math.random() * 4);
      if (!target) return undefined;

      return { source: n.id, target: target.id, value };
    });

    links = links.filter(l => l);

    const graphData = { nodes, links };

    const NODE_REL_SIZE = 1;
    el = document.getElementById("graph");

    graph = ForceGraph()
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
        selected = node.id;
      })
      .linkWidth(link => link.value * 2)
      .linkDirectionalParticles(3)
      .linkDirectionalParticleWidth(link => link.value * 4)
      .nodeCanvasObject((node, ctx, globalScale) => {
        const label = node.id;
        const fontSize = 12 / globalScale;
        ctx.font = `${
          node.id === selected ? "bold" : ""
        } ${fontSize}px Sans-Serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map(
          n => n + fontSize * 0.2
        ); // some padding
        ctx.fillStyle = "rgba(255, 255, 255, 0)";
        ctx.fillRect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2,
          ...bckgDimensions
        );
        ctx.rect(
          node.x - bckgDimensions[0] / 2,
          node.y - bckgDimensions[1] / 2,
          100,
          20
        );
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.fillText(label, node.x, node.y + 15);
        ctx.fillStyle = "#51AFEF";
        ctx.beginPath();
        ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
        ctx.fill();
      });

    graph = graph(el).graphData({ nodes, links });

    /*
    const Graph = ForceGraph3D()(document.getElementById("3d-graph"))
      .width("100%")
      // .jsonUrl("miserables.json")
      .graphData(graphData)
      .nodeAutoColorBy("group")
      .nodeThreeObject(node => {
        // use a sphere as a drag handle
        const obj = new THREE.Mesh(
          new THREE.SphereGeometry(10),
          new THREE.MeshBasicMaterial({
            depthWrite: false,
            transparent: true,
            opacity: 0.2
          })
        );

        // add text sprite as child
        const sprite = new SpriteText(node.id);
        sprite.color = "white";
        sprite.textHeight = 8;
        obj.add(sprite);
        obj.callback = () => console.log(node.id);

        return obj;
      })
      .onNodeClick(node => {
        node.color = "red";
      });

    // Spread nodes a little wider
    Graph.d3Force("charge").strength(-500);
    */
  });
</script>

<svelte:head>
  <script src="//unpkg.com/three">

  </script>
  <script src="//unpkg.com/three-spritetext">

  </script>
  <script src="//unpkg.com/3d-force-graph">

  </script>
  <script src="//unpkg.com/force-graph">

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
        <div
          on:click={() => (selected = n.id)}
          class={`cursor-pointer ${n.id === selected ? 'font-bold' : ''}`}>
          {n.id}
        </div>
      {/each}
    </div>
  </div>
</div>
