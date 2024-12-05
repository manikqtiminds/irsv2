import React, { useState, useEffect, useRef } from "react";

const CarPartsSearch = ({ carParts, handleChangeParent }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredParts, setFilteredParts] = useState(carParts);
  const [selectedPart, setSelectedPart] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const dropdownRef = useRef(null);
  const itemRefs = useRef([]); // Ref for each dropdown item

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    const filtered = carParts.filter((part) =>
      part.CarPartName.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredParts(filtered);
    setIsDropdownOpen(true); // Open dropdown on input change
    setHighlightedIndex(-1); // Reset highlighted index
  };

  // Handle item selection
  const handlePartSelect = (part) => {
    setSelectedPart(part);
    setSearchTerm(part.CarPartName); // Show selected item's name in input
    setFilteredParts(carParts); // Reset the list
    setIsDropdownOpen(false);
    handleChangeParent("CarPartMasterID", parseInt(part.CarPartMasterID));
  };

  // Handle keyboard events
  const handleKeyDown = (event) => {
    if (!isDropdownOpen) return;

    switch (event.key) {
      case "ArrowDown":
        setHighlightedIndex((prev) => {
          const nextIndex = prev < filteredParts.length - 1 ? prev + 1 : 0;
          scrollToItem(nextIndex);
          return nextIndex;
        });
        break;
      case "ArrowUp":
        setHighlightedIndex((prev) => {
          const prevIndex = prev > 0 ? prev - 1 : filteredParts.length - 1;
          scrollToItem(prevIndex);
          return prevIndex;
        });
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          handlePartSelect(filteredParts[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        break;
      default:
        break;
    }
  };

  // Scroll to the highlighted item
  const scrollToItem = (index) => {
    if (itemRefs.current[index]) {
      itemRefs.current[index].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

  // Clear the search input
  const handleClear = () => {
    setSearchTerm("");
    setFilteredParts(carParts);
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
    setSelectedPart(null);
    handleChangeParent("CarPartMasterID", '');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          placeholder="Search car parts"
          className="w-full border border-gray-300 rounded p-2 pr-10"
          onFocus={() => setIsDropdownOpen(true)} // Open dropdown on focus
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 pr-3"
          >
            ✖
          </button>
        )}
      </div>
      {isDropdownOpen && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded max-h-40 overflow-y-auto">
          {filteredParts.length > 0 ? (
            filteredParts.map((part, index) => (
              <li
                value={part.CarPartMasterID}
                key={part.CarPartMasterID}
                ref={(el) => (itemRefs.current[index] = el)} // Assign refs dynamically
                onClick={() => handlePartSelect(part)}
                className={`cursor-pointer px-2 py-1 ${
                  highlightedIndex === index
                    ? "bg-blue-300"
                    : "hover:bg-blue-100"
                }`}
              >
                {part.CarPartName}
              </li>
            ))
          ) : (
            <li className="px-2 py-1 text-gray-500">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default CarPartsSearch;
