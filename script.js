"use strict";

const defaultNodeColor = "#92D2EE";
const greenNodeColor = "#57D04A";
const redNodeColor = "#FC4C4C";
const darkBlueColor = "#3333FF";
const defaultEdgeColor = "#A8A8A8";

const delay = {
  Fast: 500,
  Average: 1000,
  Slow: 2000,
};

class Node {
  constructor(id) {
    this._id = id;
  }
  get id() {
    return this._id;
  }
  set id(id) {
    this._id = id;
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
  constructor(container) {
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
            "target-arrow-color": defaultEdgeColor,
            "text-rotation": "autorotate",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
          },
        },
      ],
    });
    this.nodes = [];
    this.edges = [];
    this.adjacentMatrix = new Map();
    this._container = container;
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
        const node = new Node(cyObject["data"]["id"]);
        this["_" + type].push(node);
        this.adjacentMatrix.set(node, []);
      }
      components.push(cyObject);
    }
    this.cyWindow.add(components);
  }
  generateRandomGraph() {
    this.resetGraph();
    this.generateRandomComponents("nodes");
    this.generateRandomComponents("edges");
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
      "background-color": darkBlueColor,
    });
  }
  markEdgeVisited(source, target) {
    this.cyWindow
      .$id(
        this.edges.find(
          (element) => element.source == source && element.target == target
        ).id
      )
      .style({
        "line-color": darkBlueColor,
        "target-arrow-color": darkBlueColor,
      });
  }
  resetMarkings() {
    this.cyWindow.$("node").style({
      "border-width": 0,
      "background-color": defaultNodeColor,
    });
    this.cyWindow.$("edge").style({
      "line-color": defaultEdgeColor,
      "target-arrow-color": defaultEdgeColor,
    });
  }
  resetGraph() {
    this.cyWindow.elements().remove();
    delete this.adjacentMatrix;
    delete this.nodes;
    delete this.edges;
    this.adjacentMatrix = new Map();
    this.nodes = [];
    this.edges = [];
  }
  getNodeById(id) {
    return this.nodes.find((element) => element.id == id);
  }
  getAdjacent(node) {
    return this.adjacentMatrix.get(node);
  }
  createNode() {
    const currentQuantity = this.cyWindow.$("node").length;
    const cyObject = {};
    cyObject["data"] = {
      id: "n" + String(currentQuantity + 1),
    };
    cyObject["position"] = {
      x: 200,
      y: 200,
    };
    const node = new Node(cyObject["data"]["id"]);
    this.nodes.push(node);
    this.adjacentMatrix.set(node, []);
    this.cyWindow.add(cyObject);
  }
  createEdge(source, target, weight) {
    const sourceNode = this.getNodeById("n" + source);
    const targetNode = this.getNodeById("n" + target);

    for (let element of this.edges) {
      if (element.source == sourceNode && element.target == targetNode) {
        return;
      }
    }

    const currentQuantity = this.cyWindow.$("edge").length;
    const cyObject = {};
    cyObject["data"] = {
      id: "e" + String(currentQuantity + 1),
      source: "n" + source,
      target: "n" + target,
      weight: weight,
    };
    const edge = new Edge(
      this.getNodeById(cyObject["data"]["source"]),
      this.getNodeById(cyObject["data"]["target"]),
      cyObject["data"]["weight"],
      cyObject["data"]["id"]
    );
    this.edges.push(edge);
    this.adjacentMatrix
      .get(this.getNodeById(cyObject["data"]["source"]))
      .push(edge);
    this.cyWindow.add(cyObject);
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
  set queue(queue) {
    this._queue = queue;
  }
  get queue() {
    return this._queue;
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
      result += Number(edge.weight);
    }
    return result;
  }
  getPath() {
    let node = this.end;
    const path = [];
    while (node != this.start && node) {
      path.unshift(node);
      node = this.parent.get(node);
    }
    if (node) {
      path.unshift(this.start);
    }
    return path;
  }
  getPathText() {
    let node = this.end;
    const path = [];
    while (node != this.start && node) {
      path.unshift(node.id);
      node = this.parent.get(node);
    }
    if (node) {
      path.unshift(this.start.id);
    }
    return path;
  }
  async depthFirstSearch() {
    return await this.depthFirstSearchRecursive(this.start);
  }
  async depthFirstSearchRecursive(node) {
    // console.log(node);
    this.marked.set(node, true);
    this.graph.markNodeVisited(node.id);
    await new Promise((r) => setTimeout(r, delay[this.speed]));
    if (node == this.end) {
      return true;
    }
    for (let adjacent of this.graph.getAdjacent(node)) {
      const target = adjacent.target;
      if (!this.marked.get(target)) {
        await new Promise((r) => setTimeout(r, delay[this.speed] / 2));
        this.graph.markEdgeVisited(node, target);
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

  async breathFirstSearch() {
    this.queue.unshift(this.start);

    while (this.queue.length > 0) {
      await new Promise((r) => setTimeout(r, delay[this.speed]));
      const node = this.queue.pop();
      this.marked.set(node, true);
      console.log(this.queue);
      console.log(this.start);
      console.log(node);
      this.graph.markNodeVisited(node.id);
      // console.log(node);

      if (node == this.end) {
        return true;
      }

      for (let adjacent of this.graph.getAdjacent(node)) {
        if (!this.marked.get(adjacent.target)) {
          const target = adjacent.target;
          await new Promise((r) => setTimeout(r, delay[this.speed] / 2));
          this.graph.markEdgeVisited(node, target);
          this.queue.unshift(target);
          this.parent.set(target, node);
        }
      }
    }
  }
  aStar() {}
  djkstra() {}

  async visualize() {
    delete this.parent;
    delete this.marked;
    delete this.queue;
    this.parent = new Map();
    this.marked = new Map();
    this.queue = this.algorthm == "Breath First Search" ? [] : new FlatQueue();
    for (const node of this.graph.nodes) {
      this.marked.set(node, false);
      this.parent.set(node, null);
    }

    let Solution = false;
    switch (this.algorthm) {
      case "Breath First Search":
        Solution = await this.breathFirstSearch();
        break;
      case "Depth First Search":
        Solution = await this.depthFirstSearch();
        break;
      case "Djkstra":
        Solution = await this.djkstra();
        break;
      case "A Star":
        Solution = await this.aStar();
        break;
    }
    $("#solvable, #unsolvable").hide();
    if (Solution) {
      $("#path").text(this.getPathText().join(" -> "));
      $("#pathCost").text("With a cost of: " + this.getPathCost());
      $("#solvable").show();
    } else {
      $("#unsolvable").show();
    }
    // console.log("Solution " + (Solution ? "found" : "not found"));
    // console.log(this.getPath());
    // console.log("With a cost of: ", this.getPathCost());
    await new Promise((r) => setTimeout(r, 3000));
    this.graph.resetMarkings();
    this.start = null;
    this.end = null;
  }
}

$(() => {
  const container = "#graphVisualization";
  const generateButton = "#generateGraph";

  const graphObj = new Graph(container);
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
  $("#resetGraph").click((e) => {
    graphObj.resetGraph();
  });
  $("#createNode").click((e) => {
    graphObj.createNode();
  });
  $("#createEdge").click((e) => {
    graphObj.createEdge(
      $("#source").val(),
      $("#target").val(),
      $("#weight").val()
    );
    $("#source, #target, #weight").val("");
  });
  $(".question").click(function (e) {
    $(`#answer${e.target.id}`).slideToggle();
  });
});
