var mongoose = require('mongoose');
var express = require('express');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var async = require('async');
var crypto = require('crypto');


// express router // used to define routes 
var userRouter  = express.Router();
var userModel = mongoose.model('User');

var productModel = mongoose.model('Product');

var cartModel =mongoose.model('Cart');


var responseGenerator = require('./../../libs/responseGenerator');
var auth = require("./../../middlewares/auth");
var currentUser;
var isNewUser;
var cartProducts=[];
var count=1;


module.exports.controllerFunction = function(app) {
    userRouter.get('/',function(req,res){
            
        res.render('useraction');

    });//end get login screen


    userRouter.get('/login/screen',function(req,res){
            
        res.render('login');

    });//end get login screen

    userRouter.get('/signup/screen',function(req,res){
            
        res.render('signup');

    });//end get signup screen

    userRouter.get('/dashboard',auth.checkLogin,auth.setLoggedInUser,function(req,res)
    {  

  
      productModel.find(function(err,result)
      {
          if(err){
            var myResponse = responseGenerator.generate(true,"some error "+err,500,null);
                   //res.send(myResponse);
            res.render('error', {
            message: myResponse.message,
            error: myResponse.data
            });

            }
          else
            {  
            currentUser=req.user;
            res.render('dashboard', {user:req.user,products: result});
            }
      });

    });//end get dashboard*/

    userRouter.get('/logout',function(req,res){
      
      req.session.destroy(function(err) {

        res.redirect('/users/login/screen');

      });  

    });//end logout
    

    userRouter.get('/all',function(req,res){
        userModel.find({},function(err,allUsers){
            if(err){                
                res.send(err);
            }
            else{

                res.send(allUsers);

            }

        });//end user model find 

    });//end get all users


    userRouter.post('/signup',function(req,res){

        if(req.body.firstName!=undefined && req.body.lastName!=undefined && req.body.mobileNumber!=undefined && req.body.email!=undefined && req.body.password!=undefined){

            var newUser = new userModel({
                
                firstName           : req.body.firstName,
                lastName            : req.body.lastName,
                email               : req.body.email,
                mobileNumber        : req.body.mobileNumber,
                password            : req.body.password


            });// end new user 

            newUser.save(function(err){
                if(err){
                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });

              }
              else{

                    //var myResponse = responseGenerator.generate(false,"successfully signup user",200,newUser);
                   // res.send(myResponse);
                   console.log(newUser);
                   req.session.user = newUser;
                   delete req.session.user.password;                   
                   res.redirect('/users/dashboard');
                }
            });//end new user save
       }
        else{

            var myResponse = {
                error: true,
                message: "Some body parameter is missing",
                status: 403,
                data: null
            };

            //res.send(myResponse);

             res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
              });
        }
    });//end sign up


    userRouter.post('/login',function(req,res){

        userModel.findOne({$and:[{'email':req.body.email},{'password':req.body.password}]},function(err,foundUser){
            if(err){
                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                res.send(myResponse);
            }
            else if(foundUser==null || foundUser==undefined || foundUser.email==undefined){

                var myResponse = responseGenerator.generate(true,"user not found. Check your email and password",404,null);
                //res.send(myResponse);
                res.render('error', {
                  message: myResponse.message,
                  error: myResponse.data
                });

            }
            else{

                  req.session.user = foundUser;
                   delete req.session.user.password;
                  res.redirect('/users/dashboard');

              }
        });// end find

    });//end get login screen

    userRouter.get('/viewProduct/:productId',function(req,res)
    {
      productModel.findOne({'_id':req.params.productId},function(err,result)
    {
      if(err){
            var myResponse = responseGenerator.generate(true,"some error "+err,500,null);
                   //res.send(myResponse);
            res.render('error', {
            message: myResponse.message,
            error: myResponse.data
            });
          }
      else{
//      console.log(result);
      req.session.product=result;
      console.log(req.session.product);
      res.render('userproductview',{user:currentUser,product : result});
      }
    });
  });

     userRouter.post('/addtocart/:productId/:userId',function(req,res){
        
        cartModel.findOne({ userId : req.params.userId},function(err,userCart)
       {
 
          console.log(userCart);
          if(userCart){
            isNewUser=false;
            console.log(userCart);
            //userCart.productIds.push(req.params.productId);
            cartModel.update({"userId":req.params.userId},{ $push :{"products" : req.session.product}},function(err){
              if(err){
                var myResponse = responseGenerator.generate(true,"some error "+error,500,null);
                   //res.send(myResponse);
              res.render('error', {
              message: myResponse.message,
              error: myResponse.data
            });

              }
              else{
               //console.log(userCart.products);
               //console.log(req.session.product);
               //alert("Product added to cart.");
               req.flash('success', 'Productadded to cart.');
                res.redirect('/users/dashboard');  
              }
            } 
            );  
            }

          else{
            isNewUser=true;
            console.log(isNewUser);
            console.log(req.params.productId);
              var cartItem = new cartModel({
              userId : req.params.userId,


            });
            cartItem.products.push(req.session.product);        
              console.log(cartItem);
            cartItem.save(function(error){
            if(err){
            var myResponse = responseGenerator.generate(true,"some error "+error,500,null);
            
            res.render('error', {
              message: myResponse.message,
              error: myResponse.data
            });
            }
              else{

                 //var myResponse = responseGenerator.generate(false,"successfully signup user",200,newUser);
                 // res.send(myResponse);
                 //console.log(cartItem);
                 // console.log(cartItem.productId);
                 //alert("Product added to cart.");
                 req.flash('success', 'Product added to cart.');
                  res.redirect('/users/dashboard');
                }

            });
          }
        });
       });

 userRouter.get('/cart/:userId',function(req,res)
{   //var cartProducts=[];
    cartModel.findOne({"userId":req.params.userId},function(err,cartItem){
    if(err){
            var myResponse = responseGenerator.generate(true,"some error "+err,500,null);
                   //res.send(myResponse);
            res.render('error', {
            message: myResponse.message,
            error: myResponse.data
            });

        }
    else
    {  
      
    // console.log(cartItem.products);
    //  while(count==1){
          //console.log(cartProduct);
          //res.render("cartview",{products : cartProduct.productIds,user:currentUser});
          //cartProducts.push(cartProduct);  
          //console.log(cartItem.products);
          if(cartItem==undefined || cartItem==null)
          {
            var myResponse = responseGenerator.generate(true,"There are no products in cart",500,null);
                   //res.send(myResponse);
            res.render('error', {
            message: myResponse.message,
            error: myResponse.data
            });
          } 
          else{
          res.render("cartview",{products:cartItem.products,user:currentUser});  
          }                       
          //count++;
     //}
   }
  
    // res.render("cartview",{products:cartItem.products,user:currentUser});
      

  });

});
 userRouter.post('/deletefromcart/:productId/:userId',function(req,res)
{ 
  cartModel.findOneAndUpdate({userId:req.params.userId},{ $pull :{ products : {"_id":req.params.productId}}},function(err,result){
              if(err){
              var myResponse = responseGenerator.generate(true,"some error "+err,500,null);
                   //res.send(myResponse);
              res.render('error', {
              message: myResponse.message,
              error: myResponse.data
            });

              }
              else{
               console.log(result);
                //res.redirect('http://localhost:3000/users/dashboard');
                //alert("Product deleted from cart."); 
                req.flash('success', 'Item deleted from cart.');
               res.redirect('/users/cart/'+currentUser._id); 
              }
            } 
            );

});

userRouter.get('/forgot', function(req, res) {
  res.render('forgot', {
    user: req.user
  });
});


userRouter.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      userModel.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/users/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour



        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'GMAIL',
        auth: {
          type: 'OAuth2',
          user: '!!!YOUR GMAIL USERNAME!!!',
          pass: '!!!!YOUR GMAIL PASSWORD!!!'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@smartcart.com',
        subject: 'Password Reset',
        text: 'You are receiving this because you have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + 'users/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'

      };
      console.log("mail sent");
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/users/forgot');
  });
});

userRouter.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/forgot');
    }
    res.render('reset', {
      user: req.user
    });
  });
});

userRouter.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
          req.logIn(user, function(err) {
            done(err, user);
          });
        });
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'GMAIL',
        auth: {
          type: 'OAuth2'  
          user: '!!! YOUR GMAIL USERNAME !!!',
          pass: '!!! YOUR GMAIL PASSWORD !!!'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/users');
  });
});

    // this should be the last line
    // now making it global to app using a middleware
    // think of this as naming your api 
    app.use('/users', userRouter);
}; //end contoller code
