import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import apiUrl from '../config/apiConfig';

function SelectReference() {
  const [referenceNumbers, setReferenceNumbers] = useState([]);
  const [selectedReference, setSelectedReference] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Initialize `useNavigate`

  useEffect(() => {
    // Fetch reference numbers from the backend
    async function fetchReferenceNumbers() {
      try {
        const response = await fetch(`${apiUrl}/api/referenceNumbers`);
        const data = await response.json();
        setReferenceNumbers(data.referenceNumbers);
      } catch (error) {
        console.error('Error fetching reference numbers:', error);
      }
    }

    fetchReferenceNumbers();
  }, []);

  const handleSubmit = async () => {
    if (!selectedReference) {
      setMessage('Please select a reference number.');
      return;
    }

    try {
      // Check if the reference number exists
      const response = await fetch(
        `${apiUrl}/api/referenceNumbers/check/${encodeURIComponent(selectedReference)}`
      );
      const data = await response.json();

      if (data.exists) {
        // Encrypt the reference number
        const secretKey = 'your_secret_key'; // Use a strong secret key
        const encryptedRefNo = CryptoJS.AES.encrypt(selectedReference, secretKey).toString();

        // Navigate to the ReviewEdit page with the encrypted reference number
        navigate(`/sample3?data=${encodeURIComponent(encryptedRefNo)}`);
      } else {
        setMessage('Reference number not available in the database.');
      }
    } catch (error) {
      console.error('Error checking reference number:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Select Reference Number</h2>
        <div className="mb-4">
          <select
            className="border p-2 w-full"
            value={selectedReference}
            onChange={(e) => {
              setSelectedReference(e.target.value);
              setMessage('');
            }}
          >
            <option value="">-- Select Reference Number --</option>
            {referenceNumbers.map((refNo) => (
              <option key={refNo} value={refNo}>
                {refNo}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Submit
        </button>
        {message && <p className="text-red-500 mt-4">{message}</p>}
      </div>
    </div>
  );
}

export default SelectReference;
