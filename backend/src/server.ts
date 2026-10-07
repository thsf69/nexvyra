import dotenv from 'dotenv';
dotenv.config(); // Load environment variables first

import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`NEXVYRA API listening on port ${PORT}`);
});
