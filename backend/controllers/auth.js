const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

const User = require('../models/user')

passport.serializeUser((user, done) => {
    done(null, user)
})

passport.deserializeUser((user, done) => {
    done(null, user)
})

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/redirect'
        },
        async function (accessToken, refreshToken, profile, done) {
            // Get email from profile
            const email = profile.emails[0].value

            var user = {
                _id: null,
                email : email
            }
            var error = null

            await User.findOne({ email: email }).then(data => {
                if (data != null) {
                    user._id =  data._id
                }
            }).catch(err => {
                error = err
            })

            if (error != null) return done(error, user)

            // User does not exist => Create a new user
            if (user._id == null) {

                const user_md = new User({
                    email: email,
                    accessToken : accessToken,
                    refreshToken : refreshToken,
                });

                let savedUser = await user_md.save()
                user._id = savedUser._id
            }

            return done(null, user)
        })
)




