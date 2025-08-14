/* Icon Button Components */
import { useState } from "react";
import graphSymbolImg from "../assets/graphSymbol.svg";

export function ComponentIcon({ img, style, isActive, onClick }) {

    return (
      <div className="relative">
        <button
          className={`peer rounded-md w-10 h-10 border-2 border-gray-400 bg-white overflow-hidden transition duration-200
            ${isActive ? "border-4 border-gray-500" : ""}
            hover:border-gray-500 focus:outline-none`}
          onClick={onClick}
        >
          <img src={img} alt={style} className= "w-10 h-10 object-contain" />
        </button>
        <span
          className="absolute top-full mb-2 left-1/2 -translate-x-1/2
            bg-black text-white text-xs rounded px-2 py-1
            opacity-0 peer-hover:opacity-100
            pointer-events-none
            transition-opacity duration-300 select-none
            whitespace-nowrap"
        >
          {style}
        </span>
      </div>
    );
  }

  export function HelpPopup() {
    const [isOpen, setIsOpen] = useState(false);
  
    const keybinds = [
      ["Shift + R", "Rotate floating component"],
      ["Shift + Left Click (or Middle Mouse)", "Pan canvas"],
      ["Scroll Wheel", "Zoom in/out"],
      ["Click", "Place component"],
      ["Delete", "Remove selected component"],
      ["Click component", "Select for editing"],
    ];
  
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {!isOpen && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow"
            onClick={() => setIsOpen(true)}
          >
            Help
          </button>
        )}
  
        {isOpen && (
          <div className="bg-white border border-gray-300 rounded shadow-lg p-4 w-72 relative">
            <button
              className="absolute top-1 right-2 text-gray-500 hover:text-black"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-2">Keybinds</h2>
            <ul className="text-sm space-y-1">
              {keybinds.map(([combo, description]) => (
                <li key={combo}>
                  <span className="font-mono text-blue-600">{combo}</span>: {description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  export function InfoButton({ connections, setConnections, buildConnections, simplifyConnectionsGraph, wires, componentIds, activeButton, setActiveButton }) {
    const isOpen = activeButton === "graph"

    const handleOpen = () => {
        if (isOpen) {
          setActiveButton(null); // close if already open
        } else {
          setActiveButton("graph"); // open this one
        }
      };

    const handleClick = () => {
        const calculatedConnections = buildConnections(wires, componentIds)
        const readableConnections = simplifyConnectionsGraph(calculatedConnections)
        setConnections(readableConnections)
    }
  
    return (
      <div className="relative group">
        {/* The Toolbar Button */}
        <button
          onClick={handleOpen}
          className={`rounded-md w-10 h-10 border-2 border-gray-400 bg-white overflow-hidden
            transition duration-200 ${isOpen ? 'border-4 border-gray-500' : ''} hover:border-gray-500`}
        >
          <img src={graphSymbolImg} alt={"graph symbol"} className= "w-10 h-10 object-contain" />
        </button>
  
        <span className="absolute top-full mb-2 left-1/2 -translate-x-1/2
          bg-black text-white text-xs rounded px-2 py-1
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-300 select-none whitespace-nowrap">
            Connections
        </span>
  
        {/* The Popup */}
        {isOpen && (
          <div className="absolute top-12 left-0 z-50 w-100 bg-white border border-gray-300 rounded shadow-md p-3">
            <button
              onClick={handleOpen}
              className="absolute top-1 right-2 text-gray-500 hover:text-black"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-2">Connections</h2>
            <pre className="text-sm bg-gray-100 p-2 rounded">
                {JSON.stringify(connections, null, 2)}
            </pre>
            <button
            onClick={handleClick}
            className='text-gray-500 bg-white border border-gray-300 rounded shadow-md p-1 hover:text-black'
            >
                Get Connections
            </button>
          </div>
        )}
      </div>
    );
  }

  export function ComponentsButton({ buttons, activeComponent, setActiveComponent, activeButton, setActiveButton, setFloatingIcon, info }) {
    const isOpen = activeButton === info.hover;

    const handleClick = () => {
      if (isOpen) {
        setActiveButton(null); // close if already open
      } else {
        setActiveButton(info.hover); // open this one
      }
    };

  return (
  
  <div className="relative group">
  {/* The Toolbar Button */}
  <button
    onClick={handleClick}
    className={`rounded-md w-10 h-10 border-2 border-gray-400 bg-white overflow-hidden
      transition duration-200 ${isOpen ? 'border-4 border-gray-500' : ''} hover:border-gray-500`}
  >
    <img src={info.symbol} alt={info.hover} className= "w-10 h-10 object-contain" />
  </button>
  <span className="absolute top-full mb-2 left-1/2 -translate-x-1/2
          bg-black text-white text-xs rounded px-2 py-1
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-300 select-none whitespace-nowrap">
            {info.hover}
 </span>

  {/* The Popup */}
  {isOpen && activeButton === info.hover && (
    <div className={`absolute top-12 left-0 z-50 w-${info.width} bg-white border border-gray-300 rounded shadow-md p-3`}>
      <button
        onClick={handleClick}
        className="absolute top-1 right-2 text-gray-500 hover:text-black"
      >
        ×
      </button>
      <h2 className="text-lg font-semibold mb-2">{info.hover}</h2>
      <div className="flex space-x-2">
              {buttons.map(({ img, type, main }, index) => 
                main === info.main ? (
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
            </div>
    </div>
  )}
</div>
);
}

export function UploadButton({ selectedFile, setSelectedFile, handleUploadClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
  
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      setSelectedFile(file);
      setUploadSuccess(true);
  
      // Optionally reset success popup after some time
      setTimeout(() => setUploadSuccess(false), 3000);
    };
  
    return (
      <div className="relative group">
        {!isOpen && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow"
            onClick={() => setIsOpen(true)}
          >
            Upload Image
          </button>
        )}
  
        {isOpen && (
          <div className="bg-white border border-gray-300 rounded shadow-lg p-4 w-72 relative">
            <button
              className="absolute top-1 right-2 text-gray-500 hover:text-black"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-2">Upload Image</h2>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-2 hover:bg-gray-200 w-60"
            />
            {selectedFile && (
            <>
              <p className="text-sm text-gray-700">
                Selected file: {selectedFile.name}
              </p>
              <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow"
              onClick={handleUploadClick}
              >
                Run Detection
              </button>

            </>
            )}
          {uploadSuccess && (
            <div className="mt-2 p-2 bg-green-100 text-green-700 rounded">
              Upload successful!
            </div>
          )}
  
          </div>
        )}

      </div>
    );
  }



