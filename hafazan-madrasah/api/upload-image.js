// ============================================
// SERVERLESS FUNCTION: Upload Image to ImgBB
// URL: https://yourapp.vercel.app/api/upload-image
// ============================================

export default async function handler(req, res) {
    // Set CORS headers (membolehkan browser panggil API ini)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Hanya benarkan kaedah POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method tidak dibenarkan. Sila guna POST.' 
        });
    }
    
    try {
        // Ambil data base64 gambar dari body request
        const { image } = req.body;
        
        if (!image) {
            return res.status(400).json({ 
                success: false, 
                error: 'Tiada data imej disediakan' 
            });
        }
        
        // Ambil API key daripada Environment Variables Vercel (SANGAT SELAMAT!)
        const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
        
        if (!IMGBB_API_KEY) {
            return res.status(500).json({
                success: false,
                error: 'Sijil keselamatan IMGBB_API_KEY tidak dikonfigurasikan di pelayan Vercel'
            });
        }
        
        // Formatkan data mengikut keperluan x-www-form-urlencoded ImgBB
        const formData = new URLSearchParams();
        formData.append('image', image);
        
        const response = await fetch('https://api.imgbb.com/1/upload?key=' + IMGBB_API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            // Pulangkan respons sukses dengan URL gambar yang bersih
            return res.status(200).json({
                success: true,
                data: {
                    url: data.data.url,
                    displayUrl: data.data.display_url || data.data.url,
                    thumb: (data.data.thumb && data.data.thumb.url) ? data.data.thumb.url : data.data.url,
                    deleteUrl: data.data.delete_url || '',
                    id: data.data.id || ''
                }
            });
        } else {
            return res.status(500).json({
                success: false,
                error: data.error?.message || 'Muat naik ke ImgBB gagal'
            });
        }
        
    } catch (error) {
        console.error('Ralat muat naik:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Ralat dalaman pelayan'
        });
    }
}