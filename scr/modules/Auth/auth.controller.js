import bcrypt, { hashSync } from 'bcryptjs'
import jwt from 'jsonwebtoken'

import User from "../../../DB/models/User.model.js"
import sendEmailService from '../services/send-email.services.js'


// ========================================= SignUp API ================================//

/**
 * destructuring the required data from the request body
 * check if the user already exists in the database using the email
 * if exists return error email is already exists
 * password hashing
 * create new document in the database
 * return the response
 */
//================================================== SIGNUP API =============================//
export const signUp = async (req, res, next) => {
    const {
        username,
        email,
        password,
        age,
        role,
        phoneNumbers,
        addresses,
    } = req.body

    const findmail=await User.findOne({email})
    if(!findmail) return next(new Error("email not found"),{cause:409})
    const userToken=jwt.sign({email},process.env.JWT_SECRET_VERFICATION,{expersIn:"45d"})

    const isemailsent=await sendEmailService({to:email,subject:"ddd",  message: `<h1>please verify your email</h1>
    <a href="http://localhost:3000/auth/verify-email?token=${userToken}">Verify Email</a>`})

    const hashpass=bcrypt.hashSync(password,+process.env.SALT_ROUNDS);
    const newuser=await User.create({username,email,password,age,role,phoneNumbers,addresses})
    res.status(201).json({
        success: true,
        message: 'User created successfully, please check your email to verify your account',
        data: newuser
    })
    
}

// ========================================= VerifyEmail API ================================//
export const verifyEmail = async (req, res, next) => {
    const{token}=req.query;
    const decodeddata=jwt.verify(token,process.env.JWT_SECRET_VERFICATION);
    const user=await User.findOneAndUpdate({email:decodeddata.email,isEmailVerified:false},{isEmailVerified:true},{new:true})
    if(!user) return next(new Error("VARIFAY EMAIL"));
    res.status(200).json({success:true})

   
}
// ========================================= SignIn API ================================//
 export const signIn = async (req, res, next) => {
    const{email,password}=req.body;

    const finduser=await User.findOne({email,isEmailVerified:true});

    if(!finduser) return next(new Error("not found"));

    const comparepass=bcrypt.compareSync(password,finduser.password);

    if(!comparepass) return next(new Error("password not found",{cause:"404"}));

    const token=jwt.sign({email,id:finduser._id,loggedin:true},process.env.JWT_SECRET_LOGIN,{expiresIn:"30d"});
    
    finduser.isLoggedIn=true

    await finduser.save()
    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        data: {
            token
        },
        loggedIn: finduser.isLoggedIn
    })
}

 




















