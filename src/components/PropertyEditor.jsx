/* Property Editor Component */
import { useState, useEffect, useRef } from "react";

export function PropertyEditor({ compInfo, onClose, onUpdate, onDelete }) {
const [name, setName] = useState(compInfo.name || "");
const [value, setValue] = useState(compInfo.value || "");
const [showToast, setShowToast] = useState(false);

const prevIdRef = useRef(compInfo.id);

// Auto-save when switching components
useEffect(() => {
    if (compInfo.id !== prevIdRef.current) {
    // Save previous component
    onUpdate(prevIdRef.current, { name, value });

    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 1500); // 1.5 seconds

    // Load new component data
    setName(compInfo.name || "");
    setValue(compInfo.value || "");

    prevIdRef.current = compInfo.id;
    }
}, [compInfo, onUpdate, name, value]);

// Handle backspace/delete for deleting component
useEffect(() => {
    const handleKeyDown = (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
        onDelete(compInfo.id);
    }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
}, [compInfo.id, onDelete]);

useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        onUpdate(compInfo.id, { name, value });
        onClose();
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [compInfo.id, name, value, onUpdate, onClose]);

return (
    <div className="absolute top-4 right-4 bg-white border p-4 rounded shadow z-25 w-60">
    <h2 className="font-bold mb-2">Edit Properties</h2>

    <label className="block mb-1">Name:</label>
    <input
        className="w-full border p-1 mb-2"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
    />

    <label className="block mb-1">Value:</label>
    <input
        className="w-full border p-1 mb-2"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.stopPropagation()}
    />

    <div className="flex justify-between">
        <button
        className="bg-green-500 text-white px-2 py-1 rounded"
        onClick={() => {
            onUpdate(compInfo.id, { name, value });
            onClose();
        }}
        >
        Save
        </button>

        <button
        className="bg-red-500 text-white px-2 py-1 rounded"
        onClick={() => onDelete(compInfo.id)}
        >
        Delete
        </button>

        <button
        className="bg-gray-300 text-black px-2 py-1 rounded"
        onClick={onClose}
        >
        Cancel
        </button>
    </div>

    {/* Toast message */}
    {showToast && (
        <div className="absolute -bottom-8 right-0 bg-green-500 text-white text-sm px-2 py-1 rounded shadow">
        Changes saved
        </div>
    )}
    </div>
);
}
