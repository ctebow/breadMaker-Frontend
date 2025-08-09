/* Use right now to test out a new app setup. */
import { useState, useEffect, useRef } from "react";
import "./App.css";
import { HelpPopup } from "./components/IconButton.jsx";
import { ToolBar } from "./components/Toolbar.jsx";
import { Sandbox3} from "./components/Sandbox.jsx";
import { FloatingIcon } from "./components/FloatingIcon.jsx";
import { PropertyEditor } from "./components/PropertyEditor.jsx";
import { getConnectionsGraph, simplifyConnectionsGraph } from "./utils/connectionUtils.js";
import resistorImg from "./assets/resistor.svg";
import capacitorImg from "./assets/capacitor.svg";
import inductorImg from "./assets/inductor2.svg";
import dcVoltageImg from "./assets/voltage-dc.svg";
import acVoltageImg from "./assets/voltage-ac.svg";
import diodeImg from "./assets/diode.svg";
import wireImg from "./assets/wire.png";
import switchImg from "./assets/switch.svg";

const BUTTONS = [
    {img: resistorImg, type: "resistor"},
    {img: capacitorImg, type: "capacitor"},
    {img: inductorImg, type: "inductor"},
    {img: dcVoltageImg, type: "voltage-dc"},
    {img: acVoltageImg, type: "voltage-ac"},
    {img: diodeImg, type: "diode"},
    {img: wireImg, type: "wire"},
    {img: switchImg, type: "switch"}
]

export default function App() {

    // state and refs
   // const [componentIds, dispatch] = useReducer(componentsReducer, {});
    const sandboxRef = useRef();
    const [componentIds, setComponentIds] = useState({});
    const [highlightedId, setHighlightedId] = useState(null);
    const [connections, setConnections] = useState({})
    const undoStack = useRef([]);
    const redoStack = useRef([])
    const [activeComponent, setActiveComponent] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [floatingIcon, setFloatingIcon] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [floatingRotation, setFloatingRotation] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });

    // global wires
    const [wires, setWires] = useState([]); // Store wires as {x1, y1, x2, y2}
    const [isDrawingWire, setIsDrawingWire] = useState(false);

    // state management helpers for undo/redo
    function throttle(fn, delay) {
        let lastCall = 0;
        return function(...args) {
          const now = Date.now();
          if (now - lastCall >= delay) {
            lastCall = now;
            fn(...args);
          }
        };
      }
    function deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    
    const cloned = {};
    for (const key in obj) {
        cloned[key] = deepClone(obj[key]);
    }
    return cloned;
    }
    // undo/redo handlers
    const pushUndoState = () => {
        undoStack.current.push({
          componentIds: deepClone(componentIds),
          wires: deepClone(wires),
        });
        redoStack.current = [];
      };
      
      const handleUndo = throttle(() => {
        if (undoStack.current.length === 0) return;
        redoStack.current.push({
          componentIds: deepClone(componentIds),
          wires: deepClone(wires),
        });
        const previousState = undoStack.current.pop();
        setComponentIds(previousState.componentIds);
        setWires(previousState.wires);
      }, 100);  // 1000ms throttle delay
      
      const handleRedo = throttle(() => {
        if (redoStack.current.length === 0) return;
        undoStack.current.push({
          componentIds: deepClone(componentIds),
          wires: deepClone(wires),
        });
        const nextState = redoStack.current.pop();
        setComponentIds(nextState.componentIds);
        setWires(nextState.wires);
      }, 100);
      
    
    // Track mouse position
    useEffect(() => {
    const handleMouseMove = (e) => {

        setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    //Handle updating component info
    const handleUpdate = (id, updatedProps) => {
        setComponentIds(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            ...updatedProps
          }
        }));
        console.log("Updaing Component Name and Value:", updatedProps.name, updatedProps.value)
      };
      
      const handleDelete = (id) => {
        setComponentIds(prev => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
        setSelectedId(null); // Close editor if deleted
      };
    
      

    return (
        <div className="flex flex-col h-screen">
          <ToolBar
            buttons={BUTTONS}
            setActiveComponent={setActiveComponent}
            setFloatingIcon={setFloatingIcon}
            setIsDrawingWire={setIsDrawingWire}
            mousePos={mousePosition}
            activeComponent={activeComponent}
            connections={connections}
            setConnections={setConnections}
            buildConnections={getConnectionsGraph}
            simplifyConnectionsGraph={simplifyConnectionsGraph}
            wires={wires}
            componentIds={componentIds}
            handleUndo={handleUndo}
            handleRedo={handleRedo}
          />
      
            <Sandbox3
            mousePos={mousePosition}
            activeComponent={activeComponent}
            setActiveComponent={setActiveComponent}
            buttons={BUTTONS}
            componentIds={componentIds}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            floatingRotation={floatingRotation}
            setFloatingRotation={setFloatingRotation}
            setComponentIds={setComponentIds}
            setZoom={setZoom}
            zoom={zoom}
            setPan={setPan}
            pan={pan}
            wires={wires}
            setWires={setWires}
            isDrawingWire={isDrawingWire}
            setIsDrawingWire={setIsDrawingWire}
            pushUndoState={pushUndoState}
            ref={sandboxRef}
            />
        
          {floatingIcon && activeComponent && (
            <FloatingIcon
            activeComponent={activeComponent}
            buttons={BUTTONS}                  
            mousePos={mousePosition}           
            showIcon={floatingIcon && !selectedId}            
            rotation={floatingRotation}  
            pan={pan}
            zoom={zoom}
            componentIds={componentIds}
            onSnapTargetChange={setHighlightedId}
            wires={wires} 
            sandboxRef={sandboxRef}                    
           />
          )} 
      
          {selectedId && (
              <PropertyEditor
                compInfo={componentIds[selectedId]}
                onClose={() => setSelectedId(null)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            )}
            <>
            {Object.keys(componentIds).length}
            </>
            <HelpPopup/>
        </div>
      );     
}