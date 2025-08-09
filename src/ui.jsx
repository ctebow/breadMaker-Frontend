import { useEffect, useState } from "react";
import menuIcon from "./assets/menuIcon.png";
import questionMarkIcon from "./assets/qMarkIcon2.png";

/* Things to keep in state. 
- Current Selected Component
- Current Placed Components List
- Current rotation of Component
- Current to-be-placed component
- Sandbox scale
- Past componentIds in a stack
- Wrap sandbox in a scrollable div for panning and scrolling. 
*/

const KEY_BINDINGS = {
    r: "resistor",
    c: "capacitor",
    l: "inductor",
    v: "voltage-dc",
    a: "voltage-ac",
    d: "diode",
    w: "wire",
    s: "switch",
  };

function ComponentIcon({ img, style, isActive, onClick }) {

  return (
    <div className="relative group">
      <button
        className={`rounded-md w-10 h-10 border-2 border-gray-400 bg-white overflow-hidden transition duration-200
          ${isActive ? "border-4 border-gray-500" : ""}
          hover:border-gray-500 focus:outline-none`}
        onClick={onClick}
      >
        <img src={img} alt={style} className="w-10 h-10 object-contain" />
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


function MenuButton() {
    const [isActive, setIsActive] = useState(false);
    return (
        <div className='relative group'>
            <button
            onClick={() => setIsActive(isActive ? false: true)}
            className={`rounded-md w-10 h-10 border-2 border-gray-400 bg-white overflow-hidden
                transition duration-200 ${isActive ? 'border-4 border-gray-500': ''} hover:border-gray-500`}>
                <img src={menuIcon} className='bg-white'/>
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

function HelpButton() {
    const [isActive, setIsActive] = useState(false);
    return (
        <div className='relative group'>
            <button
            onClick={() => setIsActive(isActive ? false: true)}
            className={`rounded-md w-10 h-10 border-2 border-gray-400 bg-white overflow-hidden
                transition duration-200 ${isActive ? 'border-4 border-gray-500': ''} hover:border-gray-500`}>
                <img src={questionMarkIcon} alt="help menu" className='bg-white'/>
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


export function ToolBar({ buttons, activeComponent, setActiveComponent, mousePos }) {

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key;
            if (key === 'Escape') {
                setActiveComponent(null);
            } else if (key in KEY_BINDINGS) {
                setActiveComponent(KEY_BINDINGS[key]);
            }
            // Ignore everything else (like Shift or R)
        };
    
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []); 

  return (
    <div className='relative'>
        <div className='absolute top-1 right-10 text-gray-600 font-sans text-xl'>
            b r e a d M a k e r
        </div>
        <div className='absolute top-8 right-24 text-gray-600 text-sm'>
            @breadMaker
        </div>
        <div className='absolute top-2 right-49 text-gray-600 text-sm bg-white'>
            <HelpButton></HelpButton>
        </div>
        <div className='absolute top-2 right-62'>
            <UploadButton></UploadButton>
        </div>
        <div className='absolute top-2 right-95'>
            <MenuButton></MenuButton>
        </div>
        <div className='text-xs text-gray-600 pr-2'>
            X: {mousePos.x} Y: {mousePos.y}
        </div>
        <div className="flex justify-start items-center bg-gray-100 p-2 space-x-2 shadow-md">
        {buttons.map(({ img, type }, index) => (
            <ComponentIcon 
            key={index} 
            img={img} 
            style={type}  
            isActive={activeComponent === type}
            onClick={() => setActiveComponent((prev) => (prev === type ? null : type))}/>
        ))}
        </div>
    </div>
  );
}

function imgFor(component, buttons) {
    const found = buttons.find(btn => btn.type === component)
    return found?.img // returns null if not found
}

export function FloatingIcon({ activeComponent, buttons, mousePos, showIcon, rotation }) {

    if (!activeComponent || !showIcon) return null;

    const src = imgFor(activeComponent, buttons);
    if (!src) return null;

    return (
        <div>
            <img src={src}
                alt={activeComponent}
                className="absolute pointer-events-none select-none w-6 h-6 z-50"
                style={{position: 'absolute',
                    pointerEvents: 'none',  // so it doesn’t block clicks
                    top: mousePos.y,
                    left: mousePos.x,
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`, // center the icon on the cursor
                    userSelect: 'none',
                    width: '75px', // or whatever size
                    height: '75px',
                    zIndex: 1000,

                }}>
            </img>
        </div>
    );
}

function PlacedComponent({ compInfo, selectedId, setSelectedId }) {

    const isSelected = selectedId === compInfo.key

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                setSelectedId(compInfo.key)
            }}
            style={{...compInfo.style,
                width: 75,
                height: 75
            }}
            className={`relative ${isSelected ? "outline outline-2 outline-blue-400": ""}`}
        >
            <img
                key={compInfo.key}
                src={compInfo.src}
                alt={compInfo.name}
                style={{ width: '100%', height: '100%' }}
                draggable={false}
            />
        </div>
    );
}


// dont know about this one, have to check it out. 
export function PropertyEditor({ compInfo, onClose, onUpdate, onDelete }) {
    const [name, setName] = useState(compInfo.name || "");
    const [value, setValue] = useState(compInfo.value || "");
  
    return (
      <div className="absolute top-4 right-4 bg-white border p-4 rounded shadow z-50 w-64">
        <h2 className="font-bold mb-2">Component Properties</h2>
        <label className="block mb-1">Name:</label>
        <input className="w-full border p-1 mb-2" value={name} onChange={(e) => setName(e.target.value)} />
        
        <label className="block mb-1">Value:</label>
        <input className="w-full border p-1 mb-2" value={value} onChange={(e) => setValue(e.target.value)} />
  
        <div className="flex justify-between">
          <button className="bg-green-500 text-white px-2 py-1 rounded" onClick={() => {
            onUpdate(compInfo.key, { name, value });
            onClose();
          }}>Save</button>
          
          <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => onDelete(compInfo.key)}>Delete</button>
          
          <button className="bg-gray-300 text-black px-2 py-1 rounded" onClick={onClose}>Cancel</button>
        </div>
      </div>
    );
  }
  

export function Sandbox({ onMouseMove, activeComponent, buttons, componentIds, selectedId, setSelectedId, rotation, setComponentIds, onMouseLeave, onMouseEnter }) {
    
    function handleMouseMove(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        onMouseMove({
            x: Math.round(e.clientX - rect.left),
            y: Math.round(e.clientY - rect.top,)
        });
    }

    function handleClick(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.round(e.clientX - rect.left);
        const y = Math.round(e.clientY - rect.top);
    
        if (activeComponent) {
            const id = crypto.randomUUID();
            setComponentIds(prev => ({
                ...prev,
                [id]: {
                    type: activeComponent,
                    xPos: x,
                    yPos: y,
                    rotation: rotation
                }
            }));
        } else {
            setSelectedId(null); // Deselect if clicked background and not placing
        }
    }
    
    
    return (
        <div className={`relative bg-white border border-gray-300 rounded shadow mt-4 overflow-auto flex-1 ${activeComponent ? "cursor-none": "cursor-default"}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        onClick={handleClick}>
        {Object.entries(componentIds).map(([id, comp]) => {
            const button = buttons.find(b => b.type === comp.type);
            if (!button) return null;

            const compInfo = {
                key: id,
                src: button.img,
                name: comp.type,
                value: 0,
                style: {
                    position: "absolute",
                    left: comp.xPos,
                    top: comp.yPos,
                    transform: `translate(-50%, -50%) rotate(${comp.rotation || 0}deg)`,
                },
            };

            return <PlacedComponent 
            compInfo={compInfo}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            />
        })}


        </div>
    )
};
