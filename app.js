import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import ejs from "ejs";
import mongoose from 'mongoose';
// import encrypt from "mongoose-encryption";
import dotenv from "dotenv";
// import md5 from "md5";
// import bcrypt from "bcrypt";
dotenv.config();
import session from "express-session";
import passport from 'passport';
import passportLocalMongooose from 'passport-local-mongoose';


// const saltrounds = 10;
const __dirname = path.resolve();
const app = express();

app.use(session({
  secret: 'My little secret',
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/usersDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongooose);
// Automatically encrypts and decrypts
// const secret = process.env.SECRET;
// userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.get("/", (req, res)=>{
    res.render("home");
});

app.get("/login", (req, res)=>{
    res.render("login");
});


app.post("/login", (req, res)=>{

    const user = new User ({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, (err)=>{
        if(err){
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/secrets");
            });
        }
    });

});

app.get("/secrets", (req, res)=>{
    if (req.isAuthenticated()) {
        res.render("secrets");
    }
    else {
        res.redirect("/login");
    }
});


app.route("/register")

.get((req, res)=>{
    res.render("register");
})

.post((req, res)=>{

    User.register({username: req.body.username}, req.body.password, (err, user)=>{
        if(err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/secrets");
            });
        }
    });
    
});


app.get("/logout", (req, res)=>{
    req.logout((err)=>{
        if(err)
            console.log(err);
    });
    res.redirect("/");
});



app.listen(3000, ()=>{
    console.log("The server is up and running at port 3000...");
});