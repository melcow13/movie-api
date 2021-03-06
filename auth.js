const jwtSecret = 'your_jwt_secret'; //same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
passport= require('passport');

require('./passport'); //local passport file

/**
 * function generating JWT token
 * @param {*} user 
 * @returns username encoding in the JWT and it will expires in 7days 
 */
let generateJWTToken= (user) =>{
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // username encoding in the JWT
    expiresIn: '7d', //expires in 7 days
    algorithm: 'HS256' // algorithm used to 'sign' or encode the values of the jwt
  });
}

module.exports= (router) =>{
  router.post('/login',(req, res)=>{
    passport.authenticate('local', {session: false}, (error, user, info)=>{
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req. login(user, {session: false}, (error)=>{
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({user,token});
      });
    })(req, res);
  });
}
