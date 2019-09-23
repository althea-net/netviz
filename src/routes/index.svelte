<script>
  import { onMount } from "svelte";
  onMount(async () => {
    const Graph = ForceGraph3D()(document.getElementById("3d-graph"))
      .jsonUrl("miserables.json")
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
  });
</script>

<svelte:head>
  <script src="//unpkg.com/three">

  </script>
  <script src="//unpkg.com/three-spritetext">

  </script>
  <script src="//unpkg.com/3d-force-graph">

  </script>
</svelte:head>

<div id="3d-graph" />
