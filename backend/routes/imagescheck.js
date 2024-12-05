const express = require('express');
const router = express.Router();
const s3 = require('../s3'); // Your S3 setup module

// Route to fetch all images for a reference number
router.get('/:referenceNo', async (req, res) => {
  const { referenceNo } = req.params;

  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: `AIInspection/${referenceNo}/images/`, // Adjust folder path as needed
    };

    const data = await s3.listObjectsV2(params).promise();
    if (!data.Contents || data.Contents.length === 0) {
      return res.status(404).json({ message: 'No images found for this reference number' });
    }

    const fileNames = data.Contents.map((item) => item.Key.split('/').pop());
    res.json({ images: fileNames });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route to download a specific image
// Route to download a specific image
router.get('/download/:referenceNo/:fileName', async (req, res) => {
    const { referenceNo, fileName } = req.params;
  
    try {
      // Construct the S3 Key
      const key = `AIInspection/${referenceNo}/images/${fileName}`;
      console.log(`Attempting to fetch S3 key: ${key}`); // Debug log
  
      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key, // Use the constructed key
      };
  
      // Generate the signed URL
      const signedUrl = s3.getSignedUrl('getObject', {
        ...params,
        Expires: 60, // URL expires in 60 seconds
      });
  
      res.json({ downloadUrl: signedUrl });
    } catch (error) {
      console.error('Error generating download URL:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  });
  

module.exports = router;
