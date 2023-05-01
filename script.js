"use strict";

const defaultNodeColor = "#92D2EE";
const greenNodeColor = "#57D04A";
const redNodeColor = "#FC4C4C";
const darkBluteNodeColor = "#453CCE";
const defaultEdgeColor = "#A8A8A8";

const delay = {
  fast: 1000,
  Average: 2000,
  Slow: 3000,
};

class Node {
  constructor(id, x, y) {
    this._id = id;
    this._x = x;
    this._y = y;
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
  set id(id) {
    this._id = id;
  }
  set x(x) {
    this._x = x;
  }
  set y(y) {
    this._y = y;
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
            "background-color": defaultNodeColor,
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
            "line-color": defaultEdgeColor,
            "text-rotation": "autorotate",
            "target-arrow-color": defaultEdgeColor,
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
    });
    this._container = container;
    this._size = size;
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
  set edges(edges) {
    this._edges = edges;
  }
  set nodes(nodes) {
    this._nodes = nodes;
  }
  get edges() {
    return this._edges;
  }
  get nodes() {
    return this._nodes;
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
    for (let i = 1; i <= this.size; i++) {
      const cyObject = {};
      cyObject["group"] = type;
      if (type == "edges") {
        let randomSource = Math.trunc(Math.random() * this.size) + 1;
        while (randomSource == i) {
          randomSource = Math.trunc(Math.random() * this.size) + 1;
        }
        cyObject["data"] = {
          id: "e" + String(i),
          source: "n" + String(randomSource),
          target: "n" + String(i),
          weight: Math.trunc(Math.random() * 50) + 1,
        };
        const edge = new Edge(
          this.getNodeById(cyObject["data"]["source"]),
          this.getNodeById(cyObject["data"]["target"]),
          cyObject["data"]["weight"],
          cyObject["data"]["id"]
        );
        this["_" + type].push(edge);
        this.adjacentMatrix
          .get(this.getNodeById(cyObject["data"]["source"]))
          .push(edge);
      } else if (type == "nodes") {
        cyObject["data"] = {
          id: "n" + String(i),
        };
        cyObject["position"] = {
          x: 150 * ((i - 1) % 4) + Math.trunc((Math.random() + 2) * 100),
          y:
            200 * Math.trunc((i - 1) / 4) +
            Math.trunc((Math.random() + 1) * 100),
        };
        const node = new Node(
          cyObject["data"]["id"],
          cyObject["position"]["x"],
          cyObject["position"]["y"]
        );
        this["_" + type].push(node);
        this.adjacentMatrix.set(node, []);
      }
      components.push(cyObject);
    }
    this.cyWindow.add(components);
  }
  generateRandomGraph() {
    delete this.adjacentMatrix;
    delete this.nodes;
    delete this.edges;
    this.adjacentMatrix = new Map();
    this.nodes = [];
    this.edges = [];

    this.cyWindow.remove("*");
    this.generateRandomComponents("nodes", this.size);
    this.generateRandomComponents("edges", this.size);
  }
  toggleNodeStart(id, condition) {
    this.cyWindow.$id(id).style({
      "background-color": condition ? greenNodeColor : defaultNodeColor,
    });
  }
  toggleNodeEnd(id, condition) {
    this.cyWindow.$id(id).style({
      "background-color": condition ? redNodeColor : defaultNodeColor,
    });
  }
  markNodeVisited(id) {
    this.cyWindow.$id(id).style({
      "border-width": 2,
      "border-color": "black",
      "background-color": darkBluteNodeColor,
    });
  }
  getNodeById(id) {
    return this.nodes.find((element) => element.id == id);
  }
  getAdjacent(node) {
    return this.adjacentMatrix.get(node);
  }
}
class SearchAlgorithms {
  constructor(graph) {
    this._graph = graph;
  }
  set speed(speed) {
    this._speed = speed;
  }
  set graph(graph) {
    this._graph = graph;
  }
  set parent(parent) {
    this._parent = parent;
  }
  set algorthm(algorthm) {
    this._algorthm = algorthm;
  }
  set start(start) {
    if (this._start) {
      this._graph.toggleNodeStart(this._start.id, false);
    }
    this._graph.toggleNodeStart(start, true);
    this._start = this.graph.getNodeById(start);
  }
  set end(end) {
    if (this._end) {
      this._graph.toggleNodeEnd(this._end.id, false);
    }
    this._graph.toggleNodeEnd(end, true);
    this._end = this.graph.getNodeById(end);
  }
  get graph() {
    return this._graph;
  }
  get speed() {
    return this._speed;
  }
  get parent() {
    return this._parent;
  }
  get algorthm() {
    return this._algorthm;
  }
  get start() {
    return this._start;
  }
  get end() {
    return this._end;
  }
  getPathCost() {
    let result = 0;
    const path = this.getPath();
    for (let i = 1; i < path.length; i++) {
      const edge = this.graph.adjacentMatrix
        .get(path[i - 1])
        .find((element) => element.target == path[i]);
      result += edge.weight;
    }
    return result;
  }
  getPath() {
    let node = this.end;
    const path = [];
    while (node != this.start) {
      path.unshift(node);
      node = this.parent.get(node);
    }
    path.unshift(this.start);
    return path;
  }
  depthFirstSearch() {
    const Solution = this.depthFirstSearchRecursive(this.start);
    console.log("Solution " + (Solution ? "found" : "not found"));
    console.log(this.getPath());
    console.log("With a cost of: ", this.getPathCost());
  }
  depthFirstSearchRecursive(node) {
    console.log(node);
    this.marked.set(node, true);
    this.graph.markNodeVisited(node.id);
    if (node == this.end) {
      return true;
    }
    for (let adjacent of this.graph.getAdjacent(node)) {
      const target = adjacent.target;
      if (!this.marked.get(target)) {
        this.parent.set(target, node);
        const found = this.depthFirstSearchRecursive(target);
        if (found) {
          return true;
        }
        this.parent.set(target, null);
      }
    }
    return false;
  }

  breathFirstSearch() {
    const queue = new FlatQueue();
    queue.push(this.start, 0);
    let Solution = false;

    while (queue.length > 0) {
      const node = queue.pop();
      this.marked.set(node, true);
      this.graph.markNodeVisited(node.id);
      console.log(node);

      if (node == this.end) {
        Solution = true;
        break;
      }

      for (let adjacent of this.graph.getAdjacent(node)) {
        if (!this.marked.get(adjacent.target)) {
          const target = adjacent.target;
          queue.push(target, 0);
          this.parent.set(target, node);
        }
      }
    }
    console.log("Solution " + (Solution ? "found" : "not found"));
    console.log(this.parent);
    console.log(this.getPath());
    console.log("With a cost of: ", this.getPathCost());
  }
  aStar() {}
  djkstra() {}

  visualize() {
    delete this.parent;
    delete this.marked;
    this.parent = new Map();
    this.marked = new Map();
    for (const node of this.graph.nodes) {
      this.marked.set(node, false);
      this.parent.set(node, null);
    }

    switch (this.algorthm) {
      case "Breath First Search":
        this.breathFirstSearch();
        break;
      case "Depth First Search":
        this.depthFirstSearch();
        break;
      case "Djkstra":
        this.djkstra();
        break;
      case "A Star":
        this.aStar();
        break;
    }
  }
}

$(() => {
  const container = "#graphVisualization";
  const generateButton = "#generateGraph";

  const graphObj = new Graph(container, $("#size").val());
  graphObj.generateRandomGraph();

  const searchAlgorithms = new SearchAlgorithms(graphObj);

  $(generateButton).click((e) => {
    graphObj.size = $("#size").val();
    graphObj.generateRandomGraph();
    searchAlgorithms.start = null;
    searchAlgorithms.end = null;
  });
  graphObj.cyWindow.on("tap", "node", function (evt) {
    const id = evt.target.id();
    const start = searchAlgorithms.start;
    const end = searchAlgorithms.end;

    if ((!end && start && id == start.id) || (!start && end && id == end.id)) {
      return;
    } else if (!start) {
      searchAlgorithms.start = id;
    } else if (!end) {
      searchAlgorithms.end = id;
    } else if (id == start.id) {
      searchAlgorithms.start = null;
    } else if (id == end.id) {
      searchAlgorithms.end = null;
    }
  });
  $("#visualize").click((e) => {
    searchAlgorithms.speed = $("#speed").val();
    searchAlgorithms.algorthm = $("#algorithm").val();
    searchAlgorithms.speed = $("#speed").val();
    searchAlgorithms.visualize();
  });
});
