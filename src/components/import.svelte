<script>
  import { onMount, tick } from "svelte";
  import { graph, ip, links, map, nodes } from "../store";
  import { latLng2Point, point2LatLng } from "../utils/map";

  onMount(() => {
    if (typeof window !== "undefined") {
      window.addEventListener(
        "dragover",
        function(e) {
          e = e || event;
          e.preventDefault();
        },
        false
      );
      window.addEventListener(
        "drop",
        function(e) {
          e = e || event;
          e.preventDefault();
        },
        false
      );
    }
  });

  let json = "";
  let show = false;
  let ref;

  const toggle = () => {
    show = !show;
    if (show) tick().then(() => ref.focus());
  };

  const images = [1, 2, 3, 4, 5].map(i => {
    const img = new Image();
    img.src = `house${i}.svg`;
    return img;
  });

  const loadImage = n => {
    n.img = images[0];
    if (n.offline) {
      n.img = images[4];
    } else if (n.neighbor) {
      n.img = images[2];
    } else if (n.id === $ip) {
      n.img = images[1];
    }
  };

  const doImport = () => {
    let { nodes: savedNodes, links: savedLinks } = JSON.parse(json);

    $nodes = savedNodes
      .map(node => {
        let n = $nodes.find(n => n.id === node.id);
        if (!n) return node;

        try {
          let { label, lat, lng } = node;

          if (label) {
            n.label = label;
          }

          if (lat) {
            let fx, fy;
            n.latlng = new google.maps.LatLng(lat, lng);
            let point = latLng2Point(n.latlng, $map);
            ({ x: fx, y: fy } = point);

            n.fx = fx;
            n.fy = fy;
          }

          return n;
        } catch (e) {
          if (n) window.localStorage.removeItem(n.id);
        }
      })
      .filter(n => n);

    $nodes.map(n => loadImage(n));

    $links = savedLinks
      .map(l => {
        l.source = $nodes.find(n => n.id === l.source.id);
        l.target = $nodes.find(n => n.id === l.target.id);
        return l;
      })
      .filter(l => l);

    $graph.graphData({ links: $links, nodes: $nodes });
    window.localStorage.setItem("nodes", JSON.stringify($nodes));

    show = false;
  };

  const readFile= e => {
    let files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (function(file) {
        return function(e) {
          json = e.target.result;
          doImport();
        };
      })(file);

      reader.readAsText(file);
    }
  };
</script>

<style>
  button {
    @apply bg-green-500 p-4;
  }

  textarea {
    @apply p-4 m-4 border block;
  }

  .drop {
    height: 200px;
    @apply p-2 my-2 cursor-pointer border-red-500 border border-dashed;
  }
</style>

<button on:click={toggle}>Import</button>
<div class="drop flex flex-wrap w-100" on:drop|preventDefault={readFile}>
  <input class="mx-auto" type="file" on:change={readFile} />
</div>

{#if show}
  <textarea bind:value={json} bind:this={ref} />
  <button on:click={doImport}>Go</button>
{/if}
