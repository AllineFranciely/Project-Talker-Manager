const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

// REQUISITO 1:
app.get('/talker', async (_req, res, _next) => {
  const file = await fs.readFile('./talker.json', 'utf-8');
  const talkers = JSON.parse(file);
  if (talkers.length === 0) {
    res.status(HTTP_OK_STATUS).send([]);
  } res.status(HTTP_OK_STATUS).json(talkers);
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
