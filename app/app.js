import express from 'express';
import mustache from 'mustache-express';
import path from 'path';

const app = express();

app.engine('mustache', mustache());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
  response.render('index');
});

app.listen(3000, () => console.log('Serving on localhost:3000'));
