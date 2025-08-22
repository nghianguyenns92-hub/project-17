const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path'); // Thêm module 'path' để xử lý đường dẫn tệp

const app = express();
const port = process.env.PORT || 3000;

// Sử dụng CORS để cho phép các yêu cầu từ frontend
app.use(cors());
app.use(express.json());

// Endpoint để phục vụ tệp HTML tĩnh (index.html)
// Khi người dùng truy cập vào URL gốc của bạn, máy chủ sẽ trả về tệp index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint cho proxy Gemini API, vẫn giữ nguyên
app.post('/gemini-proxy', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
        }
        
        const { prompt, generationConfig } = req.body;
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }],
        };

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
