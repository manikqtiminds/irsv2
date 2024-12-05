import { create } from "zustand";
import apiUrl from "../config/apiConfig";

const useInspectionStore = create((set, get) => ({
  referenceNo: null, // Reference number state
  setReferenceNo: (newReferenceNo) => set({ referenceNo: newReferenceNo }), // Function to update referenceNo

  images: [], // Stores the list of images with metadata
  currentImageIndex: 0, // Index of the currently selected image
  currentImage: null, // The current image being displayed
  damageAnnotations: [], // List of damage annotations for the current image
  loading: false, // Loading state
  error: null, // Error state

  // Fetches the list of images for a given reference number
  fetchImages: async () => {
    const referenceNo = get().referenceNo; // Get the current reference number
    if (!referenceNo) {
      console.error("Reference number is not set.");
      return;
    }

    set({ loading: true, error: null, images: [], currentImageIndex: 0 });
    try {
      const response = await fetch(`${apiUrl}/api/images/${referenceNo}`);
      if (!response.ok) {
        throw new Error("Failed to fetch images");
      }
      const images = await response.json();
      if (!Array.isArray(images) || images.length === 0) {
        throw new Error("No images found for this reference");
      }

      const formattedImages = images.map((image) => ({
        imageName: image.imageName,
        imageUrl: image.imageUrl,
        imageDimensions: image.imageDimensions || { width: 1, height: 1 },
        damageInfo: image.damageInfo || [],
      }));

      set({
        images: formattedImages,
        loading: false,
        currentImageIndex: 0,
      });

      // Fetch damage annotations for the first image
      await get().fetchDamageAnnotations(formattedImages[0].imageName);
    } catch (error) {
      console.error("Error fetching images:", error);
      set({ error: error.message, loading: false });
    }
  },

  // Fetches damage annotations for a specific image
  fetchDamageAnnotations: async (imageName) => {
    const referenceNo = get().referenceNo; // Get the current reference number
    if (!referenceNo) {
      console.error("Reference number is not set.");
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await fetch(`${apiUrl}/api/singleimage/${referenceNo}/${imageName}`);
      if (!response.ok) {
        throw new Error("Failed to fetch damage annotations");
      }
      const data = await response.json();

      const { images } = get();
      const currentImg = images.find((img) => img.imageName === imageName);

      const updatedCurrentImage = {
        ...currentImg,
        ...data.imageDetails,
      };

      set({
        currentImage: updatedCurrentImage,
        damageAnnotations: data.damageAnnotations.map((annotation) => ({
          ...annotation,
          damageType: annotation.damageType ?? 0, // Default to 0 (scratch) if damageType is missing
        })) || [],
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching damage annotations:", error);
      set({ error: error.message, loading: false });
    }
  },

  // Updates the current image index and fetches damage annotations for the selected image
  setCurrentImageIndex: (index) => {
    set({ currentImageIndex: index });
    const { images, fetchDamageAnnotations } = get();
    const image = images[index];
    if (image) {
      fetchDamageAnnotations(image.imageName);
    }
  },
}));

export default useInspectionStore;
