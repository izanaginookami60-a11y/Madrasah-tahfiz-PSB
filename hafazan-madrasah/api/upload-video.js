// ============================================
// SERVERLESS FUNCTION: Get Cloudinary Config
// URL: https://yourapp.vercel.app/api/upload-video
// ============================================

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // Ambil konfigurasi Cloudinary daripada Environment Variables Vercel (SANGAT SELAMAT!)
        const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
        const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;
        
        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            return res.status(500).json({
                success: false,
                error: 'Cloudinary tidak dikonfigurasikan di pelayan Vercel'
            });
        }
        
        // Pulangkan konfigurasi ke browser dengan selamat
        // Browser akan memuat naik video terus ke Cloudinary menggunakan tetapan ini
        return res.status(200).json({
            success: true,
            config: {
                uploadUrl: 'https://api.cloudinary.com/v1_1/' + CLOUD_NAME + '/video/upload',
                uploadPreset: UPLOAD_PRESET,
                cloudName: CLOUD_NAME
            }
        });
        
    } catch (error) {
        console.error('Ralat konfigurasi video:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Ralat dalaman pelayan'
        });
    }
}