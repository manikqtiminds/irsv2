import React, { useEffect, useState, useRef } from "react";
import { Plus, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import useInspectionStore from "../store/inspectionStore";
import { HeaderClone } from "../components/HeaderClone";
import { VerticalThumbnails } from "../components/ReviewEdit/VerticalThumbnails";
import { ImageFrame } from "../components/ImageFrame";
import { ImageControls } from "../components/ImageControls";
import AnnotationListAlt from "../components/ReviewEdit/AnnotationListAlt-2";
import AnnotationEditor from "../components/ReviewEdit/AnnotationEditor";
import { useKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import { useImageZoom } from "../hooks/useImageZoom";
import { useFullscreen } from "../hooks/useFullscreen";
import { generatePDF } from "../utils/pdfGenerator";
import apiUrl from "../config/apiConfig";
import CryptoJS from "crypto-js";
import { useSearchParams } from "react-router-dom";

const SampleView = () => {
  const {
    images,
    currentImageIndex,
    setCurrentImageIndex,
    fetchImages,
    fetchDamageAnnotations,
    damageAnnotations,
    currentImage,
    loading,
    error,
    referenceNo,
    setReferenceNo, // Zustand store method to update referenceNo
  } = useInspectionStore();

  const [carParts, setCarParts] = useState([]);
  const [isAddingDamage, setIsAddingDamage] = useState(false);
  const [searchParams] = useSearchParams();
  const imageContainerRef = useRef(null);

    // Extract reference number from query parameters
    useEffect(() => {
      const encryptedData = searchParams.get("data");
      if (encryptedData) {
        try {
          const bytes = CryptoJS.AES.decrypt(encryptedData, "your_secret_key"); // Replace with your actual secret key
          const decryptedReferenceNo = bytes.toString(CryptoJS.enc.Utf8);
  
          // Set the referenceNo in Zustand store
          setReferenceNo(decryptedReferenceNo);
  
        } catch (error) {
          console.error("Failed to decrypt query parameter:", error);
        }
      } else {
        console.error("No 'data' query parameter found.");
      }
    }, [searchParams, setReferenceNo]);

    useEffect(() => {
      if (!referenceNo) return;
      fetchImages();
    }, [referenceNo, fetchImages]);

  const {
    scale,
    position,
    zoomIn,
    zoomOut,
    reset: resetZoom,
    handlePan,
  } = useImageZoom(1);
  const { toggleFullscreen } = useFullscreen(imageContainerRef);

  useEffect(() => {
    fetchCarParts();
    fetchImages(referenceNo);
  }, [fetchImages, referenceNo]);

  useEffect(() => {
    if (images.length > 0) {
      const imageName = images[currentImageIndex]?.imageName;
      fetchDamageAnnotations(imageName);
    }
  }, [images, currentImageIndex, fetchDamageAnnotations]);

  const fetchCarParts = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/carparts`);
      if (!response.ok) throw new Error("Failed to fetch car parts");
      const data = await response.json();
      setCarParts(data);
    } catch (error) {
      console.error("Error fetching car parts:", error);
    }
  };

  const handlePrevious = () => {
    if (currentImageIndex > 0) setCurrentImageIndex(currentImageIndex - 1);
  };

  const handleNext = () => {
    if (currentImageIndex < images.length - 1)
      setCurrentImageIndex(currentImageIndex + 1);
  };

  const handleAddDamage = () => {
    setIsAddingDamage(true);
  };

  const handleDrawDamage = () => {
    // Draw damage functionality will be implemented
  };

  const calculateTotalCost = () => {
    return damageAnnotations.reduce(
      (sum, annotation) => sum + (parseFloat(annotation.ActualCostRepair) || 0),
      0
    );
  };

  const calculateCurrentImageCost = () => {
    return damageAnnotations
      .filter((annotation) => annotation.imageName === currentImage?.imageName)
      .reduce(
        (sum, annotation) =>
          sum + (parseFloat(annotation.ActualCostRepair) || 0),
        0
      );
  };

  useKeyboardNavigation(handlePrevious, handleNext);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#e5e9f0]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002244]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#e5e9f0]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full md:h-screen">
      <HeaderClone
        referenceNo={referenceNo}
        onDownloadReport={() =>
          generatePDF({
            images,
            damageAnnotations,
            referenceNo,
            totalCost: calculateTotalCost(),
          })
        }
      />
      <div className="w-full h-5/6 flex flex-col md:flex-row md:justify-around p-2 md:pt-8 ">
        <div className="md:w-[5vw] w-full h-full">
          {/* Left Column - Thumbnails */}
          <div className="w-full flex justify-end">
            <div className="h-full overflow-y-auto no-scrollbar">
              <VerticalThumbnails
                images={images}
                currentImageIndex={currentImageIndex}
                onThumbnailClick={(index) => {
                  setCurrentImageIndex(index);
                }}
              />
            </div>
          </div>
        </div>
        <div className="md:w-[40vw] flex flex-col relative rounded-lg overflow-hidden mb-5 md:mb-0">
          <div
            ref={imageContainerRef}
            className="h-full"
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              transition: "transform 0.2s",
            }}
            onMouseDown={handlePan}
          >
            <ImageFrame image={currentImage} />
          </div>
          <ImageControls
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={resetZoom}
            onFullscreen={toggleFullscreen}
          />
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            disabled={currentImageIndex === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#002244]/70 hover:bg-[#002244] disabled:opacity-30 p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentImageIndex === images.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#002244]/70 hover:bg-[#002244] disabled:opacity-30 p-2 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
          {/* Action Buttons */}
          <div className="justify-center gap-4 hidden md:flex">
            <button
              onClick={handleAddDamage}
              className="p-3 bg-[#002244] text-white rounded-full hover:bg-[#003366] transition-colors shadow-md"
              title="Add Damage"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={handleDrawDamage}
              className="p-3 bg-[#003366] text-white rounded-full hover:bg-[#004488] transition-colors shadow-md"
              title="Draw Damage"
            >
              <Pencil className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="md:w-[49vw] w-full ">
          {isAddingDamage ? (
            <AnnotationEditor
              annotation={null}
              carParts={carParts}
              referenceNo={referenceNo}
              imageName={currentImage?.imageName}
              fetchDamageAnnotations={fetchDamageAnnotations}
              isNew={true}
              onSave={() => setIsAddingDamage(false)}
              onCancel={() => setIsAddingDamage(false)}
            />
          ) : (
            <AnnotationListAlt
              damageAnnotations={damageAnnotations}
              carParts={carParts}
              referenceNo={referenceNo}
              imageName={currentImage?.imageName}
              fetchDamageAnnotations={fetchDamageAnnotations}
              totalCost={calculateTotalCost()}
              currentImageCost={calculateCurrentImageCost()}
              onAddDamage={handleAddDamage}
            />
          )}
        </div>
      </div>
    </div>
  );
};
export default SampleView;
