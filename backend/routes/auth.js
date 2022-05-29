const router = require("express").Router();
const passport = require("passport");

// Sucess/Erorr Routes
router.get("/sucess", (req, res) => {
  res.redirect("http://localhost:3000");
});

router.get("/error", (req, res) => {
  res.status(400)
});

// Google Auth Routes
router.get("/google", function (req, res, next) {
    req.session.callbackURL = req.query.callbackURL;
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//router.get('/google',passport.authenticate('google', { scope: ['profile','email'] }))
router.get('/google/redirect', passport.authenticate('google', { failureRedirect: '/auth/error', failureFlash: true }),
    function(req, res) {
        var url = req.session.callbackURL;
        res.redirect(url);
    }
);

// router.get(
//   "/google/redirect",
//   passport.authenticate("google", {
//     successRedirect: "/auth/sucess",
//     failureRedirect: "/auth/error",
//     failureFlash: true,
//   })
// );

// Logout User
router.get("/logout", (req, res) => {
  req.logOut();
  req.session = null;
  var url = req.query.callbackURL;
  res.redirect(url);
});

// Exporting All Routes
module.exports = router;
