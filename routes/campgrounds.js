var express = require("express");
var router  = express.Router(); //route handler, middleware
var Campground = require("../models/campground");

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds:allCampgrounds});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var author =
    {
      id: req.user._id,
      username: req.user.username
    };
    var newCampground = {name: name, image: image, description: desc, author:author}
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            req.flash("success", "Campground has been posted to the site.")
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", isLoggedIn, function(req, res){
   res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            //console.log(foundCampground)
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});


router.get("/:id/edit",  checkowner, function(req, res)
{
     Campground.findById(req.params.id, function(err, foundCampground)
     {
         res.render('campgrounds/edit', {campground: foundCampground});
     });
});

router.put("/:id",checkowner, function(req, res)
{
  var data = req.body.campground;
  Campground.findByIdAndUpdate(req.params.id, data, function(err, updated)
  {
    if(err){console.log(err)}
    else
    {
    req.flash("success", "Your Campground has been edited")
    res.redirect('/campgrounds/'+ req.params.id)  ;
    }
  });
})

router.delete("/:id", checkowner,function(req, res)
{
   Campground.findByIdAndRemove(req.params.id, function(err)
 {
   if(err)
   {
     console.log(err);
     res.redirect('/campgrounds');
   }
   else
     {
       req.flash("success", "Your Campground has been removed");
       res.redirect('/campgrounds');
     }
 });
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to login in order to do that");
    res.redirect("/login");
}

function checkowner(req, res, next)
{
   if(req.isAuthenticated())
     {
      Campground.findById(req.params.id, function(err, foundCampground)
       {
         if(err){  res.redirect('back');}
         else
           {
                if(foundCampground.author.id.equals(req.user._id))
               {
                next();
               }
                else
                {
                req.flash("error", "You do not have permission to do so.");
                res.redirect('back');
                }

           }
       });
     }

  else
  {
    req.flash("error", "Sign in first.")
   res.redirect('back');
  }
}

module.exports = router;
