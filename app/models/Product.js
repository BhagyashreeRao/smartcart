
var mongoose = require('mongoose');
// declare schema object.

var Schema = mongoose.Schema;

var productSchema = new Schema({

	productName 		: {type:String,default:'',required:true},
	productCategories  	: [],
	manufacturer		: {type:String,default:''},
	productDetails	  	: {type:String,default:'',required:true},
	productCost  		: {type:Number,default:0,required:true},
	availability		: {type:Number,default:0},
	rating 				: {type:Number,min:0,max:5},
	codAvailable		: {type:Boolean}
});

mongoose.model('Product',productSchema);
