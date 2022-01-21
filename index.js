const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));


//get a list of movies
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies)=>{
      res.status(201).json(movies);
    })
    .catch((err)=>{
      console.error(err);
      res.status(500).send('Error: '+ err);
    })
  });

//get data about a single movie
app.get('/movies/:name', (req, res) => {
  res.json(movies.find((movies)=>
    {return movies.name === req.params.name
    }));
  });

//get data about a genre
app.get('/movies/:genre',(req, res) => {
  res.json(movies.find((movies)=>
    {return movies.genre === req.params.genre
    }));
  });

//get data about a director by name
app.get('/movies/directors/:name',(req, res)=>{
  res.json(directors.find((directors) =>
    {return directors.name === req.params.name
    }));
  });


//add new users to register
app.post('/movies/users', (req, res)=> {
  let newUser = req.body;

  if (!newUser.name) {
    const message = 'Missing name in request body';
    res.status(400).send(message);
  } else {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);
  }
});
//update username
app.put('/users/:name', (req, res)=>{
  let user = users.fine((user)=> {
    return user.name === req.params.name
  });

  if (user){
    user.userName [req.params.userName] = parseInt(req.params.userName);
    res.status(201).send('User'+req.params.userName +'was updated');
  } else {
    res.status(404).send('User with the name'+ req.params.userName +'was not found.');
  }
});

//add a movie to their list of favorites
app.post('/users/listofffavorites',(req, res)=>{
  let newMovie = req.body;
  if(!newMovie.name) {
    const message ='Successfully added';
    res.status(400).send(message);
  } else {
    movies.push(newMovie);
    res.status(201).send(newMovie);
  }
});

//delete movie
app.delete('/users/listoffavorites',(req, res)=> {
  let movie = movies.find((movie) => {
    return movie.name === req.params.name
  });

  if (movie){
    movies = movies.filter((obj)=> {
      return obj.name !==req.params.name});

    res.status(201).send('Movie '+ req.params.name + ' was deleted');
    }
  });
//remove a user
app.delete('/users',(req, res)=>{
  let user = users.find((user)=>
  {return user.id === req.params.id
   });

  if (user) {
      users = users.filter((obj)=>{
        return obj.id !==req.params.id
      });
      res.status(201).send('Student' + req.params.id + ' was deleted.')
    }
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
  console.log('Your app is listening on port 8080');
});
