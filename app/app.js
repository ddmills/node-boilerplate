import dotenv from 'dotenv';
import express from 'express';
import mustache from 'mustache-express';
import path from 'path';

dotenv.config();

const app = express();

app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('view cache', process.env.VIEW_CACHE);
app.set('views', path.join(__dirname, 'views'));

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
  response.render('index');
});

const server = app.listen(process.env.PORT, () => console.log(`listening ${server.address().port}`));
