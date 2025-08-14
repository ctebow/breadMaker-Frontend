import { useState, useEffect, act } from "react"
import { ComponentIcon, InfoButton, ComponentsButton, UploadButton} from "./IconButton.jsx"
import { KEY_BINDINGS } from "../utils/constants.js";
import ANDImg from "../assets/AND.svg";
import thyristorImg from "../assets/thyristor.svg";

export function ToolBar({
     buttons, 
     setActiveComponent, 
     setFloatingIcon, 
     setIsDrawingWire, 
     activeComponent, 
     connections,
     setConnections,
     buildConnections,
     simplifyConnectionsGraph,
     wires,
     componentIds,
     handleUndo,
     handleRedo,
     selectedFile,
     setSelectedFile,
     handleUploadClick,
     mousePos }) {

    const [undoDisabled, setUndoDisabled] = useState(false);
    const [redoDisabled, setRedoDisabled] = useState(false);
    const [activeInfoButton, setActiveInfoButton] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key;
            if (key === 'Escape') {
                setActiveComponent(null);
                setIsDrawingWire(false);
                setFloatingIcon(false); // also clear floating icon
            } else if (key in KEY_BINDINGS) {
                const comp = KEY_BINDINGS[key];
                setActiveComponent(comp);
                setFloatingIcon(true); 
                if (key !== "wire") {
                    setIsDrawingWire(false);
                }
            }
        };
    
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    
        // Helper to debounce Undo button
    const onUndoClick = () => {
        if (undoDisabled) return;
        handleUndo();
        setUndoDisabled(true);
        setTimeout(() => setUndoDisabled(false), 1000);
    };

    // Helper to debounce Redo button
    const onRedoClick = () => {
        if (redoDisabled) return;
        handleRedo();
        setRedoDisabled(true);
        setTimeout(() => setRedoDisabled(false), 1000);
    };

    return (
        <div className="relative">
          {/* Mouse position display at top-left, small and subtle */}
          <div className="text-xs text-gray-600 pl-2 pt-2 select-none">
            X: {mousePos.x} Y: {mousePos.y} {activeComponent ? `Component: ${activeComponent}` : ""}
          </div>
      
          {/* Toolbar container */}
          <div className="flex justify-between items-center bg-gray-100 p-2 shadow-md">
      
            {/* Left side: component icons */}
            <div className="flex space-x-2">
              {buttons.map(({ img, type, main }, index) => 
                main === true ? (
                <ComponentIcon
                  key={index}
                  img={img}
                  style={type}
                  isActive={activeComponent === type}
                  onClick={() => {
                    setActiveComponent((prev) => {
                      const newVal = prev === type ? null : type;
                      setFloatingIcon(!!newVal);
                      return newVal;
                    });
                  }}
                />
              ) : null)}
              <ComponentsButton
                buttons={buttons}
                activeComponent={activeComponent}
                setActiveComponent={setActiveComponent}
                setFloatingIcon={setFloatingIcon}
                info={{symbol: ANDImg, hover: "logic", main: "logic", width: 75}}
                activeButton={activeInfoButton}
                setActiveButton={setActiveInfoButton}
              />
              <ComponentsButton
                buttons={buttons}
                activeComponent={activeComponent}
                setActiveComponent={setActiveComponent}
                setFloatingIcon={setFloatingIcon}
                info={{symbol: thyristorImg, hover: "more", main: false, width: 400}}
                activeButton={activeInfoButton}
                setActiveButton={setActiveInfoButton}
              />
               <InfoButton
                connections={connections}
                setConnections={setConnections}
                buildConnections={buildConnections}
                simplifyConnectionsGraph={simplifyConnectionsGraph}
                wires={wires}
                componentIds={componentIds}
                activeButton={activeInfoButton}
                setActiveButton={setActiveInfoButton}
              />
            </div>
      
            {/* Right side: Undo, Redo, InfoButton, and title */}
            <div className="flex items-center space-x-4">
              <UploadButton
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              handleUploadClick={handleUploadClick}
              />
              <button
                onClick={onUndoClick}
                disabled={undoDisabled}
                className={`px-3 py-1 rounded border border-gray-400 font-medium text-gray-700
                  transition duration-150
                  ${undoDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}
                `}
                title="Undo"
                type="button"
              >
                Undo
              </button>
      
              <button
                onClick={onRedoClick}
                disabled={redoDisabled}
                className={`px-3 py-1 rounded border border-gray-400 font-medium text-gray-700
                  transition duration-150
                  ${redoDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}
                `}
                title="Redo"
                type="button"
              >
                Redo
              </button>
      
              {/* Title text */}
              <div className="mr-2 text-gray-800 select-none tracking-wide">
                b r e a d M a k e r
              </div>
      
            </div>
          </div>
        </div>
      );
    }