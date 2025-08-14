/* Use right now to test out a new app setup. */
import { useState, useEffect, useRef } from "react";
import "./App.css";
import { HelpPopup } from "./components/IconButton.jsx";
import { ToolBar } from "./components/Toolbar.jsx";
import { Sandbox3 } from "./components/Sandbox.jsx";
import { FloatingIcon } from "./components/FloatingIcon.jsx";
import { PropertyEditor } from "./components/PropertyEditor.jsx";
import { getConnectionsGraph, simplifyConnectionsGraph } from "./utils/connectionUtils.js";
import { sendImageAndData } from "./api.js"
import resistorImg from "./assets/resistor.svg";
import capacitorImg from "./assets/capacitor.svg";
import inductorImg from "./assets/inductor2.svg";
import dcVoltageImg from "./assets/voltage-dc.svg";
import acVoltageImg from "./assets/voltage-ac.svg";
import diodeImg from "./assets/diode.svg";
import wireImg from "./assets/wire.png";
import switchImg from "./assets/switch.svg";
import varistorImg from "./assets/varistor.svg";
import capacitorPolarizedImg from "./assets/capacitor-polarized.svg";
import fuseImg from "./assets/fuse.svg";
import currentSourceImg from "./assets/current-source.svg";
import motorImg from "./assets/motor.svg";
import diodeZenorImg from "./assets/diode-zenor.svg";
import crossoverImg from "./assets/crossover.svg";
import terminalPosImg from "./assets/terminal-pos.svg";
import terminalNegImg from "./assets/terminal-neg.svg";
import thyristorImg from "./assets/thyristor.svg";
import NOTImg from "./assets/NOT.svg";
import ORImg from "./assets/OR.svg";
import ANDImg from "./assets/AND.svg";
import NORImg from "./assets/NOR.svg";
import NANDImg from "./assets/NAND.svg";
import XORImg from "./assets/XOR.svg";
import opAmpImg from "./assets/op_amp.svg";
import resistorPhotoImg from "./assets/resistor-photo.svg";
import transistorNPNImg from "./assets/transistor-NPN.svg";
import microphoneImg from "./assets/microphone.svg";
import transistorPhotoImg from "./assets/transistor-photo.svg";
import transistorPNPImg from "./assets/transistor-PNP.svg";
import speakerImg from "./assets/speaker.svg";
import triacImg from "./assets/triac.svg";
import diacImg from "./assets/diac.svg";
import transformerImg from "./assets/transformer.svg";
import diodeLightEmittingImg from "./assets/diode-light_emitting.svg";
import groundImg from "./assets/ground.svg";

const BUTTONS = [
    {img: resistorImg, type: "resistor", main: true},
    {img: capacitorImg, type: "capacitor", main: true},
    {img: inductorImg, type: "inductor", main: true},
    {img: dcVoltageImg, type: "voltage-dc", main: true},
    {img: acVoltageImg, type: "voltage-ac", main: true},
    {img: diodeImg, type: "diode", main: true},
    {img: wireImg, type: "wire", main: true},
    {img: switchImg, type: "switch", main: true},
    {img: varistorImg, type: "varistor", main: false},
    {img: capacitorPolarizedImg, type: "capacitor-polarized", main: false},
    {img: fuseImg, type: "fuse", main: false},
    {img: currentSourceImg, type: "current_source", main: false},
    {img: motorImg, type: "motor", main: false},
    {img: diodeZenorImg, type: "diode-zenor", main: false},
    {img: crossoverImg, type: "crossover", main: false},
    {img: terminalNegImg, type: "terminal-neg", main: false},
    {img: terminalPosImg, type: "terminal-pos", main: false},
    {img: thyristorImg, type: "thyristor", main: false},
    {img: opAmpImg, type: "opAmp", main: false},
    {img: resistorPhotoImg, type: "resistor-photo", main: false},
    {img: transistorNPNImg, type: "transistor", main: false},
    {img: microphoneImg, type: "microphone", main: false},
    {img: transistorPhotoImg, type: "transistor-photo", main: false},
    {img: transistorPNPImg, type: "transistor-PNP", main: false},
    {img: speakerImg, type: "speaker", main: false},
    {img: transformerImg, type: "transformer", main: false},
    {img: diodeLightEmittingImg, type: "diode-light_emitting", main: false},
    {img: triacImg, type: "triac", main: false},
    {img: diacImg, type: "diac", main: false},
    {img: NOTImg, type: "not", main: "logic"},
    {img: ANDImg, type: "and", main: "logic"},
    {img: NORImg, type: "nor", main: "logic"},
    {img: NANDImg, type: "nand", main: "logic"},
    {img: ORImg, type: "or", main: "logic"},
    {img: XORImg, type: "xor", main: "logic"},
    {img: groundImg, type: "ground", main: true}
];

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
    const [selectedFile, setSelectedFile] = useState(null);
    const [mlComponents, setMlComponents] = useState({});

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

    const handleUploadClick = async () => {
        const detectionResult = await sendImageAndData(selectedFile, componentIds);
        console.log("API Gave me: ", detectionResult)
        setMlComponents((prev) => detectionResult);
        setComponentIds((prev) => ({
            ...prev,
            ...detectionResult.components
        }))
        setWires((prev) => ([
            ...prev,
            ...detectionResult.lines
        ]))
    };

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
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            handleUploadClick={handleUploadClick}
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