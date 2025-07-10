// index.js
const express = require('express');
const cors = require('cors');
const scanRoutes = require('./routes/scanRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, {
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));
  
app.use(cors());
app.use(express.json({ limit: '10mb' })); // adjust if you're sending base64 image

app.use('/scan', scanRoutes);

app.get('/', (req, res) => {
  res.send('Ingredient Scanner Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
