import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import * as sapper from "@sapper/server";
import fs from "fs";

import "./styles.css";

const UDPPORT = 33333;
const HOST = "0.0.0.0";
const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";
let nodes = {};

polka() // You can also use Express
  .use(
    "/network",
    compression({ threshold: 0 }),
    sirv("static", { dev }),
    sapper.middleware()
  )
  .get("/nodes", (req, res) => {
    res.end(JSON.stringify(nodes));
  })
  .listen(PORT, err => {
    if (err) console.log("error", err);
  });

const dgram = require("dgram");
const server = dgram.createSocket("udp4");

server.on("listening", function() {
  const address = server.address();
  console.log(
    "> UDP Server listening on " + address.address + ":" + address.port
  );
});

server.on("message", function(message, remote) {
  let obj = nodes[message] || {};
  let d = new Date();
  obj[d.getSeconds() + 60 * d.getMinutes()] = 1;
  nodes[message] = obj;
});

server.bind(UDPPORT, HOST);

fs.readFile('/tmp/nodes', (err, data) => {
  if (data) nodes = JSON.parse(data);
});

setInterval(() => {
  fs.writeFile("/tmp/nodes", JSON.stringify(nodes), () => {});
}, 10000);
