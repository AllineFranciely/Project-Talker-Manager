const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';
const emailRegex = /(.+)@(.+){2,}\.(.+){2,}/;
const dataRegex = /^[0-9]{2}\/[0-9]{2}\/[0-9]{4}$/;
const fileTalkers = './talker.json';

const { readFile, writeFile } = require('./functins-fs');

// REQUISITO 1:
app.get('/talker', async (_req, res, _next) => {
  const file = await fs.readFile(fileTalkers);
  const talkers = JSON.parse(file);
  if (talkers.length === 0) {
    return res.status(HTTP_OK_STATUS).send([]);
  } res.status(HTTP_OK_STATUS).json(talkers);
});

// REQUISITO 2:
app.get('/talker/:id', async (req, res, _next) => {
  const { id } = req.params;
  const file = await fs.readFile(fileTalkers);
  const talkers = JSON.parse(file);
  const chosenTalker = talkers.find((talker) => talker.id === parseInt(id, 10));
  if (!chosenTalker) {
    return res.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  } res.status(HTTP_OK_STATUS).json(chosenTalker);
});

// REQUISITOS 3 E 4:
const validateEmail = (email) => {
  if (!email || email === '') {
    return { message: 'O campo "email" é obrigatório' };
  } if (!email.match(emailRegex)) {
    return { message: 'O "email" deve ter o formato "email@email.com"' };
  }
};

const validatePassword = (password) => {
  if (!password || password === '') {
    return { message: 'O campo "password" é obrigatório' };
  } if (password.length < 6) {
    return { message: 'O "password" deve ter pelo menos 6 caracteres' };
  }
};

const tokenGenerate = (numCaracteres) => {
  let token = '';
  const caracteres = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789';
  for (let index = 0; index < numCaracteres; index += 1) {
    token += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return token;
};

// a função tokenGenerate recebe como parâmetro o número de caracteres desejados (no caso, 16);
// ela possui uma variável token que é uma string vazia e uma com os caracteres (letras e números desejados);
// com o for ela vai repetir o comando que gera o caractere aleatório do token numCaracteres vezes;
// Math.random() retorna um número decimal aleatório >= 0 e < 1;
// Multiplicando o número do Math.random() pelo nuMCaracteres (16) e arredondando pra baixo com o Math.floor() teremos um número inteiro >= 0 e menor que o tamanho da string (16);
// o charAt() pega a letra na posição do número gerado (de 0 até numCaracteres -1) e inserir na string com o comando token += ... ;

// Materiais de estudo utilizados: 
// https://www.webtutorial.com.br/funcao-para-gerar-uma-string-aleatoria-random-com-caracteres-especificos-em-javascript/
// https://www.luiztools.com.br/post/autenticacao-json-web-token-jwt-em-nodejs/

app.post('/login', (req, res, _next) => {
  const { email, password } = req.body;
  const emailErrorMessage = validateEmail(email);
  const passwordErrorMessage = validatePassword(password);
  const token = tokenGenerate(16);
  if (emailErrorMessage) {
    return res.status(400).json(emailErrorMessage);
  } if (passwordErrorMessage) {
    return res.status(400).json(passwordErrorMessage);
  }
  res.status(200).json({ token });
});

// REQUISITO 5: 
const validateToken = (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.status(401).json({ message: 'Token não encontrado' });
  }
  if (authToken.length !== 16) {
    return res.status(401).json({ message: 'Token inválido' });
  }
  next();
};

const validateName = (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'O campo "name" é obrigatório' });
  } if (name.length < 3) {
    return res.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  next();
};

const validateAge = (req, res, next) => {
  const { age } = req.body;
  if (!age) {
    return res.status(400).json({ message: 'O campo "age" é obrigatório' });
  } if (age < 18) {
    return res.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }
  next();
};

const validateTalk = (req, res, next) => {
  const { talk } = req.body;
  if (!talk) {
    return res.status(400).json({ message: 'O campo "talk" é obrigatório' });
  }
  next();
};

const validateRate = (req, res, next) => {
  const { talk } = req.body;
  if (talk.rate < 1 || talk.rate > 5) {
    return res.status(400).json({ message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  if (!talk.rate) {
    return res.status(400).json({ message: 'O campo "rate" é obrigatório' });
  } 
  next();
};

const validateWatchedAt = (req, res, next) => {
  const { talk: { watchedAt } } = req.body;
  if (!watchedAt) {
    return res.status(400).json({ message: 'O campo "watchedAt" é obrigatório' });
  } 
  if (!dataRegex.test(watchedAt)) {
    return res.status(400).json({ message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  } 
  next();
};

app.post('/talker', validateToken, validateName, validateAge, validateTalk,
  validateRate, validateWatchedAt, async (req, res, _next) => {
    const { name, age, talk } = req.body;
    const talkers = await readFile();
    const id = talkers.length + 1;
    talkers.push({ id, name, age, talk });
    await writeFile(talkers);
    res.status(201).send({ id, name, age, talk });
  });

// REQUISTO 6:
app.put('/talker/:id', validateToken, validateName, validateAge, validateTalk,
validateRate, validateWatchedAt, async (req, res, _next) => {
  const id = Number(req.params.id);
  const { name, age, talk } = req.body;
  const talkers = await readFile();
  const talkersById = talkers.findIndex((talker) => talker.id === id);
  const talkEdit = {
    id,
    name,
    age,
    talk,
  };
  talkers[talkersById] = { ...talkEdit };
  writeFile(talkers);
  res.status(200).json(talkEdit);
});

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.listen(PORT, () => {
  console.log('Online');
});
