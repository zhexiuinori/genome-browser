const express = require('express');
const cors = require('cors');
const aiQueryRouter = require('./routes/aiQuery');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', aiQueryRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Guidance Backend is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI Guidance Backend Server running on port ${PORT}`);
  console.log(`OpenAI API configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No (using fallback rules)'}`);
});
