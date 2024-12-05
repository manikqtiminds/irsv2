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

  // const costColor =
  //   filteredAnnotations.length % 2 != 1
  //     ? "dark:bg-gray-100"
  //     : "dark:bg-[#bef3c1]";

  return (
    <div className="h-full flex flex-col ">
      {/* Header with Filter and Add Button */}
      <div className="sticky top-0 z-20 px-4 py-3 bg-blue-400 rounded-t-lg">
        {" "}
        {/*bg-[#e8f0fe]*/}
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
              className="flex items-center gap-2 bg-[#002244] text-white px-3 py-1 rounded-md hover:bg-[#003366] transition-colors text-sm md:hidden"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Container */}

      <div className="flex-1 relative">
        {" "}
        {/*flex-1 relative*/}
        <div className="absolute w-full overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 ">
          {" "}
          {/* absolute inset-0 overflow-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200*/}
          {filteredAnnotations.length > 0 ? (
            <table className="w-full min-w-[580px] divide-y divide-gray-200  text-left">
              {" "}
              {/*w-full min-w-[580px]*/}
              <thead className="bg-green-600 sticky top-0 z-10">
                <tr>
                  <th
                    scope="col"
                    className="sticky top-0 bg-[#FFDCB6] px-6 py-3 text-left text-xs font-medium text-[#002244] uppercase tracking-wider whitespace-nowrap  w-auto"
                  >
                    Part
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 bg-[#FFDCB6] px-6 py-3 text-left text-xs font-medium text-[#002244] uppercase tracking-wider whitespace-nowrap w-auto"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 bg-[#FFDCB6] px-6 py-3 text-left text-xs font-medium text-[#002244] uppercase tracking-wider whitespace-nowrap w-auto"
                  >
                    Action
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 bg-[#FFDCB6] px-6 py-3 text-center text-xs font-medium text-[#002244] uppercase tracking-wider whitespace-nowrap w-auto"
                  >
                    Cost
                  </th>
                  <th
                    scope="col"
                    className="sticky top-0 bg-[#FFDCB6] px-6 py-3 text-right text-xs font-medium text-[#002244] uppercase tracking-wider whitespace-nowrap w-auto"
                  >
                    Edit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAnnotations.map((annotation) => (
                  <tr
                    key={annotation.MLCaseImageAssessmentId}
                    className="bg-[#f2fff7]"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {carParts.find(
                        (part) =>
                          part.CarPartMasterID === annotation.CarPartMasterID
                      )?.CarPartName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DamageTypeIndicator type={annotation.DamageTypeID} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm px-2 py-1 rounded-full font-medium ${
                          annotation.RepairReplaceID === 0
                            ? "bg-[#f17373] text-green-800"
                            : "bg-[#e6da89] text-yellow-800"
                        }`}
                      >
                        {["Repair", "Replace"][annotation.RepairReplaceID]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      ₹{annotation.ActualCostRepair || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(annotation)}
                          className="text-blue-600 hover:text-blue-900"
                          disabled={isDeleting}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(annotation.MLCaseImageAssessmentId)
                          }
                          className="text-red-600 hover:text-red-900"
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-500">
                No damage annotations available for this image.
              </p>
            </div>
          )}
          {/* Cost Summary - Fixed at Bottom */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 mb-6 md:mb-0">
            <table className="w-full min-w-[580px] border-collapse">
              <tbody>
                <tr className="bg-[#FFDCB6]">
                  <td className="px-6 py-3 text-sm font-medium text-[#002244]">
                    Current Damage Cost:
                  </td>
                  <td className="px-10"></td> {/* Spacer column */}
                  <td className="px-6 py-3 text-sm font-bold text-[#002244] text-left">
                    ₹{currentImageCost.toFixed(2)}
                  </td>
                </tr>
                <tr className="bg-blue-400">
                  <td className="px-6 py-3 text-sm font-medium text-[#002244] ">
                    Total Cost:
                  </td>
                  <td className="px-10"></td> {/* Spacer column */}
                  <td className="px-6 py-3 text-sm font-bold text-[#002244] text-left">
                    ₹{totalCost.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
