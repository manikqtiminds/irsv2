import React from "react";

export function ImageFrame({ image }) {
  if (!image || !image.imageDimensions) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        <p>Loading image...</p>
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{
        width: `${image.imageDimensions.width}px`,
        height: `${image.imageDimensions.height}px`,
        // position: "relative",
      }}
    >
      <img
        src={image.imageUrl}
        alt="Vehicle damage"
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      {image.damageInfo?.map((damage, index) => (
        <DamageBox key={index} damage={damage} />
      ))}
    </div>
  );
}

function DamageBox({ damage }) {
  const { x, y, width, height } = damage.coordinates || {};
  if (
    x === undefined ||
    y === undefined ||
    width === undefined ||
    height === undefined ||
    width <= 0 ||
    height <= 0
  ) {
    console.warn("Invalid coordinates for damage:", damage);
    return null;
  }

  const getDamageColor = (damageType) => {
    const type =
      typeof damageType === "string" ? parseInt(damageType, 10) : damageType;
    switch (type) {
      case 0:
        return "#22c55e"; // Green for Scratch
      case 1:
        return "#eab308"; // Yellow for Dent
      case 2:
        return "#ef4444"; // Red for Broken
      default:
        return "#9ca3af"; // Gray for unknown types
    }
  };

  const getDamageLabel = (damageType) => {
    const type =
      typeof damageType === "string" ? parseInt(damageType, 10) : damageType;
    switch (type) {
      case 0:
        return "Scratch";
      case 1:
        return "Dent";
      case 2:
        return "Broken";
      default:
        return `Type ${damageType}`; // Show actual type if unknown
    }
  };

  const boxStyle = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    position: "absolute",
    border: `2px solid ${getDamageColor(damage.damageType)}`,
    boxSizing: "border-box",
    pointerEvents: "none",
  };

  const labelStyle = {
    position: "absolute",
    bottom: "-24px",
    left: "0",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    color: "white",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "12px",
    whiteSpace: "nowrap",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    zIndex: 10,
  };

  const dotStyle = {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: getDamageColor(damage.damageType),
    display: "inline-block",
  };

  return (
    <div style={boxStyle}>
      <div style={labelStyle}>
        <span style={dotStyle}></span>
        {getDamageLabel(damage.damageType)}
      </div>
    </div>
  );
}
