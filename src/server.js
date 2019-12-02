import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import * as sapper from "@sapper/server";
import fs from "fs";
import Airtable from "airtable";
import { config } from "dotenv";

config();

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
  .get("/names", async (req, res) => {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_KEY }).base(
      process.env.AIRTABLE_BASE
    );

    base("Nodes")
      .select()
      .all((err, rows) => {
        let names = {};
        rows.map(r => (names[r.fields["WG Key"]] = r.fields["Name"]));
        res.end(JSON.stringify(names));
      })
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

setInterval(() => {
  let d = new Date();
  let second = d.getSeconds() + 60 * d.getMinutes() + 1;
  Object.keys(nodes).map(k => (nodes[k][second] = 0));
}, 1000);
