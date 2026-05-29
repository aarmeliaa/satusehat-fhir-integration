const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8000;

// 1. Fungsi untuk mengambil Access Token dari Kemenkes
async function getSatusehatToken() {
    const clientId = process.env.SATUSEHAT_CLIENT_ID.trim();
    const clientSecret = process.env.SATUSEHAT_CLIENT_SECRET.trim();    
    const authUrl = process.env.AUTH_URL.trim();

    // (Opsional) Validasi untuk mengingatkan jika AUTH_URL lupa diisi di .env
    if (!authUrl) {
        throw new Error("AUTH_URL belum diset di file .env");
    }

    // Format data wajib x-www-form-urlencoded
    const bodyParams = new URLSearchParams();
    bodyParams.append('client_id', clientId);
    bodyParams.append('client_secret', clientSecret);
    bodyParams.append('grant_type', 'client_credentials'); 

    // --- TAMBAHKAN KODE INI UNTUK DEBUGGING ---
    console.log("=== CEK DATA SEBELUM DIKIRIM ===");
    console.log("Target URL :", authUrl);
    console.log("Client ID  :", clientId ? clientId.substring(0, 8) + "..." : "KOSONG/UNDEFINED!");
    console.log("Secret     :", clientSecret ? clientSecret.substring(0, 8) + "..." : "KOSONG/UNDEFINED!");
    console.log("================================");
    // ------------------------------------------

    try {
        const response = await fetch(authUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyParams
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("Detail Error dari Kemenkes:\n", JSON.stringify(data, null, 2));
            
            const errorMessage = data.error_description || data.message || "Gagal mendapatkan token";
            throw new Error(errorMessage);
        }

        return data.access_token;
    } catch (error) {
        console.error("Error Auth SATUSEHAT:", error);
        throw error;
    }
}

// 2. Route/Endpoint buatanmu sendiri untuk mengetes fungsi di atas
app.get('/api/test-auth', async (req, res) => {
    try {
        const token = await getSatusehatToken();
        res.json({ 
            success: true, 
            message: "Berhasil mendapatkan token dari SATUSEHAT!",
            token: token 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/', (req, res) => {
    res.json({ message: "SATUSEHAT Integration API is running" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});