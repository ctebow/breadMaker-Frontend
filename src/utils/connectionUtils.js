// Assist in making a connections graph. 

  function isSamePoint(p1x, p1y, p2x, p2y) {
    return p1x === p2x && p1y === p2y;
  }
  
  function getWireAlignment(wire) {
    if (wire.y1 === wire.y2) return "x";
    if (wire.x1 === wire.x2) return "y";
    else return "d"; // for diagonal. 
  }

  function hasComponentConnected(point, componentIds) {
    function isSamePoint(x1, y1, x2, y2) {
      return x1 === x2 && y1 === y2;
    }
  
    // Iterate over all components
    for (const compId in componentIds) {
      const comp = componentIds[compId];
      if (!comp.snapPoints) continue;
  
      for (const sp of comp.snapPoints) {
        if (isSamePoint(point.x, point.y, sp.x, sp.y)) {
          return true; // wire connects to this component at a snap point
        }
      }
      
    }
  
    return false; // no connection found
  }
  
  function mergeCornerWires(wires, componentIds) {
    const wiresCopy = wires.map(w => ({ ...w }));
    const usedIndices = new Set();
    const mergedWires = [];
  
    const allEndpoints = [];
    wiresCopy.forEach((wire, idx) => {
      allEndpoints.push({ x: wire.x1, y: wire.y1, wireIndex: idx });
      allEndpoints.push({ x: wire.x2, y: wire.y2, wireIndex: idx });
    });
  
    function countWiresAtPoint(x, y) {
      const pointKey = (px, py) => `${px},${py}`;
      const wireIndices = new Set();
      for (const ep of allEndpoints) {
        if (ep.x === x && ep.y === y) {
          wireIndices.add(ep.wireIndex);
        }
      }
      return wireIndices.size;
    }
  
    for (let i = 0; i < wiresCopy.length; i++) {
      if (usedIndices.has(i)) continue;
      const wireA = wiresCopy[i];
      const alignA = getWireAlignment(wireA);
  
      let merged = false;
  
      for (let j = i + 1; j < wiresCopy.length; j++) {
        if (usedIndices.has(j)) continue;
        const wireB = wiresCopy[j];
        const alignB = getWireAlignment(wireB);
  
        if (alignA === alignB && alignA !== "d") continue; // skip if ||
  
        const endpointsA = [
          { x: wireA.x1, y: wireA.y1 },
          { x: wireA.x2, y: wireA.y2 },
        ];
        const endpointsB = [
          { x: wireB.x1, y: wireB.y1 },
          { x: wireB.x2, y: wireB.y2 },
        ];
  
        let sharedPoint = null;
        let otherA = null;
        let otherB = null;
  
        outer: for (const pA of endpointsA) {
          for (const pB of endpointsB) {
            if (isSamePoint(pA.x, pA.y, pB.x, pB.y)) {
              sharedPoint = pA;
              otherA = endpointsA.find(p => !isSamePoint(p.x, p.y, sharedPoint.x, sharedPoint.y));
              otherB = endpointsB.find(p => !isSamePoint(p.x, p.y, sharedPoint.x, sharedPoint.y));
              break outer;
            }
          }
        }
  
        if (!sharedPoint) continue; // No shared endpoint, no corner
  
        // **Check if exactly two wires share the sharedPoint endpoint**
        const wiresSharingPointCount = countWiresAtPoint(sharedPoint.x, sharedPoint.y);
        if (wiresSharingPointCount !== 2) continue;
  
        if (alignA === "x") {
          if (wireA.y1 !== sharedPoint.y || wireB.x1 !== sharedPoint.x) continue;
        } else if (alignA === "y") {
          if (wireA.x1 !== sharedPoint.x || wireB.y1 !== sharedPoint.y) continue;
        } else if (hasComponentConnected(sharedPoint, componentIds)) continue;

        const newWire = {
          ...wireA, // preserve extras from wireA if any
          x1: otherA.x,
          y1: otherA.y,
          x2: otherB.x,
          y2: otherB.y,
        };
  
        mergedWires.push(newWire);
        usedIndices.add(i);
        usedIndices.add(j);
        merged = true;
        break;
      }
  
      if (!merged && !usedIndices.has(i)) {
        mergedWires.push(wireA);
      }
    }
  
    return mergedWires;
  }
  
  function mergeCornerWiresFully(wires, componentIds, maxIterations = 10) {
    let prevLength = 0;
    let currentWires = wires;
    let iteration = 0;
  
    do {
      prevLength = currentWires.length;
      currentWires = mergeCornerWires(currentWires, componentIds);
      iteration++;
    } while (currentWires.length < prevLength && iteration < maxIterations);
  
    return currentWires;
  }
  
  

  function getNodes(wires, componentIds) {

    const endpointMap = new Map();
  
    function key(x, y) {
      return `${x},${y}`;
    }
  
    // Add wire endpoints
    wires.forEach((wire, index) => {
      const startKey = key(wire.x1, wire.y1);
      if (!endpointMap.has(startKey)) endpointMap.set(startKey, { wires: new Set(), components: new Set(), x: wire.x1, y: wire.y1 });
      endpointMap.get(startKey).wires.add(index);
  
      const endKey = key(wire.x2, wire.y2);
      if (!endpointMap.has(endKey)) endpointMap.set(endKey, { wires: new Set(), components: new Set(), x: wire.x2, y: wire.y2 });
      endpointMap.get(endKey).wires.add(index);
    });
  
    // Add component snap points
    for (const compId in componentIds) {
      const comp = componentIds[compId];
      if (!comp.snapPoints) continue;
      for (const sp of comp.snapPoints) {
        const spKey = key(sp.x, sp.y);
        if (!endpointMap.has(spKey)) {
          endpointMap.set(spKey, { wires: new Set(), components: new Set(), x: sp.x, y: sp.y });
        }
        endpointMap.get(spKey).components.add(compId);
      }
    }

    const nodesMap = new Map();
    let nodeCount = 0;
  
    for (const [point, data] of endpointMap.entries()) {
      const wireCount = data.wires.size;
      const compCount = data.components.size;
  
      if (wireCount + compCount >= 3) { // old wireCount >= 3 || compCount >= 3
        nodesMap.set(`node${nodeCount++}`, { x: data.x, y: data.y });
      }
    }
  
    // Convert to plain object
    const result = {};
    for (const [id, coord] of nodesMap.entries()) {
      result[id] = coord;
    }
  
    return result;
  }

  export function getConnectionsGraph(wires, componentIds) {
    const connectedWires = mergeCornerWiresFully(wires, componentIds);
    const nodes = getNodes(connectedWires, componentIds);
  
    const coordKey = (x, y) => `${x},${y}`;
  
    // Map node coordinate => nodeId
    const nodeCoordToId = new Map();
    for (const nodeId in nodes) {
      const n = nodes[nodeId];
      nodeCoordToId.set(coordKey(n.x, n.y), nodeId);
    }
  
    // Map snap point coord => list of component IDs sharing that snap point
    const snapPointToComponentIds = new Map();
    for (const compId in componentIds) {
      const comp = componentIds[compId];
      if (!comp.snapPoints) continue;
      for (const sp of comp.snapPoints) {
        const key = coordKey(sp.x, sp.y);
        if (!snapPointToComponentIds.has(key)) snapPointToComponentIds.set(key, []);
        snapPointToComponentIds.get(key).push(compId);
      }
    }
  
    // Include any new nodes formed by 3+ components sharing the same snap point
    // Add those as nodes to the nodes object & nodeCoordToId map
    for (const [key, compList] of snapPointToComponentIds.entries()) {
      if (compList.length >= 3 && !nodeCoordToId.has(key)) {
        // Add a new node ID, e.g. 'nodeX'
        const newNodeId = `node_${nodeCoordToId.size + Object.keys(nodes).length}`;
        const [x, y] = key.split(",").map(Number);
        nodes[newNodeId] = { x, y };
        nodeCoordToId.set(key, newNodeId);
      }
    }
  
    // Build graph: initialize entries for components and nodes
    const graph = {};
    for (const compId in componentIds) {
      graph[compId] = { name: componentIds[compId].name, connections: [] };
    }
    for (const nodeId in nodes) {
      graph[nodeId] = { name: nodeId, connections: [] };
    }
  
    function connect(a, b) {
      if (!graph[a] || !graph[b]) return;
      if (!graph[a].connections.includes(b)) graph[a].connections.push(b);
      if (!graph[b].connections.includes(a)) graph[b].connections.push(a);
    }
  
    // Connect wires to nodes/components
    connectedWires.forEach((wire) => {
      const endpoints = [
        { x: wire.x1, y: wire.y1 },
        { x: wire.x2, y: wire.y2 },
      ];
  
      const endpointEntities = endpoints.map(({ x, y }) => {
        const key = coordKey(x, y);
        if (nodeCoordToId.has(key)) return nodeCoordToId.get(key);
        // If node not found, check if exactly one component snap point matches
        if (snapPointToComponentIds.has(key)) {
          const comps = snapPointToComponentIds.get(key);
          if (comps.length === 1) return comps[0];
          // If multiple components share this snap point but no node - return null to avoid ambiguity
          return null;
        }
        return null;
      });
  
      if (
        endpointEntities[0] &&
        endpointEntities[1] &&
        endpointEntities[0] !== endpointEntities[1]
      ) {
        connect(endpointEntities[0], endpointEntities[1]);
      }
    });
  
    // Now handle direct component-to-component connections:
    // For every snap point shared by >= 2 components, connect those components together
    for (const [key, compList] of snapPointToComponentIds.entries()) {
      if (compList.length >= 2) {
        for (let i = 0; i < compList.length; i++) {
          for (let j = i + 1; j < compList.length; j++) {
            connect(compList[i], compList[j]);
          }
        }
      }
    }
    // handle direct component-node connections.
    for (const nodeId in nodes) {
        const node = nodes[nodeId];
        const nodeKey = coordKey(node.x, node.y);
        if (snapPointToComponentIds.has(nodeKey)) {
          const compsAtNode = snapPointToComponentIds.get(nodeKey);
          for (const compId of compsAtNode) {
            connect(nodeId, compId);
          }
        }
      }
  
    return graph;
  }
  
  export function simplifyConnectionsGraph(connectionsGraph) {
    const simplified = {};
  
    for (const id in connectionsGraph) {
      const entry = connectionsGraph[id];
      simplified[id] = {
        name: entry.name,
        connections: entry.connections.map(connId => connectionsGraph[connId]?.name || connId)
      };
    }
  
    return simplified;
  }
  
/* Utlities for merging parallel wires */

  function normalize(wire) {
    // Return new normalized wire with endpoints sorted from low to high on main axis
    if (wire.x1 === wire.x2) {
      // vertical wire, sort by y
      if (wire.y1 > wire.y2) {
        return { x1: wire.x1, y1: wire.y2, x2: wire.x2, y2: wire.y1 };
      }
    } else if (wire.y1 === wire.y2) {
      // horizontal wire, sort by x
      if (wire.x1 > wire.x2) {
        return { x1: wire.x2, y1: wire.y1, x2: wire.x1, y2: wire.y2 };
      }
    } else {
      // diagonal or invalid wire, return as-is
      return wire;
    }
    return wire;
  }

const GRID_SIZE = 10;

function snapToGrid(value, size = GRID_SIZE) {
  return Math.round(value / size) * size;
}
  
  
  function wireOnAnother(wire1, wire2) {
    wire1 = normalize(wire1);
    wire2 = normalize(wire2);
  
    const a1 = getWireAlignment(wire1);
    const a2 = getWireAlignment(wire2);
  
    if (!a1 || !a2) return false; // at least one wire is diagonal or invalid
    if (a1 !== a2) return false;  // not parallel
  
    if (a1 === "y") {
      // vertical wires must have same x
      if (wire1.x1 !== wire2.x1) return false;
  
      // check if y intervals overlap or touch at endpoints
      return !(wire1.y2 < wire2.y1 || wire1.y1 > wire2.y2);
    }
  
    if (a1 === "x") {
      // horizontal wires must have same y
      if (wire1.y1 !== wire2.y1) return false;
  
      // check if x intervals overlap or touch at endpoints
      return !(wire1.x2 < wire2.x1 || wire1.x1 > wire2.x2);
    }
  
    return false;
  }
  

function mergeParallelWires(wires) {
    // Normalize all wires first for easier merging
    wires.forEach(normalize);

    let merged = [...wires];
    let didMerge = true;

    while (didMerge) {
        didMerge = false;
        outer: for (let i = 0; i < merged.length; i++) {
            for (let j = i + 1; j < merged.length; j++) {

                if (wireOnAnother(merged[i], merged[j])) {
                    // Merge them into a new wire spanning the max range
                    const a = getWireAlignment(merged[i]);
                    const wireA = normalize(merged[i]);
                    const wireB = normalize(merged[j]);


                    let newWire;
                    if (a === "x") {
                    newWire = {
                        x1: Math.min(wireA.x1, wireB.x1),
                        y1: wireA.y1, // both horizontal, so y1 == y2
                        x2: Math.max(wireA.x2, wireB.x2),
                        y2: wireA.y2,
                    };
                    } else { // vertical
                    newWire = {
                        x1: wireA.x1, // both vertical, so x1 == x2
                        y1: Math.min(wireA.y1, wireB.y1),
                        x2: wireA.x2,
                        y2: Math.max(wireA.y2, wireB.y2),
                    };
                    }

                    newWire.x3 = snapToGrid((newWire.x1 + newWire.x2) / 2);
                    newWire.y3 = snapToGrid((newWire.y1 + newWire.y2) / 2);

                    // Replace both with merged, restart search
                    merged.splice(j, 1);
                    merged.splice(i, 1, newWire);
                    didMerge = true;
                    break outer;
                }
            }
        }
    }

    return merged;
}

function splitWiresAtComponents(wires, componentIds) {
    const result = [];
  
    // Helper: check if a point lies between endpoints of a straight wire
    function isPointOnWire(point, wire) {
      const snappedX = snapToGrid(point.x);
      const snappedY = snapToGrid(point.y);
      const w = normalize(wire);
  
      // Horizontal wire
      if (w.y1 === w.y2 && snappedY === w.y1) {
        return snappedX > Math.min(w.x1, w.x2) && snappedX < Math.max(w.x1, w.x2);
      }
      // Vertical wire
      if (w.x1 === w.x2 && snappedX === w.x1) {
        return snappedY > Math.min(w.y1, w.y2) && snappedY < Math.max(w.y1, w.y2);
      }
      return false;
    }
  
    // Build a unified list of all possible split points:
    // component snap points + wire endpoints (except the wire's own endpoints)
    const allSplitPoints = [];
  
    // Add all component snap points
    for (const comp of Object.values(componentIds)) {
      if (!comp.snapPoints) continue;
      for (const sp of comp.snapPoints) {
        allSplitPoints.push({ x: snapToGrid(sp.x), y: snapToGrid(sp.y) });
      }
    }
  
    // Add all wire endpoints
    for (const wire of wires) {
      allSplitPoints.push({ x: snapToGrid(wire.x1), y: snapToGrid(wire.y1) });
      allSplitPoints.push({ x: snapToGrid(wire.x2), y: snapToGrid(wire.y2) });
    }
  
    // Now split wires at any point on their length (excluding their own endpoints)
    for (const wire of wires) {
      const normWire = normalize(wire);
  
      // Filter points that lie strictly inside this wire (not endpoints)
      const splitPoints = allSplitPoints.filter((pt) => {
        // Skip if pt is exactly an endpoint of this wire
        if (
          (pt.x === normWire.x1 && pt.y === normWire.y1) ||
          (pt.x === normWire.x2 && pt.y === normWire.y2)
        ) {
          return false;
        }
        return isPointOnWire(pt, normWire);
      });
  
      if (splitPoints.length === 0) {
        // No splits → keep original wire
        result.push(wire);
        continue;
      }
  
      // Sort split points along wire axis
      if (normWire.y1 === normWire.y2) {
        // Horizontal wire - sort by x
        splitPoints.sort((a, b) => a.x - b.x);
      } else {
        // Vertical wire - sort by y
        splitPoints.sort((a, b) => a.y - b.y);
      }
  
      // Build new wire segments between endpoints and split points
      let lastPoint = { x: normWire.x1, y: normWire.y1 };
      for (const sp of splitPoints) {
        result.push({
          x1: lastPoint.x,
          y1: lastPoint.y,
          x2: sp.x,
          y2: sp.y,
          x3: snapToGrid((lastPoint.x + sp.x) / 2),
          y3: snapToGrid((lastPoint.y + sp.y) / 2),
          startSnappedTo: wire.startSnappedTo,
          endSnappedTo: null,
        });
        lastPoint = sp;
      }
      // Last segment from last split point to original end
      result.push({
        x1: lastPoint.x,
        y1: lastPoint.y,
        x2: normWire.x2,
        y2: normWire.y2,
        x3: snapToGrid((lastPoint.x + normWire.x2) / 2),
        y3: snapToGrid((lastPoint.y + normWire.y2) / 2),
        startSnappedTo: null,
        endSnappedTo: wire.endSnappedTo,
      });
    }
  
    return result;
  }
  

function splitWiresAtMidpoints(wires, componentIds) {
    const result = [];
  
    for (const wire of wires) {
      const midpoint = { x: wire.x3, y: wire.y3 };
      const hasMidpointConnection = wires.some(otherWire => {
        if (otherWire === wire) return false; // skip self
        const connectsAtMidpoint =
          (otherWire.x1 === midpoint.x && otherWire.y1 === midpoint.y) ||
          (otherWire.x2 === midpoint.x && otherWire.y2 === midpoint.y);
        return connectsAtMidpoint;
      });

      const hasComponentConnection = Object.values(componentIds).some(component => {
        return component.snapPoints.some(snapPoint => 
            snapToGrid(snapPoint.x) === snapToGrid(midpoint.x) && snapToGrid(snapPoint.y) === snapToGrid(midpoint.y)
        );
    });
  
      if (hasMidpointConnection || hasComponentConnection) {
        const wirePart1 = {
          x1: wire.x1,
          y1: wire.y1,
          x2: midpoint.x,
          y2: midpoint.y,
          x3: snapToGrid((wire.x1 + midpoint.x) / 2),
          y3: snapToGrid((wire.y1 + midpoint.y) / 2),
          startSnappedTo: wire.startSnappedTo,
          endSnappedTo: null,  
        };
  
        const wirePart2 = {
          x1: midpoint.x,
          y1: midpoint.y,
          x2: wire.x2,
          y2: wire.y2,
          x3: snapToGrid((midpoint.x + wire.x2) / 2),
          y3: snapToGrid((midpoint.y + wire.y2) / 2),
          startSnappedTo: null,
          endSnappedTo: wire.endSnappedTo,
        };
  
        result.push(wirePart1, wirePart2);
      } else {
        result.push(wire);
      }
    }
  
    return result;
  }


function wiresIntersect(wire1, wire2) {
    const align1 = getWireAlignment(wire1);
    const align2 = getWireAlignment(wire2);
    if (align1 === align2) return false;
    if (align1 === "x") {
        if (wire2.x1 > wire1.x1 && wire2.x2 < wire1.x2) return true;
    } else if (align2 === "x") {
        if (wire1.x1 > wire2.x1 && wire1.x2 < wire2.x2) return true;
    } else return false;
};

function getIntersectionPoint(wire1, wire2) {
    const align1 = getWireAlignment(wire1);
    const align2 = getWireAlignment(wire2);
    if (align1 === align2) return null;
    if (!wiresIntersect(wire1, wire2)) return null;
    if (align1 === "x") {
        return {x: wire2.x1, y: wire1.y1};
    } else if (align2 === "x") {
        return {x: wire1.x1, y: wire2.y1};
    }
};

function splitWireAtPoint(wire, intersection) {
    return [
      {
        x1: wire.x1,
        y1: wire.y1,
        x2: intersection.x,
        y2: intersection.y,
        x3: snapToGrid((wire.x1 + intersection.x) / 2),
        y3: snapToGrid((wire.y1 + intersection.y) / 2),
      },
      {
        x1: wire.x2,
        y1: wire.y2,
        x2: intersection.x,
        y2: intersection.y,
        x3: snapToGrid((wire.x2 + intersection.x) / 2),
        y3: snapToGrid((wire.y2 + intersection.y) / 2),
      },
    ];
  }

  function splitWiresAtIntersection(wires) {
    const result = [];
    const processed = new Set();
  
    for (let i = 0; i < wires.length; i++) {
      if (processed.has(i)) continue;
      const wire1 = normalize(wires[i]);
      let wasSplit = false;
  
      for (let j = i + 1; j < wires.length; j++) {
        if (processed.has(j)) continue;
        const wire2 = normalize(wires[j]);
  
        const intersection = getIntersectionPoint(wire1, wire2);
        if (intersection) {
          // only split if intersection is inside both wires, not just touching an endpoint
          const isInside = (pt, w) =>
            (pt.x > Math.min(w.x1, w.x2) && pt.x < Math.max(w.x1, w.x2)) ||
            (pt.y > Math.min(w.y1, w.y2) && pt.y < Math.max(w.y1, w.y2));
  
          if (isInside(intersection, wire1) && isInside(intersection, wire2)) {
            result.push(...splitWireAtPoint(wire1, intersection));
            result.push(...splitWireAtPoint(wire2, intersection));
            processed.add(i);
            processed.add(j);
            wasSplit = true;
          }
        }
      }
  
      if (!wasSplit) {
        result.push(wire1);
      }
    }
  
    return result;
  }

  export function processWires(wires, componentIds) {
    const merged = mergeParallelWires(wires);
    const compSplit = splitWiresAtComponents(merged, componentIds);
    const intersect = splitWiresAtIntersection(compSplit)
    const split = splitWiresAtMidpoints(intersect, componentIds);
    return split;
}
  