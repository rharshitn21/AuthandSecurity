import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import ejs from "ejs";
import mongoose from 'mongoose';
import encrypt from "mongoose-encryption";
import dotenv from "dotenv";
dotenv.config();

const __dirname = path.resolve();
const app = express();

mongoose.connect("mongodb://localhost:27017/usersDB");

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
// Automatically encrypts and decrypts
const secret = process.env.SECRET;
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});

const User = mongoose.model("User", userSchema);



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
    User.findOne({email: req.body.username}, (err, foundUser)=>{
        if(foundUser) {
            if(foundUser.password === req.body.password) {
                console.log("User logged in");
                res.render("secrets");
            }
            else {
                console.log("Incorrect Username or Password");
                res.redirect("/login");
            }
        }
        else {
            console.log("Incorrect Username or Password");
            res.redirect("/login");
        }

    });
});


app.route("/register")

.get((req, res)=>{
    res.render("register");
})

.post((req, res)=>{
    const user = new User({
        email: req.body.username,
        password: req.body.password
    });

    user.save((err)=>{
        if(err)
            console.log(err);
        else
            res.render("secrets");
    });
});






app.listen(3000, ()=>{
    console.log("The server is up and running at port 3000...");
});