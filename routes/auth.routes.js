const express = require('express');
const router = express.Router();

const passport = require("passport");
const ensureLogin = require("connect-ensure-login");

const User = require("../models/User.model.js");

const bcrypt = require("bcrypt");
const bcryptSalt = 10;

const checkBoss  = checkRoles('BOSS');

// add routes here


router.get("/signup", (req, res, next) => {
    res.render("auth/signup");
  });

  router.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role;

  console.log(username);
  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username })
  .then(user => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username:username,
      password: hashPass,
      role:role
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup", { message: "Something went wrong" });
      } else {
        res.redirect("/");
      }
    });
  })
  .catch(error => {
    next(error)
  })
});

router.get("/login", (req, res, next) => {
    res.render("auth/login", { "message": req.flash("error") });
  
  });

  router.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    passReqToCallback: true
  }));

  router.get('/private', checkBoss, (req, res) => {
    User.find({'role':['TA','DEV']})
    .then(allTheDevsFromDB => {
      // console.log('Retrieved books from DB:', allTheBooksFromDB);
      console.log(allTheDevsFromDB);
      res.render('private', { devs: allTheDevsFromDB });
    })
    .catch(error => {
      console.log('Error while getting the books from the DB: ', error);
    })

    
  });

  router.get('/delete/:userId', checkBoss, (req, res) => {
    User.deleteOne({ _id: req.params.userId})
    .then(result => {
        console.log("successful termination");
        res.redirect('/private');
})
    .catch(err=> console.log("still living",err));

    
  });


  router.get('/edit/:userId',checkBoss , (req, res) => {
    const { role } = req.query;
    User.update({_id: req.params.userId}, { $set: {role}})
  .then((user) => {
    res.redirect('/private');
  })
  .catch((error) => {
    console.log(error);
  })

    
  });

  router.get('/profile',ensureAuthenticated , (req, res) => {
    User.find()
    .then(allUsers =>{
        res.render('profile',{users:allUsers})
    })
    .catch(error => {
        console.log('Error while getting the users from the DB: ', error);
      })

    
  });

  router.get('/profile/:userId', ensureAuthenticated,(req,res)=>{
      User.findOne({'_id':req.params.userId})
      .then(user =>{
        res.render('profile-page',{user:user})
      })
      .catch(error => {
        console.log('Error while getting the books from the DB: ', error);
      })
  })

  router.get('/home-profile', ensureAuthenticated, (req, res) => {
    res.render('home-profile', {user: req.user});
  });

  



  router.get('/home-profile/edit/:userId', ensureAuthenticated, (req, res) => {
    const { username } = req.query;
    User.update({_id: req.params.userId}, { $set: {username}})
  .then((user) => {
    res.redirect('/home-profile');
  })
  .catch((error) => {
    console.log(error);
  })
  });

  router.get('/home-profile/edit', ensureAuthenticated, (req, res) => {
    res.render('edit-profile', {user: req.user});
  });
  

  function checkRoles(role) {
    return function(req, res, next) {
      if (req.isAuthenticated() && req.user.role === role) {
        return next();
      } else {
        res.redirect('/login')
      }
    }
  }

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/login')
    }
  }

  router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/login");
  });


module.exports = router;
