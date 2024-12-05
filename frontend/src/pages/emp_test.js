import React, { useState } from "react";
import { Edit2, Trash2, Filter, Plus } from "lucide-react";
import { DamageTypeIndicator } from "../DamageTypeIndicator";
import AnnotationEditor from "./AnnotationEditor";
import apiUrl from "../../config/apiConfig";

export default function AnnotationListAlt({
  damageAnnotations,
  carParts,
  referenceNo,
  imageName,
  fetchDamageAnnotations,
  totalCost,
  currentImageCost,
  onAddDamage,
}) {
  const [filter, setFilter] = useState("All");
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredAnnotations = damageAnnotations.filter((annotation) => {
    if (filter === "All") return true;
    if (filter === "Repair") return annotation.RepairReplaceID === 0;
    if (filter === "Replace") return annotation.RepairReplaceID === 1;
    return true;
  });

  const handleDelete = async (id) => {
    if (isDeleting) return;
    if (
      !window.confirm("Are you sure you want to delete this damage annotation?")
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`${apiUrl}/api/damageannotations/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete annotation");
      }

      await fetchDamageAnnotations(referenceNo, imageName);
    } catch (error) {
      console.error("Error deleting annotation:", error);
      alert("Failed to delete annotation. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (annotation) => {
    setEditingAnnotation(annotation);
  };

  if (editingAnnotation) {
    return (
      <AnnotationEditor
        annotation={editingAnnotation}
        carParts={carParts}
        referenceNo={referenceNo}
        imageName={imageName}
        fetchDamageAnnotations={fetchDamageAnnotations}
        isNew={false}
        onSave={() => setEditingAnnotation(null)}
        onCancel={() => setEditingAnnotation(null)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Filter and Add Button */}
      <div className="sticky top-0 z-20 px-4 py-3 bg-blue-400 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#002244]">Damage List</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#002244]" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="text-sm bg-white border border-[#002244] rounded-md text-[#002244] focus:ring-2 focus:ring-[#002244] py-1"
              >
                <option value="All">All</option>
                <option value="Repair">Repair</option>
                <option value="Replace">Replace</option>
              </select>
            </div>
            <button
              onClick={onAddDamage}
              className="flex items-center gap-2 bg-[#002244] text-white px-3 py-1 rounded-md hover:bg-[#003366] transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Table or Empty State */}
      <div className="flex-1 relative overflow-auto">
        {filteredAnnotations.length > 0 ? (
          <table className="w-full min-w-[580px] divide-y divide-gray-200 text-left">
            <thead className="bg-green-600 sticky top-0 z-10">
              <tr>
                <th className="bg-[#FFDCB6] px-6 py-3 text-left text-xs font-medium text-[#002244] uppercase tracking-wider">
                  Part
                </th>
                <th className="bg-[#FFDCB6] px-6 py-3 text-left text-xs font-medium text-[#002244] uppercase tracking-wider">
                  Type
                </th>
                <th className="bg-[#FFDCB6] px-6 py-3 text-left text-xs font-medium text-[#002244] uppercase tracking-wider">
                  Action
                </th>
                <th className="bg-[#FFDCB6] px-6 py-3 text-center text-xs font-medium text-[#002244] uppercase tracking-wider">
                  Cost
                </th>
                <th className="bg-[#FFDCB6] px-6 py-3 text-right text-xs font-medium text-[#002244] uppercase tracking-wider">
                  Edit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAnnotations.map((annotation) => (
                <tr key={annotation.MLCaseImageAssessmentId} className="bg-[#f2fff7]">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {carParts.find(
                      (part) =>
                        part.CarPartMasterID === annotation.CarPartMasterID
                    )?.CarPartName || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <DamageTypeIndicator type={annotation.DamageTypeID} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {["Repair", "Replace"][annotation.RepairReplaceID] || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    ₹{annotation.ActualCostRepair || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleEdit(annotation)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        handleDelete(annotation.MLCaseImageAssessmentId)
                      }
                      className="text-red-600 hover:text-red-900 ml-2"
                      disabled={isDeleting}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500">No damage annotations available for this image.</p>
          </div>
        )}
      </div>

      {/* Cost Summary */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200">
        <table className="w-full min-w-[580px] border-collapse">
          <tbody>
            <tr className="bg-[#FFDCB6]">
              <td className="px-6 py-3 text-sm font-medium text-[#002244]">
                Current Damage Cost:
              </td>
              <td className="px-10"></td>
              <td className="px-6 py-3 text-sm font-bold text-[#002244] text-left">
                ₹{currentImageCost.toFixed(2)}
              </td>
            </tr>
            <tr className="bg-blue-400">
              <td className="px-6 py-3 text-sm font-medium text-[#002244]">
                Total Cost:
              </td>
              <td className="px-10"></td>
              <td className="px-6 py-3 text-sm font-bold text-[#002244] text-left">
                ₹{totalCost.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
