"use strict";

class Node {
  constructor(id, x, y, cyObject) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._cyObject = cyObject;
  }
  get id() {
    return this._id;
  }
  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }
  get cyObject() {
    return this._cyObject;
  }
  set id(id) {
    this._id = id;
  }
  set x(x) {
    this._x = x;
  }
  set y(y) {
    this._y = y;
  }
  set cyObject(cyObject) {
    this._cyObject = cyObject;
  }
}

class Edge {
  constructor(source, target, weigth, id, cyObject) {
    this._source = source;
    this._target = target;
    this._weigth = weigth;
    this._id = id;
    this._cyObject = cyObject;
  }
  get id() {
    return this._id;
  }
  get source() {
    return this._source;
  }
  get target() {
    return this._target;
  }
  get weight() {
    return this._weigth;
  }
  get cyObject() {
    return this._cyObject;
  }
  set id(id) {
    this._id = id;
  }
  set source(source) {
    this._source = source;
  }
  set target(target) {
    this._target = target;
  }
  set cyObject(cyObject) {
    this._cyObject = cyObject;
  }
  set weigth(weigth) {
    this._weigth = weight;
  }
}

class Graph {
  constructor(container, size) {
    this._cyWindow = cytoscape({
      container: $(container),
      wheelSensitivity: 0.1,
      style: [
        // the stylesheet for the graph
        {
          selector: "node",
          style: {
            "background-color": "#92D2EE",
            "text-valign": "center",
            "text-halign": "center",
            label: "data(id)",
          },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            label: "data(weight)",
            "text-margin-y": -10,
            "line-color": "#A8A8A8",
            "text-rotation": "autorotate",
            "target-arrow-color": "#A8A8A8",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
    });
    this._container = container;
    this._size = size;
    this.nodes = [];
    this.edges = [];
  }
  set cyWindow(cyWindow) {
    this._cyWindow = cyWindow;
  }
  set container(container) {
    this._container = container;
  }
  set size(size) {
    this._size = size;
  }
  get cyWindow() {
    return this._cyWindow;
  }
  get container() {
    return this._container;
  }
  get size() {
    return this._size;
  }
  generateRandomComponents(type) {
    const components = [];
    this[type] = [];
    for (let i = 1; i <= this._size; i++) {
      const cyObject = {};
      cyObject["group"] = type;
      if (type == "edges") {
        let randomSource = Math.trunc(Math.random() * this._size) + 1;
        while (randomSource == i) {
          randomSource = Math.trunc(Math.random() * this._size) + 1;
        }
        cyObject["data"] = {
          id: "e" + String(i),
          source: "n" + String(randomSource),
          target: "n" + String(i),
          weight: Math.trunc(Math.random() * 50) + 1,
        };
        this[type].push(
          new Edge(
            cyObject["data"]["source"],
            cyObject["data"]["target"],
            cyObject["data"]["weight"],
            cyObject["data"]["id"],
            cyObject
          )
        );
      } else if (type == "nodes") {
        cyObject["data"] = {
          id: "n" + String(i),
        };
        cyObject["position"] = {
          x: 200 * ((i - 1) % 4) + Math.trunc((Math.random() + 2) * 100),
          y:
            200 * Math.trunc((i - 1) / 4) +
            Math.trunc((Math.random() + 1) * 100),
        };
        this[type].push(
          new Node(
            cyObject["data"]["id"],
            cyObject["position"]["x"],
            cyObject["position"]["y"],
            cyObject
          )
        );
      }
      components.push(cyObject);
    }
    this._cyWindow.add(components);
  }
  generateRandomGraph() {
    this._cyWindow.remove("*");
    this.generateRandomComponents("nodes", this._size);
    this.generateRandomComponents("edges", this._size);
  }
}
$(() => {
  const container = "#graphVisualization";
  const generateButton = "#generateGraph";
  const obj = new Graph(container, 5);
  obj.generateRandomGraph();
  $(generateButton).click((e) => {
    obj.generateRandomGraph();
  });
});
