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
  constructor(source, target, weigth, id) {
    this._source = source;
    this._target = target;
    this._weigth = weigth;
    this._id = id;
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
    this.counterNode = 0;
    this.counterEdge = 0;
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
    this.counterEdge = Number(this.size);
    this.counterNode = Number(this.size);
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
  markEdgeVisited(edge) {
    this.cyWindow
      .$id(
        this.edges.find(
          (element) =>
            element.source == edge.source && element.target == edge.target
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
    this.counterEdge = 0;
    this.counterNode = 0;
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
    const cyObject = {};
    cyObject["data"] = {
      id: "n" + String(this.counterNode + 1),
    };
    cyObject["position"] = {
      x: 200,
      y: 200,
    };
    const node = new Node(cyObject["data"]["id"]);
    this.nodes.push(node);
    this.adjacentMatrix.set(node, []);
    this.cyWindow.add(cyObject);
    this.counterNode++;
  }
  deleteEdge(source, target) {
    const sourceNode = this.getNodeById("n" + source);
    const targetNode = this.getNodeById("n" + target);

    const edge = this.edges.find(
      (element) => element.source == sourceNode && element.target == targetNode
    );
    if (!edge) {
      return;
    }

    this.cyWindow.$id(edge.id).remove();
    this.edges.splice(this.edges.indexOf(edge), 1);
  }
  deleteNode(id) {
    const node = this.getNodeById("n" + id);

    if (!node) {
      return;
    }

    this.cyWindow.$id(node.id).remove();
    this.nodes.splice(this.nodes.indexOf(node), 1);
    this.edges = this.edges.filter(
      (item) => item.source != node && item.target != node
    );
  }
  createEdge(source, target, weight) {
    const sourceNode = this.getNodeById("n" + source);
    const targetNode = this.getNodeById("n" + target);

    for (let element of this.edges) {
      if (element.source == sourceNode && element.target == targetNode) {
        return;
      }
    }
    const cyObject = {};
    cyObject["data"] = {
      id: "e" + String(this.counterEdge + 1),
      source: "n" + source,
      target: "n" + target,
      weight: Number(weight),
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
    this.counterEdge++;
  }
  getPostion(node) {
    return this.cyWindow.$id(node.id).position();
  }
}
class SearchAlgorithms {
  constructor(graph) {
    this._graph = graph;
    this._running = false;
  }
  set running(running) {
    this._running = running;
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
  get running() {
    return this._running;
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
  euclideanDistance(node) {
    const sourcePosition = this.graph.getPostion(node);
    const targetPosition = this.graph.getPostion(this.end);

    return Math.sqrt(
      (sourcePosition.x - targetPosition.x) ** 2 +
        (sourcePosition.y - targetPosition.y) ** 2
    );
  }
  manhattenDistance(node) {
    const sourcePosition = this.graph.getPostion(node);
    const targetPosition = this.graph.getPostion(this.end);

    return (
      Math.abs(sourcePosition.x - targetPosition.x) +
      Math.abs(sourcePosition.y - targetPosition.y)
    );
  }
  heuristicFunction(adjacent) {
    if (this.heuristic == "Euclidean Distance") {
      return this.euclideanDistance(adjacent) / 1000;
    } else if (this.heuristic == "Manhattan Distance") {
      return this.manhattenDistance(adjacent) / 1000;
    }
  }
  async depthFirstSearch() {
    return await this.depthFirstSearchRecursive(this.start);
  }
  async depthFirstSearchRecursive(node) {
    this.marked.add(node, true);
    this.graph.markNodeVisited(node.id);
    await new Promise((r) => setTimeout(r, delay[this.speed]));
    if (node == this.end) {
      return true;
    }
    for (let adjacent of this.graph.getAdjacent(node)) {
      const target = adjacent.target;
      if (!this.marked.has(target)) {
        await new Promise((r) => setTimeout(r, delay[this.speed] / 2));
        this.graph.markEdgeVisited(adjacent);
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
      this.marked.add(node, true);
      this.graph.markNodeVisited(node.id);

      if (node == this.end) {
        return true;
      }

      for (let adjacent of this.graph.getAdjacent(node)) {
        if (!this.marked.has(adjacent.target)) {
          const target = adjacent.target;
          await new Promise((r) => setTimeout(r, delay[this.speed] / 2));
          this.graph.markEdgeVisited(adjacent);
          this.queue.unshift(target);
          this.parent.set(target, node);
        }
      }
    }
  }
  async djkstra() {
    const StartEdge = new Edge(null, this.start, 0, 0);
    this.queue.push(StartEdge, StartEdge.weight);

    while (this.queue.length > 0) {
      await new Promise((r) => setTimeout(r, delay[this.speed]));
      const costs = this.queue.peekValue();
      const edge = this.queue.pop();
      this.graph.markNodeVisited(edge.target.id);
      this.parent.set(edge.target, edge.source);
      this.marked.add(edge.target);

      if (edge.target == this.end) {
        return true;
      }

      for (let adjacent of this.graph.getAdjacent(edge.target)) {
        if (
          !this.marked.has(adjacent.target) &&
          this.reachedCosts.get(adjacent.target) > adjacent.weight + costs
        ) {
          await new Promise((r) => setTimeout(r, delay[this.speed] / 2));
          this.reachedCosts.set(adjacent.target, adjacent.weight + costs);
          this.graph.markEdgeVisited(adjacent);
          this.queue.push(adjacent, adjacent.weight + costs);
        }
      }
    }
    return false;
  }
  async aStar() {
    const StartEdge = new Edge(null, this.start, 0, 0);
    this.queue.push(StartEdge, StartEdge.weight);

    while (this.queue.length > 0) {
      await new Promise((r) => setTimeout(r, delay[this.speed]));
      const costs = this.queue.peekValue();
      const edge = this.queue.pop();
      this.graph.markNodeVisited(edge.target.id);
      this.parent.set(edge.target, edge.source);
      this.marked.add(edge.target);

      if (edge.target == this.end) {
        return true;
      }
      for (let adjacent of this.graph.getAdjacent(edge.target)) {
        if (
          !this.marked.has(adjacent.target) &&
          this.reachedCosts.get(adjacent.target) >
            adjacent.weight +
              costs +
              this.heuristicFunction(adjacent.target) / 100
        ) {
          await new Promise((r) => setTimeout(r, delay[this.speed] / 2));
          this.reachedCosts.set(
            adjacent.target,
            adjacent.weight + costs + this.heuristicFunction(adjacent.target)
          );
          this.graph.markEdgeVisited(adjacent);
          console.log(this.reachedCosts.get(adjacent.target));
          this.queue.push(adjacent, this.reachedCosts.get(adjacent.target));
        }
      }
    }
  }

  async visualize() {
    if (!(this.start && this.end && this.graph.nodes.length > 1)) {
      return;
    }
    this.heuristic = $("#heuristicFunction").val();
    this.running = true;
    delete this.parent;
    delete this.marked;
    delete this.queue;
    delete this.reachedNode;
    this.parent = new Map();
    this.marked = new Set();
    this.reachedCosts = new Map();
    this.queue = this.algorthm == "Breath First Search" ? [] : new FlatQueue();
    for (const node of this.graph.nodes) {
      this.parent.set(node, null);
      this.reachedCosts.set(node, 100000000);
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
    await new Promise((r) => setTimeout(r, 3000));
    this.graph.resetMarkings();
    this.start = null;
    this.end = null;
    this.running = false;
  }
}

$(() => {
  const container = "#graphVisualization";
  const generateButton = "#generateGraph";

  const graphObj = new Graph(container);
  const searchAlgorithms = new SearchAlgorithms(graphObj);

  $(generateButton).click((e) => {
    if (!searchAlgorithms.running) {
      graphObj.size = $("#size").val();
      graphObj.generateRandomGraph();
      searchAlgorithms.start = null;
      searchAlgorithms.end = null;
    }
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
    if (
      $("#createSource").val() &&
      $("#createTarget").val() &&
      $("#weight").val()
    ) {
      graphObj.createEdge(
        $("#createSource").val(),
        $("#createTarget").val(),
        $("#weight").val()
      );
      $("#createSource, #createTarget, #weight").val("");
    }
  });
  $("#deleteEdge").click((e) => {
    if ($("#deleteSource").val() && $("#deleteTarget").val()) {
      graphObj.deleteEdge($("#deleteSource").val(), $("#deleteTarget").val());
      $("#deleteSource, #deleteTarget").val("");
    }
  });
  $("#deleteNode").click((e) => {
    if ($("#deleteId").val()) {
      graphObj.deleteNode($("#deleteId").val());
      $("#deleteId").val("");
    }
  });
  $(".question").click(function (e) {
    $(`#answer${e.target.id}`).slideToggle();
  });
  $("#algorithm").change((e) => {
    if ($("#algorithm").val() == "A Star") {
      $("#heuristicFunction").show();
    } else {
      $("#heuristicFunction").hide();
    }
  });
});
