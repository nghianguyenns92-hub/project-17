const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Sử dụng CORS để cho phép các yêu cầu từ frontend
app.use(cors());
app.use(express.json());

// Endpoint cho proxy
app.post('/gemini-proxy', async (req, res) => {
    try {
        // Lấy khóa API từ biến môi trường
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
        }
        
        // Lấy prompt và config từ body request
        const { prompt, generationConfig } = req.body;
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        // Cấu hình payload cho API Gemini
        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }],
        };

        // Nếu có generationConfig, thêm vào payload
        if (generationConfig) {
            payload.generationConfig = generationConfig;
        }

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', errorText);
            return res.status(response.status).send(errorText);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
