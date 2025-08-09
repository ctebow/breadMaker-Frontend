import React from "react";

export const PlacedComponent = React.memo(function PlacedComponent({
  compInfo,
  selectedId,
  setSelectedId,
  onMouseDown,
  isSnappedToWire,
}) {
  const isSelected = selectedId === compInfo.id;


  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setSelectedId(compInfo.id);
      }}
      onMouseDown={onMouseDown}
      style={{
        position: "absolute",
        left: compInfo.xPos,
        top: compInfo.yPos,
        transform: `translate(-50%, -50%) rotate(${compInfo.rotation || 0}deg)`,
        willChange: "transform"
      }}
      className={`absolute ${
        isSelected ? "outline outline-2 outline-gray-500" : ""
      } ${isSnappedToWire ? "outline outline-2 outline-blue-500" : ""} hover:outline hover:outline-2 hover:outline-gray-400 transition-all duration-200`}
    >
      <img
        src={compInfo.image}
        alt={compInfo.type}
        style={{ width: "100%", height: "100%" }}
        draggable={false}
      />
      <div
        className="text-xs bg-white px-1 py-0.5 rounded shadow absolute"
        style={{
          top: 45,
          left: "50%",
          transform: `translateX(-50%) rotate(${-compInfo.rotation}deg)`,
          whiteSpace: "nowrap",
          willChange: "transform"
        }}
      >
        {compInfo.name} {compInfo.value}
      </div>
    </div>
  );
}, areEqual);

function areEqual(prev, next) {
  return (
    prev.compInfo.xPos === next.compInfo.xPos &&
    prev.compInfo.yPos === next.compInfo.yPos &&
    prev.compInfo.rotation === next.compInfo.rotation &&
    prev.selectedId === next.selectedId
  );
}

  