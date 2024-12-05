import React, { useState } from "react";
import { Save } from "lucide-react";
import apiUrl from "../../config/apiConfig";

const damageTypeOptions = [
  { value: "0", label: "Scratch" },
  { value: "1", label: "Dent" },
  { value: "2", label: "Broken" },
  { value: "3", label: "NA" },
];
const repairTypeOptions = [
  { value: "0", label: "Repair" },
  { value: "1", label: "Replace" },
  { value: "2", label: "NA" },
];
const partTypeOptions = [
  { value: "Metal", label: "Metal" },
  { value: "Plastic", label: "Plastic" },
];

export default function AnnotationEditor({
  annotation,
  carParts,
  referenceNo,
  imageName,
  fetchDamageAnnotations,
  isNew = false,
  onSave,
  onCancel,
  allowManualPrice = false,
}) {
  const [editedAnnotation, setEditedAnnotation] = useState({
    CarPartMasterID: annotation?.CarPartMasterID || "",
    DamageTypeID: annotation?.DamageTypeID || "3",
    RepairReplaceID: annotation?.RepairReplaceID || "2",
    PartType: annotation?.PartType || "Metal",
    ActualCostRepair: annotation?.ActualCostRepair || "",
  });

  const handleSave = async () => {
    try {
      const payload = {
        carPartMasterId: editedAnnotation.CarPartMasterID,
        damageTypeId: editedAnnotation.DamageTypeID,
        repairReplaceId: editedAnnotation.RepairReplaceID,
        actualCostRepair: editedAnnotation.ActualCostRepair, // Use manual cost
        partType: editedAnnotation.PartType,
        imageName: imageName,
        referenceNo: referenceNo,
      };

      let response;

      if (isNew) {
        response = await fetch(`${apiUrl}/api/damageannotations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(
          `${apiUrl}/api/damageannotations/${annotation.MLCaseImageAssessmentId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      }

      if (response.ok) {
        await fetchDamageAnnotations(referenceNo, imageName);
        if (isNew) onCancel();
        else onSave(editedAnnotation);
      } else {
        throw new Error("Failed to save annotation");
      }
    } catch (error) {
      console.error("Error saving annotation:", error);
    }
  };

  const handleChange = (field, value) => {
    setEditedAnnotation((prev) => ({ ...prev, [field]: value }));
  };

  // Using selectedCarPart to display the name if needed
  const selectedCarPart = carParts.find(
    (part) => part.CarPartMasterID === editedAnnotation.CarPartMasterID
  );

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">
        {isNew ? "Add Damage Details" : "Edit Damage Details"}
      </h3>
      <div className="space-y-4">
        {/* Part Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Part Name
          </label>
          <select
            value={editedAnnotation.CarPartMasterID || ""}
            onChange={(e) =>
              handleChange("CarPartMasterID", parseInt(e.target.value))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Part Name</option>
            {carParts.map((part) => (
              <option key={part.CarPartMasterID} value={part.CarPartMasterID}>
                {part.CarPartName}
              </option>
            ))}
          </select>
        </div>
        {/* Display selected car part name (optional) */}
        {selectedCarPart && (
          <div>
            <p className="text-sm text-gray-500">
              Selected Part: {selectedCarPart.CarPartName}
            </p>
          </div>
        )}
        {/* Damage Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Damage Type
          </label>
          <select
            value={editedAnnotation.DamageTypeID?.toString() || "3"}
            onChange={(e) => handleChange("DamageTypeID", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {damageTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        {/* Repair Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Repair Type
          </label>
          <select
            value={editedAnnotation.RepairReplaceID?.toString() || "2"}
            onChange={(e) => handleChange("RepairReplaceID", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {repairTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        {/* Part Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Part Type
          </label>
          <select
            value={editedAnnotation.PartType || "Metal"}
            onChange={(e) => handleChange("PartType", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {partTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        {/* Repair Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Repair Cost (₹)
          </label>
          <input
            type="number"
            value={editedAnnotation.ActualCostRepair || ""}
            onChange={(e) =>
              handleChange("ActualCostRepair", e.target.value)
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        {/* Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isNew ? "Add Annotation" : "Save Changes"}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
