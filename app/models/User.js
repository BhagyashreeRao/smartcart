
var mongoose = require('mongoose');
// declare schema object.
var Schema = mongoose.Schema;

var userSchema = new Schema({

	
	firstName  			: {type:String,default:'',required:true},
	lastName  			: {type:String,default:'',required:true},
	email	  			: {type:String,default:'',required:true},
	mobileNumber  		: {type:Number,required:true},
	password			: {type:String,default:'',required:true},
	resetPasswordToken  : String,
    resetPasswordExpires: Date
	
});

mongoose.model('User',userSchema);