const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(session({
  secret: "Bank details.",
  resave: false,
  saveUninitialized: false
}));

mongoose.connect("mongodb+srv://yash-123:123@cluster0.kagdd.mongodb.net/bankDB", { useNewUrlParser: true });
mongoose.set("useCreateIndex", true);

const details = new mongoose.Schema({
  fname: String,
  lname: String,
  number: Number,
  email: String,
  addr: String,
  zip: Number,
  accno: Number,
  branch: String,
  balance: Number
});

const trans = new mongoose.Schema({
  sid: Number,
  rid: Number,
  money: Number
});

const Userdata = new mongoose.model("Userdata", details);

const Usertrans = new mongoose.model("Usertrans", trans);

app.get("/", function (req, res) {
  Userdata.find({}, function (err, founddata) {
    res.render("home", { newdata: founddata });
  });
});

app.get("/add", function (req, res) {
  res.render("add");
});

app.get("/pay", function (req, res) {
  res.render("pay");
});

app.get("/transaction", function (req, res) {
  Usertrans.find({}, function (err, founddata) {
    res.render("transaction", { newdata: founddata });
  });
});

app.post("/add", function (req, res) {
  const data = new Userdata({
    fname: req.body.fname,
    lname: req.body.lname,
    number: req.body.num,
    email: req.body.mail,
    addr: req.body.addr,
    zip: req.body.zip,
    accno: req.body.accnum,
    branch: req.body.branch,
    balance: req.body.balance
  });
  data.save(function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
})

app.get("/:num", function (req, res) {
  var n1 = req.params.num;
  Userdata.findOne({ accno: n1 }, function (err, foundacc) {

    if (!err) {
      if (foundacc) {
        res.render("acc", { newacc: foundacc });
      }
      else {
        console.log("Not found");
      }
    }
  });
});

app.post("/pay", function (req, res) {
  const datatrans = new Usertrans({
    sid: req.body.sid,
    rid: req.body.rid,
    money: req.body.rs
  });
  datatrans.save(function (err) {
    if (!err) {
      Userdata.find({$or:[{accno: datatrans.sid}, {accno:datatrans.rid}]}, function (err, found) {
        if (!err) {
          if (found) {
            if(found[0].accno==datatrans.sid)
            {
              found[0].balance = found[0].balance - datatrans.money;
              found[1].balance = found[1].balance + datatrans.money;
            }
            else
            {
              found[0].balance = found[0].balance + datatrans.money;
              found[1].balance = found[1].balance - datatrans.money;
            }
            found[0].save();
            found[1].save();
            res.redirect("/");
          }
          else {
            console.log("Not found");
          }
        }
        else {
          console.log(err);
        }
      });
    }
    else {
      console.log(err);
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started");
});