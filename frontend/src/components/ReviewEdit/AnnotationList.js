import React, { useState, useEffect } from "react";
import AnnotationEditor from "./AnnotationEditor";
import { Edit2, Trash2 } from "lucide-react"; // Removed 'Save' import
import apiUrl from "../../config/apiConfig";

export default function AnnotationList({
  damageAnnotations,
  carParts,
  referenceNo,
  imageName,
  fetchDamageAnnotations,
}) {
  const [addingNew, setAddingNew] = useState(false);
  const [filter, setFilter] = useState("All");
  const [filteredAnnotations, setFilteredAnnotations] = useState([]);
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [totalCost, setTotalCost] = useState(0);

  const filterOptions = ["All", "Repair", "Replace"];

  // Calculate Total Cost
  useEffect(() => {
    const total = damageAnnotations.reduce(
      (sum, annotation) => sum + (parseFloat(annotation.ActualCostRepair) || 0),
      0
    );
    setTotalCost(total.toFixed(2));
  }, [damageAnnotations]);

  // Function to apply the filter and update filteredAnnotations
  useEffect(() => {
    if (filter === "All") {
      setFilteredAnnotations(damageAnnotations);
    } else if (filter === "Repair") {
      setFilteredAnnotations(
        damageAnnotations.filter((annotation) => annotation.RepairReplaceID === 0)
      );
    } else if (filter === "Replace") {
      setFilteredAnnotations(
        damageAnnotations.filter((annotation) => annotation.RepairReplaceID === 1)
      );
    }
  }, [filter, damageAnnotations]);

  // Function to handle adding a new annotation
  const handleAddAnnotation = async (newAnnotation) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/damageannotations`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            carPartMasterId: newAnnotation.CarPartMasterID,
            damageTypeId: newAnnotation.DamageTypeID,
            repairReplaceId: newAnnotation.RepairReplaceID,
            actualCostRepair: newAnnotation.ActualCostRepair,
            imageName: imageName,
            referenceNo: referenceNo,
          }),
        }
      );
      if (response.ok) {
        await fetchDamageAnnotations(referenceNo, imageName);
        setAddingNew(false);
      } else {
        throw new Error("Failed to add annotation");
      }
    } catch (error) {
      console.error("Error adding annotation:", error);
    }
  };

  // Function to handle deleting an annotation
  const handleDelete = async (annotationId) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/damageannotations/${annotationId}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        await fetchDamageAnnotations(referenceNo, imageName);
      } else {
        throw new Error("Failed to delete annotation");
      }
    } catch (error) {
      console.error("Error deleting annotation:", error);
    }
  };

  return (
    <div>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
        {filterOptions.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-md ${
              filter === type
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Total Cost Summary */}
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <div className="flex justify-between items-center">
          <span className="text-blue-700 font-medium">Current Image Cost:</span>
          <span className="text-blue-700 font-bold">₹{totalCost}</span>
        </div>
      </div>

      {/* Damage List and Edit Form */}
      <div className="space-y-4">
        {addingNew || editingAnnotation ? (
          <AnnotationEditor
            annotation={editingAnnotation || {}}
            carParts={carParts}
            referenceNo={referenceNo}
            imageName={imageName}
            fetchDamageAnnotations={fetchDamageAnnotations}
            isNew={addingNew}
            onSave={(newAnnotation) => {
              if (addingNew) {
                handleAddAnnotation(newAnnotation);
              } else {
                setEditingAnnotation(null);
              }
            }}
            onCancel={() => {
              setAddingNew(false);
              setEditingAnnotation(null);
            }}
            allowManualPrice={true}
          />
        ) : (
          <div>
            {/* Add New Annotation Button */}
            <button
              onClick={() => setAddingNew(true)}
              className="bg-green-500 text-white px-4 py-2 rounded mb-4"
            >
              Add New Annotation
            </button>

            {/* Annotations List */}
            <div className="space-y-3 sm:space-y-4 max-h-[500px] overflow-y-auto">
              {filteredAnnotations.map((annotation) => (
                <div
                  key={annotation.MLCaseImageAssessmentId}
                  className="bg-white border rounded-lg p-4 hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {
                          carParts.find(
                            (part) => part.CarPartMasterID === annotation.CarPartMasterID
                          )?.CarPartName || "N/A"
                        }
                      </h4>
                      <p className="text-sm text-gray-500">
                        {
                          ["Scratch", "Dent", "Broken", "NA"][
                            annotation.DamageTypeID
                          ]
                        }{" "}
                        -{" "}
                        {["Repair", "Replace", "NA"][annotation.RepairReplaceID]}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingAnnotation(annotation)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(annotation.MLCaseImageAssessmentId)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span
                      className={`px-2 py-1 rounded ${
                        annotation.RepairReplaceID === 0
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {["Repair", "Replace", "NA"][annotation.RepairReplaceID]}
                    </span>
                    <span className="font-medium">
                      ₹{annotation.ActualCostRepair || "N/A"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
