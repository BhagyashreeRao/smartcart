var mongoose = require('mongoose');

// declare schema object.
var Schema = mongoose.Schema;

var cartSchema = new Schema({
	userId  			: {type:String,default:'',required:true},
	products  			: [],
	
});
mongoose.model('Cart',cartSchema);