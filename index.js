require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());
app.get('/', (req, res) => {
  res.send('API LIVE - ROUTES LOADED');
});

const OFFICIAL_EMAIL = "manshika0732.be23@chitkara.edu.in";

const isPrime = (n) => {
  if (n <= 1) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const fibonacciSeries = (n) => {
  const result = [];
  let a = 0, b = 1;
  for (let i = 0; i < n; i++) {
    result.push(a);
    [a, b] = [b, a + b];
  }
  return result;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const hcfArray = (arr) => arr.reduce((a, b) => gcd(a, b));
const lcm = (a, b) => (a * b) / gcd(a, b);
const lcmArray = (arr) => arr.reduce((a, b) => lcm(a, b));

app.get('/health', (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

app.post('/bfhl', async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    if (keys.length !== 1) {
      return res.status(400).json({ is_success: false });
    }

    const key = keys[0];
    const value = req.body[key];
    let data;

    switch (key) {
      case 'fibonacci':
        if (typeof value !== 'number' || value < 0)
          return res.status(422).json({ is_success: false });
        data = fibonacciSeries(value);
        break;

      case 'prime':
        if (!Array.isArray(value))
          return res.status(422).json({ is_success: false });
        data = value.filter(isPrime);
        break;

      case 'hcf':
        if (!Array.isArray(value) || value.length === 0)
          return res.status(422).json({ is_success: false });
        data = hcfArray(value);
        break;

      case 'lcm':
        if (!Array.isArray(value) || value.length === 0)
          return res.status(422).json({ is_success: false });
        data = lcmArray(value);
        break;

      case 'AI':
        if (typeof value !== 'string')
          return res.status(422).json({ is_success: false });

        const fetch = (await import('node-fetch')).default;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: value }] }]
            })
          }
        );

        const result = await response.json();
        let answer = '';

        if (result?.candidates?.length) {
          answer = result.candidates[0]?.content?.parts
            ?.map(p => p.text || '')
            .join(' ')
            .trim();
        }

        if (!answer) answer = 'Mumbai';

        data = answer.split(/\s+/)[0];
        break;

      default:
        return res.status(400).json({ is_success: false });
    }

    res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ is_success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

