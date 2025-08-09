/* Icon Button Components */
import { useState } from "react"

export function ComponentIcon({ img, style, isActive, onClick }) {

    return (
      <div className="relative group">
        <button
          className={`rounded-md w-10 h-10 border-2 border-gray-400 bg-white overflow-hidden transition duration-200
            ${isActive ? "border-4 border-gray-500" : ""}
            hover:border-gray-500 focus:outline-none`}
          onClick={onClick}
        >
          <img src={img} alt={style} className= "w-10 h-10 object-contain" />
        </button>
        <span
          className="absolute top-full mb-2 left-1/2 -translate-x-1/2
            bg-black text-white text-xs rounded px-2 py-1
            opacity-0 group-hover:opacity-100
            pointer-events-none
            transition-opacity duration-300 select-none
            whitespace-nowrap"
        >
          {style}
        </span>
      </div>
    );
  }
  
  
  export function MenuButton() {
      const [isActive, setIsActive] = useState(false);
      return (
          <div className='relative group'>
              <button
              onClick={() => setIsActive(isActive ? false: true)}
              className={`rounded-md w-10 h-10 border-2 border-gray-400 bg-white overflow-hidden
                  transition duration-200 ${isActive ? 'border-4 border-gray-500': ''} hover:border-gray-500`}>
                  Menu
              </button>
              <span
              className="absolute top-full mb-2 left-1/2 -translate-x-1/2
              bg-black text-white text-xs rounded px-2 py-1
              opacity-0 group-hover:opacity-100
              pointer-events-none
              transition-opacity duration-300 select-none
              whitespace-nowrap">
              Menu
               </span>
          </div>
      );
  }
  
  export function HelpButton( { image }) {
      const [isActive, setIsActive] = useState(false);
      return (
          <div className='relative group'>
              <button
              onClick={() => setIsActive(isActive ? false: true)}
              className={`rounded-md w-10 h-10 border-2 border-gray-400 bg-white overflow-hidden
                  transition duration-200 ${isActive ? 'border-4 border-gray-500': ''} hover:border-gray-500`}>
                Help
              </button>
              <span
              className="absolute top-full mb-2 left-1/2 -translate-x-1/2
              bg-black text-white text-xs rounded px-2 py-1
              opacity-0 group-hover:opacity-100
              pointer-events-none
              transition-opacity duration-300 select-none
              whitespace-nowrap">
              Help
               </span>
          </div>
      );
  }
  
  export function UploadButton() {
      const [isUploading, setIsUploading] = useState(false);
      return (
          <div className='relative group'>
              <button 
              onClick={() => setIsUploading(isUploading ? false : true)}
              className={`rounded-md w-30 h-10 border-2 border-gray-400 bg-white text-sm overflow-hidden transition duration-200
            ${isUploading ? "border-4 border-gray-500" : ""}
            hover:border-gray-500`}>
              Upload Diagram
              </button>
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

  export function InfoButton({ connections, setConnections, buildConnections, simplifyConnectionsGraph, wires, componentIds }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = () => {
        const calculatedConnections = buildConnections(wires, componentIds)
        const readableConnections = simplifyConnectionsGraph(calculatedConnections)
        setConnections(readableConnections)
    }
  
    return (
      <div className="relative group">
        {/* The Toolbar Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`rounded-md w-10 h-10 border-2 border-gray-400 bg-white overflow-hidden
            transition duration-200 ${isOpen ? 'border-4 border-gray-500' : ''} hover:border-gray-500`}
        >
          .net
        </button>
  
        <span className="absolute top-full mb-2 left-1/2 -translate-x-1/2
          bg-black text-white text-xs rounded px-2 py-1
          opacity-0 group-hover:opacity-100 pointer-events-none
          transition-opacity duration-300 select-none whitespace-nowrap">
        </span>
  
        {/* The Popup */}
        {isOpen && (
          <div className="absolute top-12 left-0 z-50 w-100 bg-white border border-gray-300 rounded shadow-md p-3">
            <button
              onClick={() => setIsOpen(false)}
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