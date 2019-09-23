# Althea Network Visualizer

A tool for Althea network organizers to visualize the topology of the network. The tool reads the JSON output of a router's /neighbors endpoint which is derived from its babel routing table. Neighboring nodes are connected in the graph and the route metric is used to identify good vs weak connections.

Nodes in the network are identified by their mesh IPv6 address and can be given labels that will persist in the browser's local storage.
