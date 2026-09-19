import { DEFAULT_FRICTION } from './const';
import { FlowPart, FlowRoute, LiquidFlow, PartFlows } from './types';

/**
 * Flows are calculated by solving the layout as a linear network.
 *
 * - Every coordinate used by a part transition is a node.
 *   Adjacent parts share edge coordinates, and are connected through them.
 * - Every transition is an edge, with friction as resistance,
 *   and pressure as a source pushing liquid along the edge.
 *   Opposite transitions of the same part are merged into a single edge.
 *   A transition without an opposite is a one-way edge.
 * - Source and sink transitions connect the network to a terminal node.
 *   All terminals are at the same reference pressure.
 * - Transitions without friction (container cells) merge their nodes.
 *
 * Node pressures follow from conservation of flow at every node.
 * One-way edges that would carry flow in the wrong direction are removed,
 * and the network is solved again until all remaining flows are valid.
 *
 * Liquids are then propagated from terminals, downstream along the flow.
 * Liquids also spread through connected parts without flow,
 * so a full but static tube keeps its color.
 */

/** Flows below this value are considered zero */
export const FLOW_EPSILON = 1e-9;

/** Results are rounded to remove floating point noise */
const roundFlow = (value: number): number => {
  const rounded = Math.round(value / FLOW_EPSILON) * FLOW_EPSILON;
  return rounded === 0 ? 0 : rounded;
};

const MAX_ONE_WAY_ITERATIONS = 20;
const MAX_LIQUID_ITERATIONS = 100;

export const ONE_WAY_WARNING =
  'The direction of flow through one-way parts could not be resolved. ' +
  'Some flows might be incorrect.';

interface NetworkEdge {
  part: FlowPart;

  /** Coordinates at either end. For one-way edges, liquid travels from u to v. */
  u: string;
  v: string;
  uNode: number;
  vNode: number;

  /** Zero friction means u and v are the same node. */
  friction: number;

  /** Pressure pushing liquid from u to v */
  pressure: number;
  oneWay: boolean;

  /** One-way edge that would carry flow in the wrong direction */
  blocked: boolean;

  /** Result: total flow, positive from u to v */
  flow: number;

  /** Result: flow per liquid, as positive amounts in the direction of flow */
  liquidFlows: LiquidFlow;
}

interface RoutePair {
  a: string;
  b: string;
  forward: FlowRoute[];
  backward: FlowRoute[];
}

interface FlowNetwork {
  edges: NetworkEdge[];
  nodeCount: number;
  /** Terminal node ids, and the liquids available at the terminal */
  terminals: Map<number, Set<string>>;
  /** Coordinates that identify a terminal */
  terminalCoords: Set<string>;
}

class UnionFind {
  private parents: number[] = [];

  public add(): number {
    this.parents.push(this.parents.length);
    return this.parents.length - 1;
  }

  public find(id: number): number {
    let root = id;
    while (this.parents[root] !== root) {
      root = this.parents[root];
    }
    while (this.parents[id] !== root) {
      const next = this.parents[id];
      this.parents[id] = root;
      id = next;
    }
    return root;
  }

  public union(a: number, b: number): void {
    this.parents[this.find(a)] = this.find(b);
  }
}

const routeFriction = (route: FlowRoute): number =>
  route.friction != null &&
  Number.isFinite(route.friction) &&
  route.friction >= 0
    ? route.friction
    : DEFAULT_FRICTION;

const routePressure = (route: FlowRoute): number =>
  route.pressure != null && Number.isFinite(route.pressure)
    ? route.pressure
    : 0;

function buildNetwork(parts: FlowPart[]): FlowNetwork {
  const nodeIds = new UnionFind();
  const coordNodes = new Map<string, number>();
  const terminalCoords = new Set<string>();
  const terminalLiquids = new Map<string, Set<string>>();
  const edges: NetworkEdge[] = [];

  const nodeId = (coord: string): number => {
    let id = coordNodes.get(coord);
    if (id === undefined) {
      id = nodeIds.add();
      coordNodes.set(coord, id);
    }
    return id;
  };

  const addTerminal = (coord: string, liquids: string[] = []): void => {
    terminalCoords.add(coord);
    const known = terminalLiquids.get(coord) ?? new Set<string>();
    liquids.forEach((liquid) => known.add(liquid));
    terminalLiquids.set(coord, known);
  };

  for (const part of parts) {
    // Group the routes of a part by the pair of coordinates they connect.
    // The pair is ordered, so opposite routes end up in the same group.
    const pairs = new Map<string, RoutePair>();

    for (const inCoord in part.transitions) {
      for (const route of part.transitions[inCoord]) {
        const outCoord = route.outCoords;
        if (inCoord === outCoord) {
          continue;
        }
        const [a, b] =
          inCoord < outCoord ? [inCoord, outCoord] : [outCoord, inCoord];
        const key = `${a}|${b}`;
        let pair = pairs.get(key);
        if (pair === undefined) {
          pair = { a, b, forward: [], backward: [] };
          pairs.set(key, pair);
        }
        (inCoord === a ? pair.forward : pair.backward).push(route);

        if (route.source) {
          addTerminal(inCoord, route.liquids);
        }
        if (route.sink) {
          addTerminal(outCoord);
        }
      }
    }

    for (const { a, b, forward, backward } of pairs.values()) {
      const oneWay = forward.length === 0 || backward.length === 0;
      // For one-way edges, u -> v is the direction of the route
      const [u, v] = backward.length === 0 ? [a, b] : oneWay ? [b, a] : [a, b];
      const [uRoutes, vRoutes] =
        u === a ? [forward, backward] : [backward, forward];
      const allRoutes = [...forward, ...backward];

      const pressure =
        uRoutes.reduce((acc, r) => acc + routePressure(r), 0) -
        vRoutes.reduce((acc, r) => acc + routePressure(r), 0);
      const friction = Math.min(...allRoutes.map(routeFriction));

      const uNode = nodeId(u);
      const vNode = nodeId(v);
      if (friction === 0) {
        nodeIds.union(uNode, vNode);
      }

      edges.push({
        part,
        u,
        v,
        uNode,
        vNode,
        friction,
        pressure,
        oneWay,
        blocked: false,
        flow: 0,
        liquidFlows: {},
      });
    }
  }

  // Resolve merged nodes
  for (const edge of edges) {
    edge.uNode = nodeIds.find(edge.uNode);
    edge.vNode = nodeIds.find(edge.vNode);
  }

  const terminals = new Map<number, Set<string>>();
  for (const [coord, liquids] of terminalLiquids) {
    const node = nodeIds.find(nodeId(coord));
    const known = terminals.get(node) ?? new Set<string>();
    liquids.forEach((liquid) => known.add(liquid));
    terminals.set(node, known);
  }

  return {
    edges,
    nodeCount: coordNodes.size,
    terminals,
    terminalCoords,
  };
}

const isActive = (edge: NetworkEdge): boolean =>
  !edge.blocked && edge.friction > 0 && edge.uNode !== edge.vNode;

interface Solution {
  pressures: Float64Array;
  /** Non-terminal nodes with a path to a terminal */
  connected: Set<number>;
}

/**
 * Solves node pressures for all nodes connected to a terminal.
 * Nodes that are not connected to a terminal have no reference pressure,
 * and are assigned zero.
 *
 * The equations are solved with sparse Gaussian elimination.
 * Nodes with the fewest neighbors are eliminated first,
 * so chains of tubes are reduced without creating new connections.
 */
function solvePressures(network: FlowNetwork): Solution {
  const { edges, nodeCount, terminals } = network;
  const pressures = new Float64Array(nodeCount);
  const active = edges.filter(isActive);

  // Find all nodes connected to a terminal
  const adjacent: number[][] = Array.from({ length: nodeCount }, () => []);
  for (const edge of active) {
    adjacent[edge.uNode].push(edge.vNode);
    adjacent[edge.vNode].push(edge.uNode);
  }
  const connected = new Set<number>();
  const queue = [...terminals.keys()];
  while (queue.length) {
    const node = queue.pop()!;
    for (const other of adjacent[node]) {
      if (!terminals.has(other) && !connected.has(other)) {
        connected.add(other);
        queue.push(other);
      }
    }
  }

  // Build the equations for connected, non-terminal nodes.
  // Terminal pressures are zero, and drop out of the equations.
  const diagonal = new Map<number, number>();
  const offDiagonal = new Map<number, Map<number, number>>();
  const rhs = new Map<number, number>();
  for (const node of connected) {
    diagonal.set(node, 0);
    offDiagonal.set(node, new Map());
    rhs.set(node, 0);
  }
  const addOffDiagonal = (a: number, b: number, value: number): void => {
    const row = offDiagonal.get(a)!;
    row.set(b, (row.get(b) ?? 0) + value);
  };

  for (const edge of active) {
    const { uNode, vNode, pressure } = edge;
    const conductance = 1 / edge.friction;
    const uUnknown = connected.has(uNode);
    const vUnknown = connected.has(vNode);
    if (!uUnknown && !vUnknown) {
      continue;
    }
    // Flow from u to v is conductance * (P[u] - P[v] + pressure).
    // The sum of outgoing flows at each node is zero.
    if (uUnknown) {
      diagonal.set(uNode, diagonal.get(uNode)! + conductance);
      rhs.set(uNode, rhs.get(uNode)! - conductance * pressure);
    }
    if (vUnknown) {
      diagonal.set(vNode, diagonal.get(vNode)! + conductance);
      rhs.set(vNode, rhs.get(vNode)! + conductance * pressure);
    }
    if (uUnknown && vUnknown) {
      addOffDiagonal(uNode, vNode, -conductance);
      addOffDiagonal(vNode, uNode, -conductance);
    }
  }

  // Eliminate nodes one by one, fewest neighbors first
  interface Elimination {
    node: number;
    diagonal: number;
    rhs: number;
    neighbors: [number, number][];
  }
  const eliminated: Elimination[] = [];
  const remaining = new Set(connected);

  while (remaining.size) {
    let node = -1;
    let degree = Infinity;
    for (const candidate of remaining) {
      const candidateDegree = offDiagonal.get(candidate)!.size;
      if (candidateDegree < degree) {
        node = candidate;
        degree = candidateDegree;
        if (degree <= 1) {
          break;
        }
      }
    }
    remaining.delete(node);

    const d = diagonal.get(node)!;
    const b = rhs.get(node)!;
    const neighbors = [...offDiagonal.get(node)!.entries()];
    eliminated.push({ node, diagonal: d, rhs: b, neighbors });

    for (const [m, am] of neighbors) {
      const row = offDiagonal.get(m)!;
      row.delete(node);
      diagonal.set(m, diagonal.get(m)! - (am * am) / d);
      rhs.set(m, rhs.get(m)! - (am * b) / d);
      for (const [n, an] of neighbors) {
        if (n !== m) {
          row.set(n, (row.get(n) ?? 0) - (am * an) / d);
        }
      }
    }
  }

  // Substitute back, in reverse order of elimination
  for (let i = eliminated.length - 1; i >= 0; i--) {
    const { node, diagonal: d, rhs: b, neighbors } = eliminated[i];
    const sum = neighbors.reduce((acc, [n, a]) => acc + a * pressures[n], 0);
    pressures[node] = (b - sum) / d;
  }

  return { pressures, connected };
}

function applyPressures(network: FlowNetwork, solution: Solution): void {
  const { edges, nodeCount, terminals } = network;
  const { pressures, connected } = solution;
  const isConnected = (node: number): boolean =>
    terminals.has(node) || connected.has(node);

  // Net flow leaving each node through active edges
  const leaving = new Float64Array(nodeCount);

  for (const edge of edges) {
    // Edges without a path to a terminal have no flow, even if they have pressure
    if (!isActive(edge) || !isConnected(edge.uNode)) {
      edge.flow = 0;
    } else {
      edge.flow =
        (pressures[edge.uNode] - pressures[edge.vNode] + edge.pressure) /
        edge.friction;
      if (Math.abs(edge.flow) < FLOW_EPSILON) {
        edge.flow = 0;
      }
      leaving[edge.uNode] += edge.flow;
      leaving[edge.vNode] -= edge.flow;
    }
  }

  // Merged edges (container cells) carry whatever flows through their node.
  // Flow leaves the part at the network side of the edge.
  for (const edge of edges) {
    if (edge.friction === 0 && edge.uNode === edge.vNode) {
      const uIsTerminal = network.terminalCoords.has(edge.u);
      edge.flow = uIsTerminal ? leaving[edge.uNode] : -leaving[edge.uNode];
    }
  }
}

/**
 * Solves flows, and blocks one-way edges that carry reverse flow.
 * Blocking an edge changes the flow elsewhere,
 * so the network is solved repeatedly until no new edges are blocked.
 */
function solveFlows(network: FlowNetwork, warnings: Set<string>): void {
  for (let i = 0; i < MAX_ONE_WAY_ITERATIONS; i++) {
    applyPressures(network, solvePressures(network));
    const reversed = network.edges.filter(
      (edge) => edge.oneWay && isActive(edge) && edge.flow < 0,
    );
    if (reversed.length === 0) {
      return;
    }
    reversed.forEach((edge) => {
      edge.blocked = true;
    });
  }
  warnings.add(ONE_WAY_WARNING);
}

const tailNode = (edge: NetworkEdge): number =>
  edge.flow > 0 ? edge.uNode : edge.vNode;

const headNode = (edge: NetworkEdge): number =>
  edge.flow > 0 ? edge.vNode : edge.uNode;

/**
 * Propagates liquids downstream.
 * Terminals with liquids inject them into all outgoing flow.
 * Other nodes pass on the liquids they receive,
 * in proportion to the amount received.
 */
function propagateLiquids(network: FlowNetwork): void {
  const { edges, nodeCount, terminals } = network;
  const flowing = edges.filter((edge) => edge.flow !== 0);

  const terminalFractions = new Map<number, LiquidFlow>();
  for (const [node, liquids] of terminals) {
    const fractions: LiquidFlow = {};
    liquids.forEach((liquid) => {
      fractions[liquid] = 1 / liquids.size;
    });
    terminalFractions.set(node, fractions);
  }

  // Process edges in order of distance from a terminal.
  // Loops are resolved by repeating until the result is stable.
  const outgoing: NetworkEdge[][] = Array.from({ length: nodeCount }, () => []);
  flowing.forEach((edge) => outgoing[tailNode(edge)].push(edge));
  const ordered: NetworkEdge[] = [];
  const visited = new Set<number>(terminals.keys());
  const queue = [...terminals.keys()];
  for (let i = 0; i < queue.length; i++) {
    const node = queue[i];
    for (const edge of outgoing[node]) {
      ordered.push(edge);
      const head = headNode(edge);
      if (!visited.has(head)) {
        visited.add(head);
        queue.push(head);
      }
    }
  }
  const orderedSet = new Set(ordered);
  flowing
    .filter((edge) => !orderedSet.has(edge))
    .forEach((edge) => ordered.push(edge));

  for (let i = 0; i < MAX_LIQUID_ITERATIONS; i++) {
    const received: LiquidFlow[] = Array.from(
      { length: nodeCount },
      () => ({}),
    );
    const receivedTotal = new Float64Array(nodeCount);
    for (const edge of flowing) {
      const head = headNode(edge);
      receivedTotal[head] += Math.abs(edge.flow);
      for (const liquid in edge.liquidFlows) {
        received[head][liquid] =
          (received[head][liquid] ?? 0) + edge.liquidFlows[liquid];
      }
    }

    let changed = false;
    for (const edge of ordered) {
      const tail = tailNode(edge);
      const head = headNode(edge);
      const amount = Math.abs(edge.flow);
      const updated: LiquidFlow = {};
      const fractions = terminalFractions.get(tail);
      if (fractions) {
        for (const liquid in fractions) {
          updated[liquid] = amount * fractions[liquid];
        }
      } else if (receivedTotal[tail] > 0) {
        for (const liquid in received[tail]) {
          const value = (amount * received[tail][liquid]) / receivedTotal[tail];
          if (value > FLOW_EPSILON) {
            updated[liquid] = value;
          }
        }
      }
      const liquids = new Set([
        ...Object.keys(edge.liquidFlows),
        ...Object.keys(updated),
      ]);
      for (const liquid of liquids) {
        const delta = (updated[liquid] ?? 0) - (edge.liquidFlows[liquid] ?? 0);
        if (Math.abs(delta) > FLOW_EPSILON) {
          changed = true;
        }
        // Downstream edges in this pass use the updated value
        received[head][liquid] = (received[head][liquid] ?? 0) + delta;
      }
      edge.liquidFlows = updated;
    }
    if (!changed) {
      break;
    }
  }
}

/**
 * Finds liquids in parts without flow.
 * Liquids spread from terminals and from flowing parts
 * through all connected parts without flow.
 */
function findStaticLiquids(network: FlowNetwork): Map<number, Set<string>> {
  const { edges, nodeCount, terminals } = network;
  const liquids = new Map<number, Set<string>>();
  const add = (node: number, liquid: string): boolean => {
    const known = liquids.get(node) ?? new Set<string>();
    liquids.set(node, known);
    if (known.has(liquid)) {
      return false;
    }
    known.add(liquid);
    return true;
  };

  for (const [node, terminalLiquids] of terminals) {
    terminalLiquids.forEach((liquid) => add(node, liquid));
  }
  for (const edge of edges) {
    if (edge.flow !== 0) {
      for (const liquid in edge.liquidFlows) {
        if (edge.liquidFlows[liquid] > FLOW_EPSILON) {
          add(headNode(edge), liquid);
        }
      }
    }
  }

  const adjacent: number[][] = Array.from({ length: nodeCount }, () => []);
  for (const edge of edges) {
    if (isActive(edge) && edge.flow === 0) {
      adjacent[edge.uNode].push(edge.vNode);
      adjacent[edge.vNode].push(edge.uNode);
    }
  }
  const queue = [...liquids.keys()];
  while (queue.length) {
    const node = queue.pop()!;
    for (const other of adjacent[node]) {
      let changed = false;
      liquids.get(node)!.forEach((liquid) => {
        changed = add(other, liquid) || changed;
      });
      if (changed) {
        queue.push(other);
      }
    }
  }
  return liquids;
}

function partFlows(
  network: FlowNetwork,
  staticLiquids: Map<number, Set<string>>,
): Map<FlowPart, PartFlows> {
  const result = new Map<FlowPart, PartFlows>();
  const add = (
    part: FlowPart,
    coord: string,
    liquid: string,
    value: number,
  ): void => {
    const flows = result.get(part) ?? {};
    result.set(part, flows);
    const coordFlows = flows[coord] ?? {};
    flows[coord] = coordFlows;
    coordFlows[liquid] = (coordFlows[liquid] ?? 0) + value;
  };

  for (const edge of network.edges) {
    const { part, u, v } = edge;
    if (edge.flow !== 0) {
      // Liquid enters the part at the tail, and leaves at the head
      const [tail, head] = edge.flow > 0 ? [u, v] : [v, u];
      for (const liquid in edge.liquidFlows) {
        add(part, tail, liquid, -edge.liquidFlows[liquid]);
        add(part, head, liquid, edge.liquidFlows[liquid]);
      }
    } else if (isActive(edge) || edge.friction === 0) {
      const liquids = new Set<string>([
        ...(staticLiquids.get(edge.uNode) ?? []),
        ...(staticLiquids.get(edge.vNode) ?? []),
      ]);
      liquids.forEach((liquid) => {
        add(part, u, liquid, 0);
        add(part, v, liquid, 0);
      });
    }
  }

  for (const flows of result.values()) {
    for (const coord in flows) {
      for (const liquid in flows[coord]) {
        flows[coord][liquid] = roundFlow(flows[coord][liquid]);
      }
    }
  }
  return result;
}

/**
 * Calculates flows for all parts.
 * Flow coordinates are absolute, as used in part transitions.
 */
export function solveNetworkFlows(
  parts: FlowPart[],
  warnings: Set<string>,
): FlowPart[] {
  const network = buildNetwork(parts);
  solveFlows(network, warnings);
  propagateLiquids(network);
  const staticLiquids = findStaticLiquids(network);
  const flows = partFlows(network, staticLiquids);

  return parts.map((part) => ({ ...part, flows: flows.get(part) ?? {} }));
}
