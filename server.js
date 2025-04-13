const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the Angular app
app.use(express.static(path.join(__dirname, 'dist/PaginaFinanzas')));

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/PaginaFinanzas/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});