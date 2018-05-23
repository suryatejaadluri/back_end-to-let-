var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var saleSchema = new Schema({
  address:  String,
  location: [{
    longitude: Number,
    lattitude: Number
  }],
  phonenumber: String,
  size: String,
  description:String,
  date: { type: Date, default: Date.now },
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
var Sale = mongoose.model('Sale', saleSchema);
// var sale=new Sale({address:"djnejfnejlfa",
// location:[{
//     longitude:12.3558456,
//     lattitude:32.6584459}],
// phonenumber:"8019690630",
// size:"3bhk",
// sqft:"3200sqft",
// type:"villa",
// price:"100L",
// pictures:[{picture1:"img/user1/1.img",picture2:"img/user1/2.image",picture3:"img/user1/3.image"}],
// description:"shuhdusejdfbuisefjkkjfbuisbfkjesjkf"});

// console.log(sale);
module.exports = {Sale};
