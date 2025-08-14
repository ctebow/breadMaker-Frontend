import { PlacedComponent } from "./PlacedComponent";
import { getSnapPoints, getSnappedPosition } from "../utils/snapUtils";
import { processWires } from "../utils/connectionUtils";
import React, { useState, useEffect, useRef, forwardRef } from "react";


const TYPES_MAP = {
        "resistor": "R",
        "capacitor": "C",
        "inductor": "L",
        "voltage-dc": "V",
        "voltage-ac": "AC",
        "wire": "W",
        "diode": "D",
        "switch": "S",
        "varistor": "varistor",
        "fuse": "fuse",
        "capacitor-polarized": "CP",
        "motor": "motor",
        "current_source": "I",
        "diode-zenor": "ZD",
        "crossover": "X",
        "terminal-pos": "VIN",
        "terminal-neg": "VOUT",
        "thyristor": "THYR",
        "not": "NOT",
        "or": "OR",
        "and": "AND",
        "nor": "NOR",
        "nand": "NAND",
        "xor": "XOR",
        "opAmp": "opAmp",
        "resistor-photo": "RP",         
        "transistor": "Q",           
        "microphone": "MIC",             
        "transistor-photo": "QP",        
        "transistor-PNP": "Qp",          
        "speaker": "SPK",                
        "transformer": "T",              
        "diode-light_emitting": "LED",   
        "triac": "TRIAC",                
        "diac": "DIAC",  
        "ground": "gnd"
};

const GRID_SIZE = 10;  // make sure it aligns with component dimensions

function snapToGrid(value, size = GRID_SIZE) {
  return Math.round(value / size) * size;
}


export const Sandbox3 = forwardRef(({
    mousePos,
    activeComponent,
    setActiveComponent,
    selectedId,
    setSelectedId,
    buttons,
    componentIds,
    setComponentIds,
    floatingRotation,
    setFloatingRotation,
    pan,
    zoom,
    setZoom,
    setPan,
    wires,
    setWires,
    isDrawingWire,
    setIsDrawingWire,
    pushUndoState,
    },
    ref
    ) => {
    // labeling
    const [typeCounter, setTypeCounter] = useState({});

    // wire drawing (had to pass a few up to App)
    const [startPoint, setStartPoint] = useState(null);
    const [worldMousePos, setWorldMousePos] = useState({x: 0, y: 0})
    const [selectedWireIndex, setSelectedWireIndex] = useState(null);


    // panning state
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
  
    // dragging placed components
    const [draggingId, setDraggingId] = useState(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const dragStartPos = useRef({ x: 0, y: 0 });
    const [isComponentDragging, setIsComponentDragging] = useState(false);
    const DRAG_THRESHOLD = 5;

    // help performance
    const draggingPos = useRef(null);
    const animationFrameId = useRef(null);

    // world mouse tracking for wire
    useEffect(() => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        
        const worldX = (mousePos.x - rect.left - pan.x) / zoom;
        const worldY = (mousePos.y - rect.top - pan.y) / zoom;
        
        setWorldMousePos({ x: worldX, y: worldY });
        }, [mousePos, pan, zoom, ref]);
  
    // Rotation keybind (shift + R)
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "R") {
          setFloatingRotation((prev) => (prev + 90) % 360);
        } else if (
            (e.key === "Backspace" || e.key === "Delete") &&
            selectedWireIndex !== null
          ) {
            setWires((prev) =>
              prev.filter((_, i) => i !== selectedWireIndex)
            );
            setSelectedWireIndex(null);
          }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [setFloatingRotation, selectedWireIndex]);


    // Placing new components
    function handleClick(e) {
              
        const rect = e.currentTarget.getBoundingClientRect();


      const rawX = e.clientX - rect.left;
      const rawY = e.clientY - rect.top;

  
      const mouseWorldX = (rawX - pan.x) / zoom;
      const mouseWorldY = (rawY - pan.y) / zoom;
      
        const wireCoords = activeComponent === "wire" 
        ? { x1: mouseWorldX, y1: mouseWorldY }
        : null;
      
      const snapResult = getSnappedPosition(
        mouseWorldX,
        mouseWorldY,
        floatingRotation,
        activeComponent,
        componentIds,
        wireCoords,
        wires
      );
      
        
      const placeX = snapResult?.snapped ? mouseWorldX + snapResult?.snappedOffset.x : mouseWorldX;
      const placeY = snapResult?.snapped ? mouseWorldY + snapResult?.snappedOffset.y : mouseWorldY;

      const gridX = snapToGrid(placeX);
      const gridY = snapToGrid(placeY);

      const calcSnapPoints = getSnapPoints(gridX, gridY, activeComponent, floatingRotation);
  
      if (activeComponent && activeComponent !== "wire") {
        const newId = crypto.randomUUID();
  
        const typeAbbrev = TYPES_MAP[activeComponent];
        const nextNum = typeCounter[typeAbbrev] || 1;
        const newName = `${typeAbbrev}${nextNum}`;
  
        setTypeCounter((prev) => ({
          ...prev,
          [typeAbbrev]: nextNum + 1,
        }));

        pushUndoState();
        
        setComponentIds((prev) => ({
          ...prev,
          [newId]: {
            id: newId,
            name: newName,
            value: 0,
            rotation: floatingRotation,
            type: activeComponent,
            xPos: gridX,
            yPos: gridY,
            snapPoints: calcSnapPoints
          },
        }));
      } else {
        setSelectedId(null);
      }
    }
  
    // Zooming with mouse wheel
    const handleWheelZoom = (e) => {
      e.preventDefault();
  
      const zoomSpeed = 0.001;
      const newZoom = Math.min(3, Math.max(0.1, zoom - e.deltaY * zoomSpeed));
  
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - pan.x;
      const offsetY = e.clientY - rect.top - pan.y;
  
      const zoomFactor = newZoom / zoom;
  
      setPan({
        x: pan.x - offsetX * (zoomFactor - 1),
        y: pan.y - offsetY * (zoomFactor - 1),
      });
  
      setZoom(newZoom);
    };
  
    // Mouse down handler - starts either panning or component dragging or wire
    const handleMouseDown = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - pan.x) / zoom;
        const mouseY = (e.clientY - rect.top - pan.y) / zoom;
      
        if (activeComponent === "wire" && e.button === 0 && !e.shiftKey) {
            e.preventDefault();
      
            const wireCoords = isDrawingWire
            ? startPoint // {x, y} - fixed endpoint
            : { x1: mouseX, y1: mouseY }; // new starting point



            const { snapped, snappedOffset, snappedToId } = getSnappedPosition(
            mouseX,
            mouseY,
            floatingRotation,
            activeComponent,
            componentIds,
            wireCoords,
            wires
            );


      
          const snapX = snapped ? mouseX + snappedOffset.x : mouseX;
          const snapY = snapped ? mouseY + snappedOffset.y : mouseY;

          const gridX = snapToGrid(snapX);
          const gridY = snapToGrid(snapY);
      
          if (!isDrawingWire) {
            setStartPoint({ x1: gridX, y1: gridY, startSnappedTo: snappedToId});
            setIsDrawingWire(true);
          } else {

            // ok new snap logic
            const snappedCoords = getPreviewSnapCoords(
                startPoint.x1,
                startPoint.y1,
                worldMousePos.x,
                worldMousePos.y,
                wires,
                componentIds)
            pushUndoState();
            setWires(prev => processWires([
                ...prev,
                {
                    x1: startPoint.x1,
                    y1: startPoint.y1,
                    x2: snappedCoords.x,
                    y2: snappedCoords.y,
                    x3: snapToGrid((startPoint.x1 + snappedCoords.x) / 2),
                    y3: snapToGrid((startPoint.y1 + snappedCoords.y) / 2),
                    startSnappedTo: startPoint.startSnappedTo,
                    endSnappedTo: snappedCoords.snappedToComponent,
                }
                ], componentIds));


            setIsDrawingWire(false);
            setStartPoint(null);
          }
      
          return;
        }
      
        // Middle-click or Shift + left-click for panning
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
          setIsDragging(true);
          dragStart.current = { x: e.clientX, y: e.clientY };
        }
      };

    // Manual Wheel Zoom --> fixes default error
    useEffect(() => {
        const elem = ref.current;
        if (!elem) return;
    
        elem.addEventListener("wheel", handleWheelZoom, { passive: false });
    
        return () => {
            elem.removeEventListener("wheel", handleWheelZoom);
        };
        }, [handleWheelZoom, pan, zoom]);
  
    // Component drag start
    const handleComponentMouseDown = (e, comp) => {
        e.stopPropagation();
        setDraggingId(comp.id);
      
        const sandboxRect = e.currentTarget.closest(".sandbox-container").getBoundingClientRect();
        const rawX = e.clientX - sandboxRect.left;
        const rawY = e.clientY - sandboxRect.top;

        const sandboxX = (rawX - pan.x) / zoom;
        const sandboxY = (rawY - pan.y) / zoom;

      
        dragOffset.current = {
          x: sandboxX - comp.xPos,
          y: sandboxY - comp.yPos,
        };
      
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        setIsComponentDragging(false);
      };
  
    // Single unified mouse move handler for dragging components or panning
    
    const handleMouseMove = (e) => {
        // Pan the canvas if dragging background
        if (isDragging) {
          const dx = e.clientX - dragStart.current.x;
          const dy = e.clientY - dragStart.current.y;
      
          setPan((prev) => ({
            x: prev.x + dx,
            y: prev.y + dy,
          }));
      
          dragStart.current = { x: e.clientX, y: e.clientY };
          return; // Don't continue with component dragging
        }
      
        // Component dragging
        if (draggingId) {
          e.preventDefault();
          const dx = e.clientX - dragStartPos.current.x;
          const dy = e.clientY - dragStartPos.current.y;
      
          if (!isComponentDragging) {
            if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return;
            setIsComponentDragging(true);
          }
      
          const sandboxRect = e.currentTarget.getBoundingClientRect();
          const mouseX = e.clientX - sandboxRect.left;
          const mouseY = e.clientY - sandboxRect.top;
          const sandboxX = (mouseX - pan.x) / zoom;
          const sandboxY = (mouseY - pan.y) / zoom;
      
          draggingPos.current = {
            x: sandboxX - dragOffset.current.x,
            y: sandboxY - dragOffset.current.y,
          };
      
          if (!animationFrameId.current) {
            animationFrameId.current = requestAnimationFrame(() => {
              setComponentIds((prev) => {
                const updated = { ...prev };
                const newX = draggingPos.current.x;
                const newY = draggingPos.current.y;
                const comp = updated[draggingId];

                const snapResult = getSnappedPosition(
                    draggingPos.current.x,
                    draggingPos.current.y,
                    comp.rotation,
                    comp.type,
                    componentIds,
                    null,
                    wires,
                  );
                  
                const snappedX = snapResult.snapped ? draggingPos.current.x + snapResult.snappedOffset.x : draggingPos.current.x;
                const snappedY = snapResult.snapped ? draggingPos.current.y + snapResult.snappedOffset.y : draggingPos.current.y;
                  
                const gridX = snapToGrid(snappedX);
                const gridY = snapToGrid(snappedY);

                updated[draggingId] = {
                  ...prev[draggingId],
                  xPos: gridX,
                  yPos: gridY,
                  snapPoints: getSnapPoints(gridX, gridY, comp.type, comp.rotation)
                };
                return updated;
              });
              animationFrameId.current = null;
            });
          }
        }
      };
      
  
    const handleMouseUp = () => {
        if (draggingId) {
          setDraggingId(null);
          setIsComponentDragging(false);
        }
        setIsDragging(false);
      
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
          animationFrameId.current = null;
        }
      };
    
    // Snap to components on preview
    function getPreviewSnapCoords(startX, startY, currX, currY, wires, componentIds) {

        const gridX = Math.abs(currX - startX) > Math.abs(currY - startY)
        ? snapToGrid(currX)
        : startX;
        const gridY = Math.abs(currX - startX) > Math.abs(currY - startY)
        ? startY
        : snapToGrid(currY);

        const { snapped, snappedOffset, snappedToId } = getSnappedPosition(
            startX,
            startY,
            0,
            "wire",
            componentIds,
            {x1: gridX, y1: gridY},
            wires
            );
        
        if (!snapped) return {x: gridX, y: gridY, snappedToComponent: null};

        if (snappedOffset.x === 0 && snappedOffset.y !== 0 && gridX === startX) {
            return {x: gridX, y: gridY + snappedOffset.y, snappedToComponent: snappedToId};
        } else if (snappedOffset.x !== 0 && snappedOffset.y === 0 && gridY === startY) {
            return {x: gridX + snappedOffset.x, y: gridY, snappedToComponent: snappedToId};
            
        } else {
            return {x: gridX, y: gridY};
        }
    };

    const checkIsWireConnected = (compInfo) => {
        if (!isDrawingWire) return false;
        
        let connected = false;
        for (const snapPoint of compInfo.snapPoints) {
            if (snapPoint.x === startPoint.x1 && snapPoint.y === startPoint.y1) {
                connected = true;
            }
        }
        return connected;
    }


    return (
      <div
        className={`relative bg-white border border-gray-300 rounded shadow mt-4 overflow-auto flex-1 sandbox-container ${
          activeComponent ? "cursor-none" : "cursor-default"
        }`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={ref}
        style={{
            cursor: activeComponent === "wire" ? "none" : "default",
          }}
      >
{/* Grid svg */}
<svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
  <defs>
    <pattern
      id="grid"
      width={20}
      height={20}
      patternUnits="userSpaceOnUse"
    >
      <path
        d="M 20 0 L 0 0 0 20"
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="1"
      />
    </pattern>
  </defs>
  <g transform={`scale(${zoom})`}>
    <rect
      width="100%"
      height="100%"
      fill="url(#grid)"
    />
  </g>
</svg>



{/* Wire preview component */}
{isDrawingWire && startPoint && (
  <svg
    className="absolute top-0 left-0 pointer-events-none"
    style={{
      width: "100%",
      height: "100%",
      zIndex: 40,
    }}
  >
    <line
      x1={startPoint.x1 * zoom + pan.x}
      y1={startPoint.y1 * zoom + pan.y}
      x2={getPreviewSnapCoords(startPoint.x1, startPoint.y1, worldMousePos.x, worldMousePos.y, wires, componentIds).x * zoom + pan.x}
      y2={getPreviewSnapCoords(startPoint.x1, startPoint.y1, worldMousePos.x, worldMousePos.y, wires, componentIds).y * zoom + pan.y}
      stroke="black"
      strokeWidth={4 * zoom}
    />
  </svg>
)}

{/* Wire actual component */}
<svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
    {wires.map((wire, index) => {
      const isSelected = index === selectedWireIndex;

      return (
        <g key={index}>
          {/* Invisible wider hitbox line */}
          <line
            x1={wire.x1}
            y1={wire.y1}
            x2={wire.x2}
            y2={wire.y2}
            stroke="transparent"
            strokeWidth={12 / zoom}
            pointerEvents="stroke"
            onClick={(e) => {
              e.stopPropagation();
              if (isSelected) {
                setSelectedWireIndex(null);
              } else {
              setSelectedWireIndex(index);
            }}}
          />
          {/* Actual visible line */}
          <line
            x1={wire.x1}
            y1={wire.y1}
            x2={wire.x2}
            y2={wire.y2}
            stroke={isSelected ? "red" : "black"}
            strokeWidth={isSelected ? 8 / zoom : 4 / zoom}
            strokeDasharray={isSelected ? "4 2" : "0"}
            pointerEvents="none"
          />
        </g>
      );
    })}
  </g>
</svg>
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
{Object.entries(componentIds).map(([id, comp]) => {
  const snapPoints = comp.snapPoints || [];
  const button = buttons.find((b) => b.type === comp.type);
  if (!button) return null;

  const compInfo = {
    id,
    type: comp.type,
    image: button.img,
    name: comp.name,
    xPos: comp.xPos,
    yPos: comp.yPos,
    rotation: comp.rotation,
    value: comp.value,
    snapPoints: snapPoints
  };

  return (
    <React.Fragment key={id}>
      <PlacedComponent
        compInfo={compInfo}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        onMouseDown={(e) => handleComponentMouseDown(e, compInfo)}
        isDraggingComponent={draggingId === id && isComponentDragging}
        isSnappedToWire={checkIsWireConnected(compInfo)}
      />

    </React.Fragment>
  );
})}
        </div>
      </div>
    );
  })