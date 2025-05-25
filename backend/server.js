const express = require('express');
const connectDB = require('./db/connection');

const app = express();

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});