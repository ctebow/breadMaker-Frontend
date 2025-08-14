export const DIMENSIONS_MAP = {
    "resistor": {x: 100, y: 40, invert: false},
    "capacitor": {x: 40, y: 40, invert: true},
    "inductor": {x: 100, y: 40, invert: false},
    "voltage-dc": {x: 40, y: 40, invert: true},
    "voltage-ac": {x: 100, y: 40, invert: false},
    "diode": {x: 100, y: 40, invert: false},
    "switch": {x: 100, y: 40, invert: false},
    "wire": {x: 0, y: 0, invert: false},
    "varistor": {x: 100, y: 40, invert: false},
    "fuse": {x: 100, y: 40, invert: false},
    "motor": {x: 100, y: 40, invert: false},
    "diode-zenor": {x: 100, y: 40, invert: false},
    "capacitor-polarized": {x: 40, y: 40, invert: true},
    "current_source": {x: 100, y: 40, invert: false}
}

const SPECIAL_TYPES = { // dx/dy FROM CENTER
    "crossover": {x: 40, y: 40, snapPoints: [{dx: -20, dy: 0}, {dx: 0, dy: 20}, {dx: 0, dy: -20}, {dx: 20, dy: 0}]},
    "terminal-neg": {x: 40, y: 40, snapPoints: [{dx: 0, dy: -20}]},
    "terminal-pos": {x: 40, y: 40, snapPoints: [{dx: 0, dy: 20}]},
    "thyristor": {x: 100, y: 40, snapPoints: [{dx: -50, dy: 0}, {dx: 50, dy: 0}, {dx: 30, dy: 20}]},
    "not": {x: 80, y: 40, snapPoints: [{dx: -40, dy: 0}, {dx: 40, dy: 0}]},
    "or": {x: 80, y: 40, snapPoints: [{dx: -40, dy: -10}, {dx: -40, dy: 10}, {dx: 40, dy: 0}]},
    "nor": {x: 80, y: 40, snapPoints: [{dx: -40, dy: -10}, {dx: -40, dy: 10}, {dx: 40, dy: 0}]},
    "xor": {x: 80, y: 40, snapPoints: [{dx: -40, dy: -10}, {dx: -40, dy: 10}, {dx: 40, dy: 0}]},
    "nand": {x: 80, y: 40, snapPoints: [{dx: -40, dy: -10}, {dx: -40, dy: 10}, {dx: 40, dy: 0}]},
    "and": {x: 80, y: 40, snapPoints: [{dx: -40, dy: -10}, {dx: -40, dy: 10}, {dx: 40, dy: 0}]},
    "opAmp": {x: 100, y: 100, snapPoints: [{dx: -50, dy: -30}, {dx: -50, dy: 30}, {dx: 0, dy: -50}, {dx: 0, dy: 50}, {dx: 50, dy: 0}]},
    "resistor-photo": {x: 100, y: 100, snapPoints: [{dx: -50, dy: 0}, {dx: 50, dy: 0}]},
    "transistor": {x: 80, y: 100, snapPoints: [{dx: -40, dy: 0}, {dx: 20, dy: -50}, {dx: 20, dy: 50}]},
    "microphone": {x: 80, y: 100, snapPoints: [{dx: 0, dy: -50}, {dx: 0, dy: 50}]},
    "transistor-photo": {x: 80, y: 100, snapPoints: [{dx: 20, dy: -50}, {dx: 20, dy: 50}]},
    "transistor-PNP": {x: 80, y: 100, snapPoints: [{dx: -40, dy: 0}, {dx: 20, dy: -50}, {dx: 20, dy: 50}]},
    "speaker": {x: 80, y: 100, snapPoints: [{dx: -10, dy: -50}, {dx: -10, dy: 50}]},
    "diode-light_emitting": {x: 100, y: 80, snapPoints: [{dx: -50, dy: 0}, {dx: 50, dy: 0}]},
    "transformer": {x: 80, y: 100, snapPoints: [{dx: -40, dy: -40}, {dx: -40, dy: 40}, {dx: 40, dy: -40}, {dx: 40, dy: 40}]},
    "triac": {x: 100, y: 100, snapPoints: [{dx: 0, dy: -50}, {dx: 0, dy: 50}, {dx: 50, dy: 40}]},
    "diac": {x: 100, y: 100, snapPoints: [{dx: 0, dy: -50}, {dx: 0, dy: 50}]},
    "ground": {x: 40, y: 40, snapPoints: [{dx: 0, dy: -20}]},
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
    } else if (comp_type in SPECIAL_TYPES) {
        let result = [];
        SPECIAL_TYPES[comp_type].snapPoints.forEach((point) => {

            const angle = comp_rotation * Math.PI / 180;
            // rotated around center of object. 
            const rotatedX = point.dx * Math.cos(angle) - point.dy * Math.sin(angle);
            const rotatedY = point.dx * Math.sin(angle) + point.dy * Math.cos(angle);


            result.push({x: posX + rotatedX, y: posY + rotatedY});
        });

        return result;
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
