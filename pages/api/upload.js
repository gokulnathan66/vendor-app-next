import cloudinary from '../../lib/cloudinary';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // increase limit to handle base64 image
    },
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const fileStr = req.body.data;
      if (!fileStr) {
        return res.status(400).json({ error: 'No image data' });
      }

      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        // upload_preset: 'ml_default',
      });

      return res.status(200).json({ url: uploadResponse.secure_url });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      // Always return JSON, even on error
      return res.status(500).json({ error: 'Upload failed.' });
    }
  } else {
    // Always return JSON for unsupported methods
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
