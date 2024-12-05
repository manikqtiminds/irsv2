// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ImageDisplay from './pages/ImageDisplay';
import ReviewEdit from './pages/ReviewEdit';
import Report from './pages/Report';
import SampleView from './pages/SampleView';
import SampleView2 from './pages/SampleView2';
import SampleView3 from './pages/SampleView3';
import SelectReference from './pages/SelectReference';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/images" />} />
        <Route path="/images" element={<ImageDisplay />} />
        <Route path="/review-edit" element={<ReviewEdit />} />
        <Route path="/report" element={<Report />} />
        <Route path="/sample" element={<SampleView />} />
        <Route path="/sample2" element={<SampleView2 />} />
        <Route path="/sample3" element={<SampleView3 />} />
        <Route path="/landing" element={<SelectReference />} />
      </Routes>
    </Router>
  );
}

export default App;
