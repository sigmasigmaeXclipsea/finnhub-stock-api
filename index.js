const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;
const FINNHUB_API_KEY = 'd4ef1bpr01qrumpf5ojgd4ef1bpr01qrumpf5ok0';

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Finnhub Stock API is running!' });
});

// Get real-time stock quote
app.get('/api/stock/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${FINNHUB_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Finnhub API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Get company profile
app.get('/api/company/:symbol', async (req, res) => {
  const { symbol } = req.params;
  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol.toUpperCase()}&token=${FINNHUB_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Company profile error:', error.message);
    res.status(500).json({ error: 'Failed to fetch company data' });
  }
});

// Search for stocks
app.get('/api/search/:query', async (req, res) => {
  const { query } = req.params;
  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/search?q=${query}&token=${FINNHUB_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});

console.log('DEBUG Render env PORT:', process.env.PORT);
console.log('DEBUG Using PORT:', PORT);

// Add this after your other endpoints
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query || query.length < 1) {
    return res.json({ result: [] });
  }
  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
    );
    res.json(response.data); // Finnhub returns { count, result: [...] }
  } catch (error) {
    console.error('Finnhub search error:', error.message);
    res.status(500).json({ error: 'Failed to search stocks' });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Stock API server running on port ${PORT}`);
});

