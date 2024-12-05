import React, { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import useInspectionStore from "../store/inspectionStore";
import { Header } from "../components/Header";
import { ImageThumbnails } from "../components/ImageThumbnails";
import { ImageFrame } from "../components/ImageFrame2";

export default function ImageDisplay() {
  // Hooks must be at the top level
  const {
    images,
    currentImageIndex,
    setCurrentImageIndex,
    fetchImages,
    loading,
    error,
    setReferenceNo,
  } = useInspectionStore();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Extract reference number from query parameters
  useEffect(() => {
    const encryptedData = searchParams.get("data");
    if (encryptedData) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, "your_secret_key"); // Replace with your actual secret key
        const decryptedReferenceNo = bytes.toString(CryptoJS.enc.Utf8);

        // Set the referenceNo in Zustand store
        setReferenceNo(decryptedReferenceNo);

        // Fetch images for the decrypted reference number
        fetchImages(decryptedReferenceNo);
      } catch (error) {
        console.error("Failed to decrypt query parameter:", error);
      }
    } else {
      console.error("No 'data' query parameter found.");
    }
  }, [searchParams, setReferenceNo, fetchImages]);

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  const handlePrevious = (e) => {
    e.stopPropagation(); // Prevent event from bubbling to container
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation(); // Prevent event from bubbling to container
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handleMainImageClick = () => {
    navigate("/sample");
  };

  // Ensure hooks are not conditionally called
  const currentImg = images[currentImageIndex];

  return (
    <div className="min-h-screen bg-gray-100">
      <Header referenceNo={useInspectionStore((state) => state.referenceNo)} />

      {loading && (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      )}

      {!loading && !error && (!currentImg || !currentImg.imageDimensions) && (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500 text-lg">No images available for assessment</p>
        </div>
      )}

      {!loading && !error && currentImg && currentImg.imageDimensions && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Section Title */}
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Vehicle Inspection Images
            </h2>

            {/* Thumbnails Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                Image Gallery
              </h3>
              <ImageThumbnails
                images={images}
                currentImageIndex={currentImageIndex}
                onThumbnailClick={handleThumbnailClick}
              />
            </div>

            {/* Main Image Section */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-4">
                Selected Image Preview
              </h3>
              <div
                ref={containerRef}
                className="relative bg-black rounded-xl overflow-hidden flex items-center justify-center cursor-pointer"
                style={{ height: "70vh" }}
                onClick={handleMainImageClick}
              >
                <ImageFrame image={currentImg} />

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

                {/* Click to Edit Overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm">
                  Click to edit image
                </div>
              </div>

              {/* Image Counter */}
              <div className="mt-4 text-center text-gray-600">
                Image {currentImageIndex + 1} of {images.length}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
