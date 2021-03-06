var express = require("express");
var router  = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");

//Comments New
router.get("/new", isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
             res.render("comments/new", {campground: campground});
        }
    })
});

//Comments Create
router.post("/",isLoggedIn,function(req, res){
   //lookup campground using ID
   Campground.findById(req.params.id, function(err, campground){
       if(err){
           console.log(err);
           res.redirect("/campgrounds");
       } else {
        Comment.create(req.body.comment, function(err, comment){
           if(err){
               console.log(err);
           } else {
               comment.author.id= req.user._id;
               comment.author.username = req.user.username;
               comment.save();
               campground.comments.push(comment);
               campground.save();
               req.flash("success", "Your Comment has been created")  
               res.redirect('/campgrounds/' + campground._id);
           }
        });
       }
   });
});

router.get('/:comment_id/edit', checkowner, function(req, res)
 {
   Comment.findById(req.params.comment_id, function(err, foundComment)
    {
      if(err){res.redirect('back')}
      else
      {
        res.render('comments/edit',{campground_id: req.params.id, comment: foundComment})
      }
    });
 });

 router.put('/:comment_id', checkowner, function(req, res)
 {
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment)
    {
      if(err){res.redirect('back')}
      else
      {
        req.flash("success", "Your Comment has been edited")
       res.redirect('/campgrounds/' + req.params.id)
      }
    });
 });

 router.delete("/:comment_id", checkowner,function(req, res)
 {
    Comment.findByIdAndRemove(req.params.comment_id, function(err)
  {
    if(err)
    {
      console.log(err);
      res.redirect('/campgrounds/' + req.params.id);
    }
    else {
      {
        req.flash("success", "Your Comment has been removed")
        res.redirect('/campgrounds/' + req.params.id);
      }
    }
  });
 });

//middleware
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
      Comment.findById(req.params.comment_id, function(err, foundComment)
       {
         if(err){  res.redirect('back');}
         else
           {
                if(foundComment.author.id.equals(req.user._id))
               {
                next();
               }
                else
                {
                req.flash("error", "You do not have permission to do so")
                res.redirect('back');
                }

           }
       });
     }

  else
  {
   res.redirect('back');
  }
}


module.exports = router;
