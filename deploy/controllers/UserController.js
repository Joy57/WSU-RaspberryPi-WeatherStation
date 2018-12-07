const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const knex = require('knex')(require('../knexfile'));
const async = require('async');
const nodemailer = require('nodemailer');
const moment = require('moment');


router.post('/create', async function(req, res){
    var username = req.body.username.toLowerCase();
    var email = req.body.email.toLowerCase();
    var username = req.body.username;
    var password = req.body.password;
    var confirmPass = req.body.confirmPass;
    var dbUsername = null;
    var dbEmail = null;
    
    //Checks if Username and Email already exist in the database
    var user = await User.where({username: username}).fetch()
    if(user)
        dbUsername = user.attributes.username.toLowerCase();

    var em = await User.where({email: email}).fetch()
    if(em)
        dbEmail = em.attributes.email.toLowerCase();
    
    //Verifies that all User Account credentials meet the string requirements
    req.checkBody('username','Username cannot be blank').notEmpty()
    if(username !== ''){
        req.checkBody('username','Username can only contain letters and numbers').not().matches(/\W/)
    }
    req.checkBody('username','Username already exists').not().equals(dbUsername);

    req.checkBody('email', 'Email cannot be blank').notEmpty()
    if(email !== ''){
        req.checkBody('email', 'Not a valid email').isEmail()
    }
    req.checkBody('email', 'Email already exists').not().equals(dbEmail);

    req.checkBody('password','Password must be 8 characters or longer').isLength({min: 8});
    req.checkBody('password','Password cannot contain symbols').not().matches(/\W/);
    req.checkBody('password', 'Password must have at least 1 letter and 1 number').matches(/\d/);
    req.checkBody('password', 'Passwords do not match').equals(confirmPass);


    //If one of the user inputs fails to meet the requirements it gets saved in errors
    var errors = req.validationErrors();
    if(errors){
        res.json({errors: errors, redirect: false});
    }
    else{
        var pendingId = await knex('permissions').select('permission_id').where('type', '=', 'Pending');
        pendingId = pendingId[0]["permission_id"];

        //hashes the password using bcrypt, then creates user and stores in database
        await bcrypt.hash(password, 10, function (err, hash) {
            new User({
                username: username,
                email: email,
                password: hash,
                permission_id: pendingId
            }).save()
        });
        var admins = await knex('users').select('users.email').from('users').where('users.permission_id', 1).orWhere('users.permission_id', 3);
        for(var i = 0; i < admins.length; i++){
           var adminEmail = admins[i]["email"];

            var transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            var mailOptions = {
                to: adminEmail,
                from: 'wstationtestdod@gmail.com',
                subject: 'Weather Station Account Request',
                text: 'You are receiving this message because you are able to accept or deny the approval of this account request.\n\n' +
                'Username: ' +username + '\n'+ 'Email: ' + email + '\n\n'+
                'Please click the following link to complete this process:\n\n'+
                req.protocol + '://' + req.get('host') + '/admin \n\n' +
                'After clicking the link go to the pending users tab on the Admin page and select Approve or Deny for the account.',
            };
            transporter.sendMail(mailOptions, function (err) {
                //Alert user email has been sent
                if (err) {
                    return console.log(err);
                }
            });

        }
        res.json({errors: [], redirect: true});
    }
});

//calls passport authentication on login
router.post('/login', async function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    var user = await User.where({username: username}).fetch();
    if(!user){
        return res.status(401).json({redirect: false, errors: [{msg: "Invalid Username/Password"}]})
    }
    
    var check = await bcrypt.compare(password, user.attributes.password);
    if(!check){
        return res.status(401).json({redirect: false, errors: [{msg: "Invalid Username/Password"}]})
    }

    var pendingId = await knex('permissions').select('permission_id').where('type', '=', 'Pending')
    pendingId = pendingId[0]["permission_id"];
    if (user.attributes.permission_id === pendingId){
        return res.status(401).json({redirect: false, errors: [{msg: "Invalid Username/Password"}]})
    }

    req.session.username = username;
    req.session.save();
    
    res.status(200).json({redirect: 'true', errors: []})
});

//used to verify user is logged in on each page
router.post('/getUserInfo', async function(req,res){
    if(req.session.username){
        var user = await knex('users').select('*')
        .leftJoin('permissions', 'users.permission_id', 'permissions.permission_id')
        .where('users.username', req.session.username)
        res.json(user);
    }
    else{
        res.json({username: undefined})
    }
});

router.get('/pendingUsers',async function (req,res) {
    var pendingId = await knex('permissions').select('permission_id').where('type', '=', 'Pending')
    pendingId = pendingId[0]["permission_id"];

    var pendingUsers = await knex('users')
        .select('username')
        .leftJoin('permissions', 'users.permission_id', 'permissions.permission_id')
        .where('users.permission_id', '=', pendingId)
    res.json({ pendingUsers });
})

router.get('/allUsers', async function(req,res){
    try{
        var users = await knex('users').select('*')
        .leftJoin('permissions', 'users.permission_id', 'permissions.permission_id')
    } catch(ex){
        return res.json({});
    }
    return res.json({ users });
});

router.put('/permissions', async function (req, res) {
    // Pass in the user and the permission you want to change that user to
    var username = req.body.username;
    var permissisionId = await knex('permissions').select('permission_id').where('type', '=', req.body.permissions);
    permissisionId = permissisionId[0]["permission_id"];
    
    var result = await User.where({username: req.body.username}).save({permission_id: permissisionId}, {patch: true});
    var email = await knex('users').select('users.email').from('users').where('users.username', username);
    email = email[0]["email"];
    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });
   
    if(permissisionId === 2){
        var mailOptions = {
            to: email,
            from: 'wstationtestdod@gmail.com',
            subject: 'Weather Station Account Request',
            text: 'You are receiving this message because your account has been approved.\n\n',
        };
        transporter.sendMail(mailOptions, function (err) {
            //Alert user email has been sent
            if (err) {
                return console.log(err);
            }
        });
    }
    else{
        var mailOptions = {
            to: email,
            from: 'wstationtestdod@gmail.com',
            subject: 'Weather Station Account Request',
            text: 'You are receiving this message because your account has been denied.\n\n',
        };
        transporter.sendMail(mailOptions, function (err) {
            //Alert user email has been sent
            if (err) {
                return console.log(err);
            }
        });
    }
    return res.json({ result });
});

router.put('/updatedPermissions', async function (req, res) {
    // Pass in the user and the permission you want to change that user to
    var username = req.body.username;
    var permissisionId = await knex('permissions').select('permission_id').where('type', '=', req.body.permissions)
    permissisionId = permissisionId[0]["permission_id"];

    var result = await User.where({username: req.body.username}).save({permission_id: permissisionId}, {patch: true});
    return res.json({ result });
});

router.post('/logout', function(req,res){
    req.session.destroy(response => {
        res.json({response: response})
    });
});

router.post('/reset/', function(req,res){
    var email = req.body.email;
    //This waterfall will generate a token in the first function
    //Assign that token to a user in the second function
    //and email it to the user in the 3rd function
    async.waterfall([
        function(done){
            crypto.randomBytes(10, function(err, buf){
                var token = buf.toString('hex');
                done(err,token); 
            });
        },
        function(token, done){
            var user = User.where({email: email}).save({
                reset_password_token: token,
                reset_password_expires: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
            },{patch:true});   
            if(!user)
                var err = 'No user';
            done(err, token, user);
        },
        function(token, user, done){
            var transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                }
            });
            var mailOptions = {
                to: email,
                from: 'wstationtestdod@gmail.com',
                subject: 'Weather Station Account Password Recovery',
                text: 'You are receiving this message because you have initiated the password reset process.\n\n'+
                'Please click the following link to complete this process:\n\n'+
                req.protocol + '://' + req.get('host') + '/user/reset/' + token + '\n\n' +
                'If you did not request a password reset, please ignore this email.\n'
            };
            transporter.sendMail(mailOptions,function(err){
                //Alert user email has been sent
                done(err, 'done');
            });
        }
    ],function(err){
        if(err)
            console.log('Error:', err);
    })
    res.status(200).json({errors: [{msg: "If you have entered a valid email address you will recieve an email with instructions on how to reset your password shortly"}]})
})

router.post('/reset/:token', async function(req, res){
    //makes sure new user password meets password requirements
    var newPass = req.body.newPass;
    var confirmPass = req.body.confirmPass;
    var token = req.params.token;

    req.checkBody('newPass','Password must be 8 characters or longer').isLength({min: 8});
    req.checkBody('newPass','Password cannot contain symbols').not().matches(/\W/);
    req.checkBody('newPass', 'Password must have at least 1 letter and 1 number').matches(/\d/);
    req.checkBody('newPass', 'Passwords do not match').equals(confirmPass);

    //if it doesnt meet requirements, throw error
    var errors = req.validationErrors();
    if(errors){
        res.status(200).json({errors: errors, redirect: false});
    }
    else{
        var user = await User.where({reset_password_token: token}).fetch();
        if(!user){
            res.status(200).json({errors: [{msg: "Invalid token, please request a new password reset email"}]})
        }

        if((1000 * 60 * 60) < (moment.utc() - user.attributes.reset_password_expires)){
            res.status(200).json({errors: [{msg: "Invalid token, please request a new password reset email"}]})
        }

        var hash = await bcrypt.hash(newPass, 10);

        await User.where({reset_password_token: token}).save({
            password: hash,
            reset_password_token: '',
        },{patch:true})

        res.status(200).json({errors: [], redirect: true});
    }
})
//updates user profile (email/phone) when user submits form on profile page
router.post('/editProfile', async function(req, res){
    var email = req.body.email;
    var phone = req.body.phone;
    var user = await User.where({username: req.session.username}).fetch()
    
    if(email !== user.attributes.email){
        var dbEmail = "";
        email = email.toLowerCase();

        var newUser = await User.where({email: email}).fetch();
        if(newUser){
            dbEmail = newUser.attributes.email.toLowerCase();
        }
        //checks that their email is valid and not a duplicate
        req.checkBody('email', 'Invalid email').notEmpty().isEmail()
        req.checkBody('email','Email already exists').not().equals(dbEmail);
    }
    else{
        email = user.attributes.email;
    }
    if(phone !== user.attributes.phone){
        var dbPhone = ""
        //remove all non-digit characters
        phone = phone.replace(/\D/g, '');

        var newUser = await User.where({phone: phone}).fetch();
        if(newUser){
            dbPhone = newUser.attributes.phone;
        }
        //must enter a 10 digit number, no duplicate phone numbers
        if (phone.length > 0){
            req.checkBody('phone', 'Phone numbers must be 10 digits in length').isLength({min: 10, max:10})
            req.checkBody('phone', 'Phone number already registered').not().equals(dbPhone);
        }
    }
    else{
        phone = user.attributes.phone;
    }
    //checks that the email/phone the user entered didnt return errors
    var errors = req.validationErrors();
    if(errors){
        res.json({messages: errors})
    }
    else{
        //updates user profile
        await User.where({username: req.session.username}).save({
            email: email,
            phone: phone,
        },{patch:true});
    }

    res.json({messages: [{msg: 'Profile updated successfully!'}]});
})
//updates user password in the database when they edit it from the user profile page
router.post('/editPassword', async function(req, res){
    var currPass = req.body.currPass;
    var newPass = req.body.newPass;

    var user = await User.where({username: req.session.username}).fetch()

    var check = await bcrypt.compare(currPass, user.attributes.password);
    if(!check){
        console.log('Current Password is incorrect')
    }
    else{

        req.checkBody('newPass','Password must be longer than 8 characters, cannot contain symbols, and must have at least 1 letter and 1 number.')
        .isLength({min: 8}).matches(/\d/).not().matches(/\W/);

        var errors = req.validationErrors();
        if(errors){
            console.log(errors);
        }
        else{
            //updates user password in db
            await bcrypt.hash(newPass, 10, function(err,hash){
                User.where({username: req.session.username}).save({
                    password: hash,
                },{patch:true})
            })
            res.redirect('/profile');
        }
    }
})
module.exports = router;