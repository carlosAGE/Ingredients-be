const openaiService = require('../services/openaiService');
const { uploadBase64Image } = require('../utils/blobUpload');
const Scan = require('../models/scan');

exports.handleScan = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    // 1. Upload image to Azure
    const imageUrl = await uploadBase64Image(imageBase64);

    // 2. Send image URL to OpenAI Vision
    const result = await openaiService.analyzeImage(imageUrl);

    // 3. Save to DB
    const saved = await Scan.create({
      imageUrl,
      result,
      // userId: req.user?.id (add later with auth)
    });

    res.json({ success: true, data: result, scanId: saved._id });
  } catch (error) {
    console.error('Scan failed:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
