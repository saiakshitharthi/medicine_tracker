var express
    = require('express'),
    session
        = require('express-session'),
    bodyParser
        = require('body-parser'),
    mongoose
        = require('mongoose'),
    passport
        = require('passport'),
    LocalStrategy
        = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose'),
    app
        = express(),
    flash = require('connect-flash'),
    nodemailer = require('nodemailer');


app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'))
mongoose.connect('mongodb://localhost:27017/medicine_tracker_01');
app.use(session({
    secret: 'whatever you want',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function (req, res, next) {
    res.locals.currentuser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});
var User = require('./models/user');
var Medicine = require('./models/medicine');
var Otherdetails = require('./models/otherdetails');
const otherdetails = require('./models/otherdetails');
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'asaiakshith03@gmail.com',
        pass: 'fhpcvpluyrrdwdhg'
    }
});

async function SendEmail(medicine){
    var today = await new Date();
    var timehours = await today.getHours();
    var timeminutes = await today.getMinutes();
    
    var userid = await medicine.user;

    var user = await User.findOne({_id : userid});
    var details = await Otherdetails.findOne({user: userid});
    
    for(let i = 0;i< medicine.remindertimeStamps.length;i++){
        let curtime = medicine.remindertimeStamps[i];
        let hrs = curtime.slice(0,2);
        let mins = curtime.slice(3);
        if(details.emailsent == true){
            continue;
        }
        if(hrs == timehours && mins == timeminutes){
            var mailOptions = {
                from: 'asaiakshith03@gmail.com',
                to: details.email,
                
            };
            mailOptions.subject = 'Reminder, please take your ' + medicine.medicineName ;
            mailOptions.text = 'Hello!, Mr/Ms.' + user.username + '\n';
            mailOptions.text+=('Please take your medicine,' + medicine.medicineName+'.\n'+ 'This is for your kind information\n');
            mailOptions.text+=('Regards,\nArthi Sai Akshith.');
            await transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            await details.updateOne({emailsent:true});
                

            
        }
        else{
            await details.updateOne({emailsent:false});
        }
        
    }

    
}

async function sendmessagestoall(){
    var medicines = await Medicine.find({});
    console.log(medicines); 
    for(let i = 0;i<medicines.length;i++){
        console.log(medicines[i]);
        SendEmail(medicines[i]);
    }


}
setInterval(sendmessagestoall, 10000);

app.get("/", (req, res) => {
    res.render('home');
});
app.get("/secret", (req, res) => {
    res.render('secret');

});
app.get("/register", (req, res) => {
    if (req.isAuthenticated()) {
        req.flash('error', 'You are already using, you need to logout');
        res.redirect('/logout');
    }
    else {
        res.render('register');
    }
});
app.post("/register", (req, res) => {


    if (req.isAuthenticated()) {
        req.flash('error', 'You are already using, you need to logout');
        res.redirect('/register');
    }
    else {
        User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
            }
            else {
                req.flash('success', 'Finally done!');
                req.login(user, (err)=>{
                    if(err){
                        console.log(err);
                        res.redirect('/login');
                    }
                    else{
                        res.redirect('/otherdetails');
                    }
                });
            }
        });
    }

});
app.get('/userpage',async (req,res)=>{
    if(!req.isAuthenticated()){
        res.redirect('/login');
    }
    else{
        const presentuser = await req.user;
        
        var PresentUserDetails = await Otherdetails.findOne({ user: req.user._id });
        console.log(PresentUserDetails['email']);
        console.log(PresentUserDetails);
        res.render('userpage', {presentuser:presentuser, PUD: PresentUserDetails} );
    }
})
app.get("/otherdetails", (req, res)=>{
    if(!req.isAuthenticated()){
        req.flash('error', 'You need to login to fill otherdetails');
        res.redirect('/login');
    }
    else{
        res.render('otherdetails');
    }
});
app.post('/otherdetails',async (req,res)=>{
    if(!req.isAuthenticated()){
        req.flash('error', 'You need to login to fill otherdetails');
        res.redirect('/login');
    }
    else{
        
        var tempotherdetails = await new Otherdetails({
            phonenumber: req.body.phonenumber,
            email: req.body.email,
            user : req.user._id
        });
        
        await tempotherdetails.save();
        res.redirect('/medicinelist');
    }
})
app.get("/login", (req, res) => {
    res.render('login');
});
app.post('/login', passport.authenticate('local', {
    successRedirect: '/medicinelist',
    failureRedirect: '/login'
}));
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect('/');
});

//medicine functions
app.get("/addmedicine", (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'please login first');
        res.redirect('/login');
    }
    else {
        res.render('addmedicine');
    }
});
var numvals;
var newmed;
app.post("/addmedicine", async (req, res) => {

    if (!req.isAuthenticated()) {
        req.flash('error', 'please login first');
        res.redirect('/login');
    }
    else {
        numvals = await req.body.numofts;
        newmed = await new Medicine({
            medicineName: req.body.medicinename,
            user: req.user._id
        });

        res.redirect('/addmedicinetemp');
    }
});
app.get('/addmedicinetemp', async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'please login first');
        res.redirect('/login');
    }
    else {
        res.render('addmedicinetemp', { numvals: numvals });
    }
});
app.post('/addmedicinetemp', async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'please login first');
        res.redirect('/login');
    }
    else {
        await console.log(req.body);
        for (let i = 0; i < numvals; i++) {
            console.log(req.body[i]);
            newmed.remindertimeStamps.push(req.body[i]);
        }
    }
    await newmed.save(function (err, medicine) {
        if (err) {
            console.log(err);
        }
        else {
            console.log(medicine);
        }
    });
    res.redirect('/medicinelist');

});
app.get('/medicinelist', async (req, res) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'please login first');
        res.redirect('/login');
    }
    else {
        var medicinelist = await Medicine.find({ user: req.user._id });
        res.render('medicinelist', { medicinelist: medicinelist });

    }

});
app.listen(3000, () => {
    console.log("Function running in port 3000");
});