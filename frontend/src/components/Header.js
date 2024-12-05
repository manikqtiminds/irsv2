import React from 'react';
import { Link } from 'react-router-dom';

export function Header({ referenceNo }) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-6">
            <span className="text-blue-600 font-semibold">Inspected Images</span>
            <Link to="/review-edit" className="text-gray-600 hover:text-blue-600 transition-colors">
              Review & Edit
            </Link>
            <Link to="/report" className="text-gray-600 hover:text-blue-600 transition-colors">
              Report Page
            </Link>
          </div>
          <div className="text-sm text-gray-500">
            Reference Number: <span className="font-medium">{referenceNo}</span>
          </div>
        </div>
      </nav>
    </header>
  );
}