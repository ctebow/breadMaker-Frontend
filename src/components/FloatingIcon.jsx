import { useState, useEffect } from "react";
import { getSnappedPosition } from "../utils/snapUtils"

const GRID_SIZE = 10; 

function snapToGrid(value) {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

function imgFor(component, buttons) {
    const found = buttons.find(btn => btn.type === component);
    return found?.img; // returns null if not found
}

export function FloatingIcon({ activeComponent, buttons, mousePos, showIcon, rotation, pan, zoom, componentIds, onSnapTargetChange, wires, sandboxRef }) {

    const [snapInfo, setSnapInfo] = useState({
        snapped: false,
        snappedToId: null,
        snappedOffset: {x: 0, y: 0},
    });

    useEffect(() => {
        if (!activeComponent || !showIcon || activeComponent === "wire") return;
        if (!sandboxRef) {
            console.log("sandboxRef does not exist")
            return;
        }

        const worldX = (mousePos.x - pan.x) / zoom;
        const worldY = (mousePos.y - sandboxRef.current?.getBoundingClientRect().top - pan.y) / zoom ; // istg if this actually works

        const newSnap = getSnappedPosition(
            worldX,
            worldY,
            rotation,
            activeComponent,
            componentIds,
            null,
            wires,
        )

        setSnapInfo(newSnap)
        if (newSnap.snapped) {
            console.log("Floating icon snapped to: ", newSnap.snappedToId)
        }
        if (onSnapTargetChange) {
            onSnapTargetChange(newSnap.snappedToId)
        }
    }, [mousePos, activeComponent, rotation, componentIds, showIcon]);


    if (!activeComponent || !showIcon) return null;

    const src = imgFor(activeComponent, buttons);
    if (!src) return null;


    const adjustedX = mousePos.x + snapInfo.snappedOffset.x * zoom;
    const adjustedY = mousePos.y + snapInfo.snappedOffset.y * zoom;

    const gridX = snapToGrid(adjustedX);
    const gridY = snapToGrid(adjustedY);

    

    const transformStyle = {
        position: "absolute",
        left: (gridX),
        top: (gridY),
        transform: `translate(-50%, -50%) scale(${zoom}) rotate(${rotation}deg)`,
        transformOrigin: "center",
        pointerEvents: "none",
      };
    if (!showIcon) {
        return null;
    } else if (activeComponent === "wire" ){
        return (
            <div>
                <svg
      className="pointer-events-none fixed top-0 left-0 w-full h-full z-50"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1={gridX}
        y1={0}
        x2={gridX}
        y2="100%"
        stroke="gray"
        strokeWidth="1"
      />
      <line
        x1={0}
        y1={gridY}
        x2="100%"
        y2={gridY}
        stroke="gray"
        strokeWidth="1"
      />
    </svg>
            </div>
        )
    } else {
    return (
        <div>
            <img src={src}
                alt={activeComponent}
                className="absolute pointer-events-none select-none z-50"
                style={transformStyle}>
            </img>
        </div>
    );}
}

  