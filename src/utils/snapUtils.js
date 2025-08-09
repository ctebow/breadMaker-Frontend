export const DIMENSIONS_MAP = {
    "resistor": {x: 100, y: 40, invert: false},
    "capacitor": {x: 40, y: 40, invert: true},
    "inductor": {x: 100, y: 40, invert: false},
    "voltage-dc": {x: 40, y: 40, invert: true},
    "voltage-ac": {x: 100, y: 40, invert: false},
    "diode": {x: 100, y: 40, invert: false},
    "switch": {x: 100, y: 40, invert: false},
    "wire": {x: 0, y: 0, invert: false},
}

const GRID_SIZE = 10;  // make sure it aligns with component dimensions

function snapToGrid(value, size = GRID_SIZE) {
  return Math.round(value / size) * size;
}

export function getSnapPoints(posX, posY, comp_type, comp_rotation, wire_coords = null) {
    
    
    if (!comp_type) return null; //case where no component is selected.
    if (comp_type === "wire" && !wire_coords) return null;
    
    if (comp_type === "wire") {
        const points = [];


        // Always add the start point
        if (wire_coords?.x1 != null && wire_coords?.y1 != null)
            points.push({ x: wire_coords.x1, y: wire_coords.y1 });
        if (wire_coords?.x2 != null && wire_coords?.y2 != null)
            points.push({ x: wire_coords.x2, y: wire_coords.y2 });

        const dx = posX - wire_coords.x1;
        const dy = posY - wire_coords.y1;

        // Check if wire is axis-aligned and long enough
        if (dx === 0 && Math.abs(dy) >= 40) {
            const midY = snapToGrid(wire_coords.y1 + dy / 2);
            points.push({ x: wire_coords.x1, y: midY });
        } else if (dy === 0 && Math.abs(dx) >= 40) {
            const midX = snapToGrid(wire_coords.x1 + dx / 2);
            points.push({ x: midX, y: wire_coords.y1 });
        }


        return points.length > 0 ? points : null;
    }
    

    const { x: width, y: height, invert} = DIMENSIONS_MAP[comp_type];
    const angle = (comp_rotation + (invert ? 90 : 0)) * Math.PI / 180;

    const dx = ((width * Math.cos(angle) + height * Math.sin(angle)) / 2) * Math.cos(angle);
    const dy = ((height * Math.cos(angle) + width * Math.sin(angle)) / 2) * Math.sin(angle);

    return [
        {x: posX + dx, y: posY + dy},
        {x: posX - dx, y: posY - dy}
    ]
}



export function getSnappedPosition(x, y, rotation, type, componentIds, wire_coords = null, wires = null) {
    const floatingSnapPoints = getSnapPoints(x, y, type, rotation, wire_coords);

    if (!floatingSnapPoints || floatingSnapPoints.length === 0) return null;
    const SNAP_THRESHOLD = 25;

    let closestDist = Infinity;
    let bestOffset = null;
    let targetId = null;

    // check components
    for (const [id, comp] of Object.entries(componentIds)) {
        if (!comp.snapPoints) continue;


        for (const staticPoint of comp.snapPoints) {
            for (const floatingPoint of floatingSnapPoints) {

                const dx = staticPoint.x - floatingPoint.x;
                const dy = staticPoint.y - floatingPoint.y;
                const dist = Math.hypot(dx, dy);

                if(dist < closestDist && dist < SNAP_THRESHOLD) {
                    closestDist = dist;
                    bestOffset = {x: dx, y: dy}
                    targetId = id
                }
            }
        }
    }

    if (wires) {
        wires.forEach((wire, index) => {

            for (const floatingPoint of floatingSnapPoints) {

                const dx1 = wire.x1 - floatingPoint.x;
                const dy1 = wire.y1 - floatingPoint.y;
                const dx2 = wire.x2 - floatingPoint.x;
                const dy2 = wire.y2 - floatingPoint.y;
                const dx3 = wire.x3 - floatingPoint.x;
                const dy3 = wire.y3 - floatingPoint.y;
                const dist1 = Math.hypot(dx1, dy1);
                const dist2 = Math.hypot(dx2, dy2);
                const dist3 = Math.hypot(dx3, dy3);
                const shortest = Math.min(dist1, dist2, dist3);

                if (shortest < closestDist && shortest < SNAP_THRESHOLD) {
                    closestDist = shortest;
                    bestOffset = shortest === dist1 ? {x: dx1, y: dy1} : (dist2 < dist3 ? {x: dx2, y: dy2} : {x: dx3, y: dy3});
                    targetId = null

                    // let's think about this logic:
                    

                }
            }

        })
    }


    if (bestOffset) {
        return {
            snapped: true,
            snappedOffset: bestOffset,
            snappedToId: targetId
        }
    } else {
        return {
            snapped: false,
            snappedOffset: {x: 0, y: 0},
            snappedToId: "wire"
        }
    }
}
