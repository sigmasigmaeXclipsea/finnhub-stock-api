// ==================== UNIFIED STOCK ENDPOINT (FIXED) ====================
app.get('/api/stock/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const upperSymbol = symbol.toUpperCase();
  
  // Validate Russell 3000
  if (!isRussell3000(upperSymbol)) {
    return res.status(400).json({ 
      error: `${upperSymbol} is not in Russell 3000 index` 
    });
  }
  
  // Check cache
  const cacheKey = `stock:${upperSymbol}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  try {
    // Fetch both quote and profile with queue
    const [quoteResponse, profileResponse] = await Promise.all([
      queueRequest(() =>
        axios.get(
          `https://finnhub.io/api/v1/quote?symbol=${upperSymbol}&token=${FINNHUB_API_KEY}`
        )
      ),
      queueRequest(() =>
        axios.get(
          `https://finnhub.io/api/v1/stock/profile2?symbol=${upperSymbol}&token=${FINNHUB_API_KEY}`
        )
      )
    ]);
    
    // IMPORTANT: Return the proper structure that frontend expects
    const response = {
      quote: quoteResponse.data,      // This is the price data (c, d, dp, etc.)
      profile: profileResponse.data,  // This is the company data
      cached: false
    };
    
    setCached(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error(`Error fetching ${upperSymbol}:`, error.message);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limited - too many requests. Please try again in a moment.' 
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});
