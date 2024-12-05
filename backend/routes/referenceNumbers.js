const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db'); // Adjust the path if necessary

// Endpoint to get all reference numbers
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise; // Await the poolPromise
    const result = await pool.request().query('SELECT Distinct ReferenceNo FROM [db_motor].[dbo].[MLImageAssessment]');
    const referenceNumbers = result.recordset.map((row) => row.ReferenceNo);
    res.json({ referenceNumbers });
  } catch (error) {
    console.error('Error fetching reference numbers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint to check if a reference number exists
router.get('/check/:referenceNo', async (req, res) => {
  const { referenceNo } = req.params;
  try {
    const pool = await poolPromise; // Await the poolPromise
    const result = await pool
      .request()
      .input('ReferenceNo', sql.VarChar, referenceNo)
      .query('SELECT COUNT(1) as count FROM [db_motor].[dbo].[MLImageAssessment] WHERE ReferenceNo = @ReferenceNo');
    const exists = result.recordset[0].count > 0;
    res.json({ exists });
  } catch (error) {
    console.error('Error checking reference number:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
