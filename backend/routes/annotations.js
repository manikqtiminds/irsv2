const express = require('express');
const router = express.Router();
const s3 = require('../s3');

// Middleware to parse JSON bodies
router.use(express.json());

// Helper function to parse the content of a .txt file
function parseTxtFile(content) {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line) => {
    try {
      const [damageType, coords] = line.split(' ');
      if (!damageType || !coords) {
        throw new Error('Invalid line format');
      }

      const [x, y, x2, y2] = coords.split(',').map(Number);

      if ([x, y, x2, y2].some((value) => isNaN(value))) {
        throw new Error(`Invalid coordinates in line: "${line}"`);
      }

      return {
        damageType: parseInt(damageType, 10),
        coordinates: {
          x,
          y,
          width: x2 - x,
          height: y2 - y,
        },
      };
    } catch (error) {
      console.warn(`Error parsing line: "${line}"`, error);
      return null;
    }
  }).filter((entry) => entry !== null);
}

// Route to fetch annotations for a specific reference number and image
router.get('/:referenceNo/:imageName', async (req, res) => {
  const { referenceNo, imageName } = req.params;

  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `AIInspection/${referenceNo}/coordinates/${imageName}.txt`,
    };

    // Get the object from S3
    const data = await s3.getObject(params).promise();
    const annotations = parseTxtFile(data.Body.toString('utf-8'));
    res.json({ annotations });
  } catch (error) {
    if (error.code === 'NoSuchKey') {
      // If the file doesn't exist, return an empty array
      res.json({ annotations: [] });
    } else {
      console.error('Error fetching annotations:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  }
});

// Route to fetch all annotation files for a reference number
router.get('/:referenceNo', async (req, res) => {
  const { referenceNo } = req.params;

  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: `AIInspection/${referenceNo}/coordinates/`,
    };

    const data = await s3.listObjectsV2(params).promise();
    if (!data.Contents || data.Contents.length === 0) {
      return res.json({ annotations: [] });
    }

    const annotations = [];

    for (const item of data.Contents) {
      const key = item.Key;
      if (key.endsWith('.txt')) {
        try {
          const annotationData = await s3.getObject({ Bucket: params.Bucket, Key: key }).promise();
          const annotationContent = parseTxtFile(annotationData.Body.toString('utf-8'));
          annotations.push({
            imageName: key.split('/').pop().replace('.txt', ''),
            annotations: annotationContent,
          });
        } catch (error) {
          console.warn(`Error reading or parsing annotation file: ${key}`, error);
        }
      }
    }

    res.json({ annotations });
  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route to save annotations for a specific reference number and image
router.post('/:referenceNo/:imageName', async (req, res) => {
  const { referenceNo, imageName } = req.params;
  const annotations = req.body.annotations;

  if (!annotations) {
    return res.status(400).json({ message: 'Annotations data is required.' });
  }

  // Convert annotations back to .txt format
  const txtContent = annotations
    .map(({ damageType, coordinates }) => {
      const x2 = coordinates.x + coordinates.width;
      const y2 = coordinates.y + coordinates.height;
      return `${damageType} ${coordinates.x},${coordinates.y},${x2},${y2}`;
    })
    .join('\n');

  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `AIInspection/${referenceNo}/coordinates/${imageName}.txt`,
      Body: txtContent,
      ContentType: 'text/plain',
    };

    await s3.putObject(params).promise();

    res.json({ message: 'Annotations saved successfully.' });
  } catch (error) {
    console.error('Error saving annotations:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
