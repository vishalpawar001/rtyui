const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();



mongoose.connect("mongodb://localhost:27017/priceData");
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

//global variables 
var package_no = 1002;  
var currentUname;


// mongoose schema's 
const packageSchema = new mongoose.Schema({
    packageID: Number,
    place: String,
    description: String,
    noOfDays: Number,
    stayAmt: Number,
    foodAmt: Number,
    busAmt: Number,
    trainAmt: Number,
    planeAmt: Number,
    imageName : String
})

const userSchema = new mongoose.Schema({
    packID: String,
    userId: String,
    persons: Number,
    travel: String,
    food: Number,
    noOfDays: Number,
    date: String,
})

const loginSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    age: Number,
    username: String,
    password: String
})

const paymentSchema = new mongoose.Schema({
    payPackId: Number,
    payUserId: String,
    payPlace: String,
    payAmount: Number,
    payPerson: Number,
    payDays: Number,
    date: String,
    travel: Number,
    food: Number,
    stay: Number,
    total: Number
})


// mongoose constants

const userOpt = new mongoose.model("useropt", userSchema);
const allPackages = new mongoose.model("tour", packageSchema);
const loginCred = new mongoose.model("login", loginSchema);
const payment = new mongoose.model("payment", paymentSchema);

// default packages

var firstPackage = new allPackages({
    packageID: 1001,
    place: "Shimala-Manali",
    description: "Explore the wonders of Himachal with our best-selling itinerary.",
    noOfDays: 5,
    stayAmt: 2000,
    foodAmt: 1500,
    busAmt: 1000,
    trainAmt: 800,
    planeAmt: 4000,
    imageName:"kashmir.webp"

})

var secondPackage = new allPackages({
    packageID: 1002,
    place: "Kashmir",
    description: "6N Kashmir Holiday with Houseboat Stay - Free Cancellation",
    stayAmt: 3000,
    noOfDays: 3,
    foodAmt: 1500,
    busAmt: 1000,
    trainAmt: 800,
    planeAmt: 4000,
    imageName:"1640892858019manali.webp"

})


var login1 = new loginCred({
    firstName: "vishal",
    lastName: "pawar",
    age: 20,
    username: "vishal17",
    password: "vishal123"
})


loginCred.find({ username: "vishal17" }, function (err, docs) {
    if (err) {
        console.log(err);
    } else {
        if (docs.length == 0) {
            login1.save();
        }
    }
})

allPackages.find({ packageID: { $gt: 0 } }, function (err, docs) {
    if (err) {
        console.log(err);
    }
    else {
        if (docs.length === 0) {
            firstPackage.save();
            secondPackage.save();
        }
    }
});

// multer storage 

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + file.originalname)
    } 
})
var upload = multer({ storage: storage })

app.use('/uploads', express.static('uploads'));


// home get and post route

app.get("/", function (req, res) {
    res.render("login");
})



  

app.post("/", function (req, res) {
    let uName = req.body.userName;
    let pWord = req.body.passWord;
    loginCred.find({ username: uName }, function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            if (docs.length == 0) {
                res.render("error2", { err_msg: "acc not found" });
            } else {

                if (docs[0].password == pWord) {
                    currentUname = docs[0].username;
                    res.redirect("/display");
                } else {
                    res.render("error2", { err_msg: "wrong password" });
                }
            }
        }
    })
})

//create account route

app.get("/createAccount", function (req, res) {
    res.render("createAccount");
})

app.post("/createAccount", function (req, res) {
    let uName = req.body.userName;

    loginCred.find({}, function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < docs.length; i++) {
                if (docs[i].username == uName) {
                    res.render("error1");
                    break;
                } else {
                    if (i == docs.length - 1) {
                        var newAcc = new loginCred({
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            age: req.body.age,
                            username: req.body.userName,
                            password: req.body.passWord
                        })
                        newAcc.save();
                        res.render("accSuccess");
                    }
                }
            }
        }
    })
})


// home page display

app.get("/display", function (req, res) {
    allPackages.find({ packageID: { $gt: 0 } }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("home", {
                arr: docs
            });
        }
    });
})


// cart 

app.get("/cart", function (req, res) {
    userOpt.find({ userId: currentUname }, function (err, docs1) {
        if (err) {
            console.log(err);
        } else {
            allPackages.find({}, function (err, docs2) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("cart", { array1: docs2, array2: docs1 });
                }
            })
        }
    })
})

// compose route



app.get("/posts/:postID", function (req, res) {

    var packid = req.params.postID;
    allPackages.find({ packageID: { $gt: 0 } }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("post", { arr: docs, pid: packid })
        }
    });


})

app.post("/post", function (req, res) {
    var packID = req.body.packId;
    let travel = req.body.travel;
    let food = req.body.food;
    let persons = req.body.persons;
    let date = req.body.date;

    var newUser = new userOpt({
        packID: packID,
        userId: currentUname,
        persons: persons,
        travel: travel,
        food: food,
        date: date
    })
    newUser.save(() => {
        doSomething();
    });

    function doSomething() {
        userOpt.find({ userId: currentUname }, function (err, docs1) {
            if (err) {
                console.log(err);
            } else {
                allPackages.find({}, function (err, docs2) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("cart", { array1: docs2, array2: docs1 });
                    }
                })
            }
        })
    }


})

app.post("/delete_from_cart", function (req, res) {

    let id = req.body.id;

    userOpt.find({ _id: id }).deleteOne(function (err) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/cart");
        }
    });
})



app.post("/compose", upload.single('packImg'), function (req, res, next) {

    let packageeeID = req.body.packageID;
    let place = req.body.place;
    let description = req.body.description;
    let noOfDays = req.body.noOfDays;
    let stayAmt = req.body.stayAmt;
    let foodAmt = req.body.foodAmt;
    let busAmt = req.body.busAmt;
    let trainAmt = req.body.trainAmt;
    let planeAmt = req.body.planeAmt;
    let imageName = req.file.filename;

    // checks weather package with same id is present 
    //  if presents shows error page otherwise redirects to root route

    allPackages.find({}, function (err, docs) {
        if (err) {
            console.log(err);
        }
        else {
            const newTable = new allPackages({
                packageID: packageeeID,
                place: place,
                description: description,
                noOfDays: noOfDays,
                stayAmt: stayAmt,
                foodAmt: foodAmt,
                busAmt: busAmt,
                trainAmt: trainAmt,
                planeAmt: planeAmt,
                imageName : imageName

            })

            newTable.save();
            res.redirect("/adminDisplay");
        }
    });
})


// payment route

app.post("/payment", function (req, res) {

    let payPackId = req.body.payPackId;
    let payUserId = req.body.payUserId;
    let payPlace = req.body.payPlace;
    let payAmount = req.body.payAmount;
    let payPerson = req.body.payPerson;
    let payDays = req.body.payDays;
    let date = req.body.date;
    let travel = req.body.travel;
    let food = req.body.food;
    let stay = req.body.stay;
    let total = req.body.total;


    res.render("payment", {
        payPackId: payPackId,
        payUserId: payUserId,
        payPlace: payPlace,
        payAmount: payAmount,
        payPerson: payPerson,
        payDays: payDays,
        date: date,
        travel: travel,
        food: food,
        stay: stay,
        total: total
    })

})




app.post("/payment_success", function (req, res) {
    let payPackId = req.body.payPackId;
    let payUserId = req.body.payUserId;
    let payPlace = req.body.payPlace;
    let payAmount = req.body.payAmount;
    let payPerson = req.body.payPerson;
    let payDays = req.body.payDays;
    let date = req.body.date;
    let travel = req.body.travel;
    let food = req.body.food;
    let stay = req.body.stay;
    let total = req.body.total;


    var payObj = new payment({
        payPackId: payPackId,
        payUserId:payUserId,
        payPlace: payPlace,
        payAmount: payAmount,
        payPerson: payPerson,
        payDays: payDays,
        date: date,
        travel: travel,
        food: food,
        stay: stay,
        total: total
    })
    payObj.save();

    payObj.save(() => {
        payment.find({}, function (err, docs) {
            if (err) {
                console.log(err);
            } else {
                res.render("payment_success", {
                    payPackId: payPackId,
                    payUserId:payUserId,
                    payPlace: payPlace,
                    payAmount: payAmount,
                    payPerson: payPerson,
                    payDays: payDays,
                    date: date,
                    travel: travel,
                    food: food,
                    stay: stay,
                    total: total

                });

            }
        })
    });
})




app.get("/posts/:infoID/info", function (req, res) {
    let infoID = req.params.infoID;

    res.render("info", { iit: infoID });

})

// admin routes here

// login route

app.get("/adminLogin", function (req, res) {
    res.render("admin_login");
})

app.post("/adminLogin", function (req, res) {
    let auName = req.body.adminUname;
    let apWord = req.body.adminPword;

    if (auName == "vishal1707" && apWord == "vishal@4402") {
        res.render("adminHome",{ isadmin:true });
    } else {
        res.render("error2", { err_msg: "wrong username or password" });
    }

})



app.get("/compose", function (req, res) {
    package_no = package_no + 1;
    res.render("compose", { pack_no: package_no });
})



// delete post 

app.post("/deletePost", function (req, res) {
    let id = req.body.packId;
    allPackages.deleteOne({ packageID: id }, function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/adminDisplay")
        }
    });
})

// shows all packages (currently available to user) to admin 

app.get("/adminDisplay", function (req, res) {
    allPackages.find({ packageID: { $gt: 0 } }, function (err, docs) {
        if (err) {
            console.log(err);
        }
        else {
            res.render("adminPackages", {
                arr: docs
            });
        }
    });
})


// shows all packages booked by user 

app.get("/bookedPackages", function (req, res) {

    payment.find({}).sort("date").exec(function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.render("booked_Packages", { arr: docs })
        }
    })
})

app.post("/tour_complete", function(req,res){
    let id = req.body.ID;
    payment.deleteOne({ _id : id }, function (err, docs) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/bookedPackages")
        }
    });
})


app.listen(3000);