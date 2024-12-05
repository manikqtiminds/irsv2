// DrawingLayer.js
import React, { useState, useRef, useEffect } from "react";
import { Layer, Rect, Transformer } from "react-konva";

const DrawingLayer = ({
  annotations,
  setAnnotations,
  openAnnotationEditor,
}) => {
  const [newAnnotation, setNewAnnotation] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const isDrawing = useRef(false);
  const transformerRef = useRef();

  // Handle mouse down event
  const handleMouseDown = (e) => {
    console.log("handleMouseDown");
    if (e.target === e.target.getStage()) {
      // Start drawing new annotation
      isDrawing.current = true;
      const { x, y } = e.target.getStage().getPointerPosition();
      setNewAnnotation({
        x,
        y,
        width: 0,
        height: 0,
        id: `temp-${Date.now()}`,
      });
      setSelectedId(null);
    } else {
      // Select existing annotation
      const clickedOn = e.target;
      const id = clickedOn.id();
      setSelectedId(id);
      openAnnotationEditor(
        annotations.find((ann) => ann.id === id) || null
      );
    }
  };

  // Handle mouse move event
  const handleMouseMove = (e) => {
    if (!isDrawing.current || !newAnnotation) return;
    console.log("handleMouseMove");
    const stage = e.target.getStage();
    const { x, y } = stage.getPointerPosition();
    setNewAnnotation({
      ...newAnnotation,
      width: x - newAnnotation.x,
      height: y - newAnnotation.y,
    });
  };

  // Handle mouse up event
  const handleMouseUp = () => {
    console.log("handleMouseUp");
    if (isDrawing.current && newAnnotation) {
      const annotationToAdd = {
        ...newAnnotation,
        id: `new-${Date.now()}`,
        isNew: true,
      };
      setAnnotations((prevAnnotations) => [
        ...prevAnnotations,
        annotationToAdd,
      ]);
      openAnnotationEditor(annotationToAdd);
      setNewAnnotation(null);
    }
    isDrawing.current = false;
  };

  // Update transformer when selectedId changes
  useEffect(() => {
    if (selectedId && transformerRef.current) {
      const stage = transformerRef.current.getStage();
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  console.log("Annotations in DrawingLayer:", annotations);

  return (
    <Layer
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Render existing annotations */}
      {annotations.map((ann, index) => (
        <Rect
          key={ann.id || `rect-${index}`}
          id={ann.id}
          x={ann.x}
          y={ann.y}
          width={ann.width}
          height={ann.height}
          stroke="red"
          strokeWidth={2}
          draggable
          onClick={(e) => {
            e.cancelBubble = true;
            setSelectedId(ann.id);
            openAnnotationEditor(ann);
          }}
          onTap={(e) => {
            e.cancelBubble = true;
            setSelectedId(ann.id);
            openAnnotationEditor(ann);
          }}
          onDragEnd={(e) => {
            const { x, y } = e.target.position();
            const updatedAnnotations = annotations.map((a) =>
              a.id === ann.id ? { ...a, x, y } : a
            );
            setAnnotations(updatedAnnotations);
          }}
          onTransformEnd={(e) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            // Reset scale
            node.scaleX(1);
            node.scaleY(1);
            const updatedAnnotations = annotations.map((a) =>
              a.id === ann.id
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
          onDblClick={() => {
            // Remove the annotation on double-click
            const updatedAnnotations = annotations.filter(
              (a) => a.id !== ann.id
            );
            setAnnotations(updatedAnnotations);
          }}
        />
      ))}

      {/* Render new annotation while drawing */}
      {newAnnotation && (
        <Rect
          x={newAnnotation.x}
          y={newAnnotation.y}
          width={newAnnotation.width}
          height={newAnnotation.height}
          stroke="blue"
          strokeWidth={2}
        />
      )}

      {/* Transformer for selected annotation */}
      <Transformer ref={transformerRef} />
    </Layer>
  );
};

export default DrawingLayer;
