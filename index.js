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
app.get('/movies/:title', (req, res) => {
  Movies.findOne({Title: req.params.title})
    .then((movie)=>{
      res.json(movie);
    })
    .catch((err)=>{
      console.error(err);
      res.status(500).send('Error: '+ err);
    });
  });

//get data about a genre
app.get('/movies/genres/:genre',(req, res) => {
  Movies.findOne({'Genre.Name': req.params.genre })
    .then((movie)=>{
      res.json(movie.Genre);
    })
    .catch((err)=>{
      console.error(err);
      res.status(500).send('Error: '+ err);
    });
  });

//get data about a director by name
app.get('/movies/directors/:name',(req, res)=>{
  Movies.findOne({'Director.Name': req.params.name})
    .then((movie)=>{
      res.json(movie.Director);
    })
    .catch((err)=>{
      console.error(err);
      res.status(500).send('Error; '+ err);
    });
  });


//add new users to register
app.post('/users/:Username', (req, res)=> {
  Users.findOne({ Username: req.body.Username})
    .then((user)=>{
      if (user) {
        return res.status(400).send(req.body.Username + 'already exsists');
      } else{
        Users
          .create({
            Username: req.body.Username,
            Passowrd: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user)=>{ res.status(201).json(user) })
        .catch((error)=>{
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error)=> {
      console.error(error);
      res.status(500).send('Error: '+ error);
    });
});
//update username
app.put('/users/:username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//add a movie to their list of favorites
app.post('/users/:Username/favorite/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//delete movie from their favorite list
app.delete('/users/:Username/favorite/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});
//remove a user
app.delete('/users/:username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
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
