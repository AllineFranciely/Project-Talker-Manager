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

// REQUISITO 2:

app.get('/talker/:id', async (req, res, _next) => {
  const { id } = req.params;
  const file = await fs.readFile('./talker.json', 'utf-8');
  const talkers = JSON.parse(file);
  const chosenTalker = talkers.find((talker) => talker.id === parseInt(id, 10));
  if (!chosenTalker) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  } res.status(HTTP_OK_STATUS).json(chosenTalker);
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
