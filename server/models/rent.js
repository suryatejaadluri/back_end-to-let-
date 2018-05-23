var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var rentSchema = new Schema({
  name:String,
  address:  String,
  location: [{
    longitude: Number,
    lattitude: Number
  }],
  phonenumber: String,
  bhk:   String,
  description:String,
  date: String,
  sqft:String,
  price:String,
  type:String,
  pictures:[
      {
          picture1:String,
          picture2:String,
          picture3:String
      }
  ]

});

rentSchema.statics.returnAllData = function () {
  var Rent = this;

  Rent.find().then((data) => { 
     return JSON.stringify(data,undefined,2);
    });
};

var Rent = mongoose.model('Rent', rentSchema);

    
module.exports = {Rent};
