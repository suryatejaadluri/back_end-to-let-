const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true, //unique email should be specified.
    validate: {
      validator: validator.isEmail,//email validation.
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6 //password vallidtion
  },
  phonenumber:{
    type: Number
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});
//this method trggers whhenever browswr performs toJson method we can change the functions performed when this method called
UserSchema.methods.toJSON = function () {
  var user = this;
  var userObject = user.toObject();
 
  return userObject;
};
//this is instinct method it is used to generate tokens
UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();
var obj1={access:access,token:token};
  user.tokens=obj1;//modifying tokens with generated token value.
//returning user.save() call i.e., returning the promise itself. we can then trigger the then() call in server.js.
  return user.save().then(() => {
    return token;
  });
};
//this is used when user logouts
UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
};
//this is a model method , it is used to finduser by token ,it is used to do any routes private the authentication code that
//is associated with this is there in authencticate.js
UserSchema.statics.findByToken = function (token) {
  var User = this;//we dont use arrow functions here coz we need to use of this variable.
  var decoded;

  try {
    decoded = jwt.verify(token, 'abc123');
  } catch (e) {//if this catch block is called we dont need to call findone so promise.reject is used here.
    return Promise.reject();//this line is a shortcut for creating promise and then rejecting.
  }
//findone is a mongoose quereying method
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });
};
//this is used for user login.
UserSchema.statics.findByCredentials = function (email, password) {
  var User = this;

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject();
    }
//created new promise becoz bcrypt doesn't support promises, so used bcrypt inside promise.
    return new Promise((resolve, reject) => {
      // Use bcrypt.compare to compare password and user.password
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          resolve(user);
        } else {
          reject();
        }
      });
    });
  });
};
//mongoosemiddleware(pre)is used here to save encrypted hased passwords to database before save event happens.
//user.isModified method is used to trigger the functionlity only when password is changed.
UserSchema.pre('save', function (next) {
  var user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model('User', UserSchema);

module.exports = {User}
