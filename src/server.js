import sirv from "sirv";
import polka from "polka";
import compression from "compression";
import * as sapper from "@sapper/server";
import fs from "fs";
import Airtable from "airtable";
import { json } from "body-parser";
import config from "./config";

import "./styles.css";

const UDPPORT = 33333;
const HOST = "0.0.0.0";
const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";
let nodes = {};

const handler = async (req, res, next) => {
  const { list, organizer, password } = req.body;

  switch (req.path) {
    case "/heartbeats":
      const filter = {};
      if (list)
        list.map(n => (filter[n] = nodes[n]))
      res.end(JSON.stringify(filter));
      break;
    case "/nodes":
      if (!config[organizer] || password !== config[organizer].password)
        return (res.statusCode=401,res.end('Auth failed!'));

      const base = new Airtable({ apiKey: config.airtable }).base(
        config[organizer].base
      );

      await new Promise((resolve, reject) => {
        base("Nodes")
          .select()
          .all((err, rows) => {
            let nodes = {};
            rows.map(r => (nodes[r.fields["WG Key"]] = r.fields["Name"]));
            resolve(res.end(JSON.stringify(nodes)));
          });
      });
      break;
  }

  next();
};

polka() // You can also use Express
  .use(json())
  .use(
    "/network",
    compression({ threshold: 0 }),
    handler,
    sirv("static", { dev }),
    sapper.middleware()
  )
  .post("/test", (req, res) => res.end(JSON.stringify(req.body)))
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

fs.readFile("/tmp/nodes", (err, data) => {
  if (data) nodes = JSON.parse(data);
});

setInterval(() => {
  fs.writeFile("/tmp/nodes", JSON.stringify(nodes), () => {});
}, 10000);

setInterval(() => {
  let d = new Date();
  let second = d.getSeconds() + 60 * d.getMinutes() + 1;
  if (second % 60 === 0) {
    Object.keys(nodes).map(k => {
      for (let i = 0; i < 65; i++) nodes[k][second + i] = 0;
    });
  }
}, 1000);
