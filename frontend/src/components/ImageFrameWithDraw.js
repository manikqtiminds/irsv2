// ImageFrameWithDraw.js
import React from "react";
import { Stage, Layer, Image as KonvaImage, Rect, Text } from "react-konva";
import useImage from "use-image";
import DrawingLayer from "./DrawingLayer";

export function ImageFrame({
  image,
  annotations,
  setAnnotations,
  isDrawing,
  openAnnotationEditor, // Added this prop
}) {
  const [img] = useImage(image?.imageUrl || null);

  const isImageLoading = !image || !image.imageDimensions || !img;

  // Functions to get color and label based on damage type
  function getDamageColor(damageType) {
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
  }

  function getDamageLabel(damageType) {
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
  }

  return (
    <div className="relative">
      {isImageLoading ? (
        <div className="flex justify-center items-center h-full text-gray-500">
          <p>Loading image...</p>
        </div>
      ) : (
        <div
          style={{
            width: `${image.imageDimensions.width}px`,
            height: `${image.imageDimensions.height}px`,
          }}
        >
          <Stage
            width={image.imageDimensions.width}
            height={image.imageDimensions.height}
          >
            {/* Image Layer */}
            <Layer>
              <KonvaImage image={img} />
            </Layer>
            {/* Damage Info Layer */}
            <Layer>
              {image.damageInfo?.map((damage, index) => (
                <React.Fragment key={`damage-${index}`}>
                  <Rect
                    x={damage.coordinates?.x || 0}
                    y={damage.coordinates?.y || 0}
                    width={damage.coordinates?.width || 0}
                    height={damage.coordinates?.height || 0}
                    stroke={getDamageColor(damage.damageType)}
                    strokeWidth={2}
                    onClick={() => {
                      // Open AnnotationEditor for existing damage info
                      openAnnotationEditor({
                        ...damage,
                        id: `damage-${index}`,
                        x: damage.coordinates?.x || 0,
                        y: damage.coordinates?.y || 0,
                        width: damage.coordinates?.width || 0,
                        height: damage.coordinates?.height || 0,
                        isNew: true, // Treat as new since they are not in DB
                      });
                    }}
                  />
                  <Text
                    x={damage.coordinates?.x || 0}
                    y={(damage.coordinates?.y || 0) - 20}
                    text={getDamageLabel(damage.damageType)}
                    fontSize={14}
                    fill="white"
                    stroke="black"
                    strokeWidth={0.5}
                  />
                </React.Fragment>
              ))}
            </Layer>
            {/* Existing Annotations Layer */}
            <Layer>
              {annotations.map((annotation, index) => (
                <Rect
                  key={annotation.id || `annotation-${index}`}
                  id={annotation.id}
                  x={annotation.x || 0}
                  y={annotation.y || 0}
                  width={annotation.width || 0}
                  height={annotation.height || 0}
                  stroke="red"
                  strokeWidth={2}
                  draggable
                  onClick={() => {
                    openAnnotationEditor(annotation);
                  }}
                  onDragEnd={(e) => {
                    const { x, y } = e.target.position();
                    const updatedAnnotations = annotations.map((a) =>
                      a.id === annotation.id ? { ...a, x, y } : a
                    );
                    setAnnotations(updatedAnnotations);
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    node.scaleX(1);
                    node.scaleY(1);
                    const updatedAnnotations = annotations.map((a) =>
                      a.id === annotation.id
                        ? {
                            ...a,
                            x: node.x(),
                            y: node.y(),
                            width: node.width() * scaleX,
                            height: node.height() * scaleY,
                          }
                        : a
                    );
                    setAnnotations(updatedAnnotations);
                  }}
                />
              ))}
            </Layer>
            {/* Drawing Layer */}
            {isDrawing && (
              <DrawingLayer
                setAnnotations={setAnnotations}
                openAnnotationEditor={openAnnotationEditor}
              />
            )}
          </Stage>
        </div>
      )}
    </div>
  );
}
