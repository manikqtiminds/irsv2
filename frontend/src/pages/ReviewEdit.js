import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useInspectionStore from "../store/inspectionStore";
import { Header } from "../components/Header";
import { ImageThumbnails } from "../components/ImageThumbnails";
import { ImageFrame } from "../components/ImageFrame";
import AnnotationList from "../components/ReviewEdit/AnnotationList";
import apiUrl from "../config/apiConfig";

export default function ReviewEdit() {
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
  } = useInspectionStore();

  const [carParts, setCarParts] = useState([]);
  const referenceNo = "IAR-5614005";

  useEffect(() => {
    fetchCarParts();
    fetchImages(referenceNo);
  }, [fetchImages, referenceNo]);

  useEffect(() => {
    if (images.length > 0) {
      const imageName = images[currentImageIndex]?.imageName;
      fetchDamageAnnotations(referenceNo, imageName);
    }
  }, [fetchDamageAnnotations, referenceNo, images, currentImageIndex]);

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

  const handlePrevious = (e) => {
    e.stopPropagation();
    if (currentImageIndex > 0) setCurrentImageIndex(currentImageIndex - 1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentImageIndex < images.length - 1) setCurrentImageIndex(currentImageIndex + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!currentImage || !damageAnnotations) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">No data available for assessment</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header referenceNo={referenceNo} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Top Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Damage Assessment Review</h2>
              <p className="text-sm text-gray-500 mt-1">Image: {currentImage.imageName}</p>
            </div>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
              Export Report
            </button>
          </div>

          {/* Thumbnails Section */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Image Gallery</h3>
            <ImageThumbnails
              images={images}
              currentImageIndex={currentImageIndex}
              onThumbnailClick={setCurrentImageIndex}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Image Display */}
            <div className="relative bg-black rounded-xl overflow-hidden">
              <div className="relative" style={{ height: '70vh' }}>
                <ImageFrame image={currentImage} />

                {/* Navigation Buttons */}
                <button
                  onClick={handlePrevious}
                  disabled={currentImageIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 disabled:opacity-30 p-2 rounded-full transition-all focus:outline-none"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={currentImageIndex === images.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 disabled:opacity-30 p-2 rounded-full transition-all focus:outline-none"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Right Panel - Annotation List */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <AnnotationList
                damageAnnotations={damageAnnotations}
                carParts={carParts}
                referenceNo={referenceNo}
                imageName={currentImage.imageName}
                fetchDamageAnnotations={fetchDamageAnnotations}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}