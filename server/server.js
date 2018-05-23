require('./config/config');

const Nexmo = require('nexmo');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
let jsotp = require('jsotp');
var {mongoose} = require('./db/mongoose');
var request=require('request');
var {User} = require('./models/user');
var {Rent} = require('./models/rent');
var {Sale} = require('./models/sale');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port =process.env.PORT;

app.use(bodyParser.json());



// POST /users
app.post('/users', (req, res) => {
  var body=req.body;
  // var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);
  var number=req.body.number;
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header({'x-auth': token,'access-control-allow-origin':'*'}).send(user);   
     request('http://my.msgwow.com/api/sendhttp.php?authkey=167615AwjIgOJQN0597d7330&mobiles=91'+number+'&message=Welcome to Tolet App you have been signed up successfully, Now you can use our app to book properties&sender=iTOLET&route=4&country=0', function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
    });
    request('http://my.msgwow.com/api/sendhttp.php?authkey=167615AwjIgOJQN0597d7330&mobiles=918019690630,917416326145&message=A New user has just signedup into the application&sender=iTOLET&route=4&country=0', function (error, response, body) {
      console.log('error:', error); // Print the error if one occurred
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
    });
    // res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

app.get('/users/me', authenticate, (req, res) => {
  res.header('access-control-allow-origin','*').send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header({'x-auth': token,'access-control-allow-origin':'*'}).send(user); 
      request('http://my.msgwow.com/api/sendhttp.php?authkey=167615AwjIgOJQN0597d7330&mobiles=918019690630,917416326145&message=A New user has just logged into the application&sender=iTOLET&route=4&country=0', function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print the HTML for the Google homepage.
      });  
      
    });
  }).catch((e) => {
    res.status(400).send();
  });
});

app.post('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token
  ).then(() => {
    res.header('access-control-allow-origin','*').status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});


// app.post('/users/forgot',(req,res)=>{
//   var numb=req.body.number;
//   User.findOne({numb}).then((user) => {
//     if (!user) {
//       return res.status(401).send();
//     }
//     else{
//       let totp = jsotp.TOTP('BASE32ENCODEDSECRET');
//       totp.now();//otp generation
//       //fillup code after buying msg api
        
//     }
// })
// });
app.post('/users/salead',(req,res)=>{
  var body=req.body;
  var sale =new Sale(body);
  sale.save().then(()=>{
  res.status(200).send();
  }).catch((e)=>{
    res.send(400).send(e);

  });
});
app.post('/users/rentad',(req,res)=>{
  var body=req.body;
  var number=req.body.phonenumber;
  var rent =new Rent(body);
  rent.save().then(()=>{
  res.status(200).send();
  request('http://my.msgwow.com/api/sendhttp.php?authkey=167615AwjIgOJQN0597d7330&mobiles=91'+number+'&message=Congratulations your property has been successfully posted in TOLET App&sender=iTOLET&route=4&country=0', function (error, response, body) {
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
  });
  }).catch((e)=>{
    res.send(400).send(e);

  });
});
app.get('/users/rentdata',(req,res)=>
{
  // Rent.returnAllData().then((data)=>{
  //   res.status(200).send(data);

  // }).catch((e)=>{
  //   res.send(400).send(e);
  // });
  Rent.find().then((data)=>{
    // var datas=_.pick(data,['type']);
    // var body = _.pick(data, ['address']);
  res.status(200).send(JSON.stringify(data,undefined,2))
  }).catch((e)=>{
    res.status(400).send(e);
  });
});
app.get('/users/saledata',(req,res)=>{
  Sale.find().then((data)=>{
    res.status(200).send(JSON.stringify(data,undefined,2))
  }).catch((e)=>{

res.status(400).send(e);
  });
});
app.get('/users/rentid/:id',(req,res)=>{
  var id=req.params.id;
  // if (!ObjectID.isValid(id)) {
  //   return res.status(404).send();
  // }

  Rent.findById(id).then((data) => {
    if (!data) {
      return res.status(404).send();
    }

    res.status(200).send({data});
  }).catch((e) => {
    res.status(400).send();
  });
});

module.exports = {app};
