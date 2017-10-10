var mongoose = require('mongoose');
var express = require('express');

// express router // used to define routes 

var productRouter  = express.Router();

var productModel = mongoose.model('Product');

var responseGenerator = require('./../../libs/responseGenerator');

var allProducts=[];


module.exports.controllerFunction = function(app) {

    productRouter.get('/',function(req,res){
            
        res.render('productmenu');

    });//end get login screen




    productRouter.get('/viewAll/screen',function(req,res){
            
        res.render('viewAll');

    });//end get signup screen



    productRouter.get('/createproduct/screen',function(req,res){
            
        res.render('createproduct');

    });

    productRouter.get('/editproduct/:productId/screen',function(req,res){

    productModel.findById({'_id':req.params.productId},function(err,result)
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
      
      res.render('edit',{product : result});
    }
  });               
        

    });


    productRouter.post('/createproduct',function(req,res){

        if(req.body.productName!=undefined && req.body.productCategories.length>0 && req.body.productCost!=undefined && req.body.manufacturer!=undefined && req.body.codAvailable!= undefined && req.body.productDetails!=undefined && req.body.availability!=undefined)
        {

            var newProduct = new productModel({
                productName         : req.body.productName,
                manufacturer        : req.body.manufacturer,
                productDetails      : req.body.productDetails,
                productCost         : req.body.productCost,
                availability        : req.body.availability,
                codAvailable        : req.body.codAvailable

            });// end new user 

          var allCategories = (req.body.productCategories!=undefined && req.body.productCategories!=null)?req.body.productCategories.split(','):'';
          newProduct.productCategories = allCategories;

            newProduct.save(function(err){
                if(err){
                    var myResponse = responseGenerator.generate(true,"some error "+err,500,null);
                   //res.send(myResponse);
                   res.render('error', {
                     message: myResponse.message,
                     error: myResponse.data
                   });
                }
                else{

                  //var myResponse = responseGenerator.generate(false,"successfully signup user",200,newUser);
                  // res.send(myResponse);
                  
                
                  res.redirect('/product/viewAllProducts');


                }
            });

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
    });

 productRouter.get('/viewAllProducts',function(req,res)

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
      allProducts=allProducts.concat(result);
     // console.log(allProducts);
      res.render('viewproducts', { products: result});

    }
  });
});

  productRouter.get('/viewProduct/:productId',function(req,res){
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
      //console.log(result);
      res.render('viewproduct',{product : result});
    }
  });
});


    productRouter.post('/editProduct/:productId',function(req,res)
    {
      var update=req.body;

    productModel.findOneAndUpdate({'_id':req.params.productId},update,function(err,result)
      {
        if(err){
          console.log("Some error occured");
          res.send(err);
        }
        else{
          res.redirect('/product/viewAllProducts');
        }

    }); 

  });



productRouter.post('/deleteProduct/:productId',function(req,res)
{
  productModel.remove({'_id':req.params.productId},function(err,result)
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
       // console.log(result);
       //alert("Product created.");
        res.redirect('/product/viewAllProducts');
              
      }
    });
});
    // this should be the last line
    // now making it global to app using a middleware
    // think of this as naming your api 
    app.use('/product', productRouter);
 
}; //end contoller code
