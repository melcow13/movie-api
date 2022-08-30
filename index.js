const express = require('express'),
bodyParser = require('body-parser'),
uuid = require('uuid'),
morgan = require('morgan');
const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

//Express and Morgan Requires
const app = express();
const {check, validationResult} = require('express-validator');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));
//cors
const cors = require('cors');
app.use(cors());

//auth.js
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

/**
 * calls API end-point of getting all the movies in json format
 */
app.get('/movies',passport.authenticate('jwt',{session: false}), (req, res) => {
  Movies.find()
    .then((movies)=>{
      res.status(201).json(movies);
    })
    .catch((err)=>{
      console.error(err);
      res.status(500).send('Error: '+ err);
    })
  });

/**
 * calls API end-point of getting a single movie in json format
 */
app.get('/movies/:ID',passport.authenticate('jwt',{session: false}), (req, res) => {
  Movies.findOne({_id: req.params.ID})
    .then((movie)=>{
      res.json(movie);
    })
    .catch((err)=>{
      console.error(err);
      res.status(500).send('Error: '+ err);
    });
});

/**
 * calls API end-point of a user's data in json format
 */
app.get('/users/:username',passport.authenticate('jwt',{session: false}), (req, res) => {
  Users.findOne({Username: req.params.username})
    .then((user)=>{
      res.json(user);
    })
    .catch((err)=>{
      console.error(err);
      res.status(500).send('Error: '+ err);
    });
});

/**
 * calls API end-point of a genre in json format
 */
app.get('/movies/genres/:genre',passport.authenticate('jwt',{session: false}),(req, res) => {
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
app.get('/movies/directors/:name',passport.authenticate('jwt',{session: false}),(req, res)=>{
  Movies.findOne({'Director.Name': req.params.name})
    .then((movie)=>{
      res.json(movie.Director);
    })
    .catch((err)=>{
      console.error(err);
      res.status(500).send('Error; '+ err);
    });
});


/**
 * calls API end-point of adding a user to the database
 */
app.post('/users',
  // Validation logic
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

  // check the validation
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username }) // search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //if the user is found, send a response
          return res.status(400).send(req.body.Username + ' already exists');
        } else {
          Users
            .create({
              Name: req.body.Name,
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });
/**
 * calls API end-point of updating user's data 
 */
app.put('/edit/:username',passport.authenticate('jwt',{session: false}), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.username }, { $set:
    {
      Name: req.body.Name,
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

/**
 * calls API end-point of adding a movie to the favorite movie array
 */
app.post('/users/:Username/favorite/:MovieID', passport.authenticate('jwt',{session: false}),(req, res) => {
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

/**
 * calls API end-point of removing a movie to the favorite movie array
 */
app.delete('/users/:Username/favorite/:MovieID',passport.authenticate('jwt',{session: false}), (req, res) => {
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
/**
 * calls API end-point to remove current user from the database
 */
app.delete('/profile/:username',passport.authenticate('jwt',{session: false}), (req, res) => {
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
