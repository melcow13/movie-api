const express = require('express');
morgan = require('morgan');

const app = express();

app.use(morgan('common'));

app.get('/movies', (req, res) => {
  res.json();
});

app.get('/', (req, res) => {
  res.send('Welcome to my movie app!');
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
