const db = require("../models");
const Login = db.users;
const Op = db.Sequelize.Op;

const jwt = require('jsonwebtoken');

function generateAccessToken(username) {
    return jwt.sign({ username, roles: ['ADMINISTRATOR', 'USER'] }, process.env.TOKEN_SECRET, {

        expiresIn: '30d'

    });
}
function verifyToken(token)
{
  return jwt.verify(token, process.env.TOKEN_SECRET)
}

exports.login = (req, res, next) => {
    Login.findOne({
        where: {username: req.body.user,
                password: req.body.pass 
            }
      }).then(users =>{
        if (users) {
            const token = generateAccessToken(req.body.user);
            return res.cookie('jwt', token, {httpOnly: true, sameSite: true, maxAge: 1000 * 86400 * 30}).json({success: true});
        }else{
            res.status(200).json({success:false})
        }
      })
};
exports.newUser = (req, res, next) => {
    Login.create({
        username: req.body.user,
        password: req.body.pass     
      })
    .then(data => {
        res.status(200).json({ success: true, data:data })
    })
    .catch(err => {
        res.status(200).json({ success: false,
            message:
            err.message || "Some error occurred while creating the User." })
    });
};

exports.verifyLogin = (req, res) =>
{
  var cookie = req.cookies.sessionCookie;
  
  if(!verifyToken(cookie)){
    const status = 401
    const message = 'Unauthorized'
    return res.status(status).json({ status, message })
  }
  
  res.status(200).send();
  console.log(cookie);

};