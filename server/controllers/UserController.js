import { isObjectIdOrHexString } from "mongoose";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

//signUp new User
export const signup = async (req, res) => {
    // Get data'

    
    const { fullName, email, password, image, bio } = req.body;

    try {
        // Validate required fields
        
        if (!fullName || !email || !password) {
            return res.json({
                success: false,
                message: "Missing required fields: fullName, email or password"
            });
        }

        // Check if user already exists
        
        const existingUser = await User.findOne({ email });
        // console.log(1);
        // console.log(existingUser)
        if (existingUser) {
            console.log(existingUser.bio);
            return res.json({
                
                success: false,
                message: "User already exists with this email"
            });
        }
        // console.log(1);
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        // console.log(1);
        const newUser = await User.create({
            fullName,
            email,
            image,
            password: hashedPassword,
            bio
        });

        // Generate JWT token
        const token = generateToken(newUser._id);

        // Send response
        res.json({
            success: true,
            userData: newUser,
            token,
            message: "Account created successfully"
        });
    } catch (error) {
        console.log(error);

        // Handle duplicate key error
        if (error.code === 11000 && error.keyPattern?.email) {
            return res.json({
                success: false,
                message: "Email already registered. Try logging in."
            });
        }

        // Generic error fallback
        res.json({
            success: false,
            message: "Signup failed: " + error.message
        });
    }
};



//User login
export const login=async(req,res)=>{
    try{
        //get data from the body
        // console.log(1);
        const {email,password}=req.body;


        //validate data
        if(!email || !password){
            return res.json({
                success:false,
                message:"all feilds are required"
            });
        }

        //check if user does not exist
        const user=await User.findOne({email});

        if(!user){
            return res.json({
                success:false,
                message:"no such account exist"
            });
        }

        //check if password provided is correct or not
        const isPasswordCorrect=await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.json({
                success:false,
                message:"incorrect password"
            });
        }

        const token=generateToken(user._id);
        // console.log(1);
        res.json({
            success:true,
            user,
            token,
            message:"you have logged in"
        })

    }
    catch(error){
        console.log(error.message);
        res.json({
            success:false,
            message:error.message
        });
    }
};


//check if user is authenticated
export const checkAuth=(req,res)=>{
    res.json({
        success:true,
        user:req.user
    });
};

//to update profile
export const updateProfile=async(req,res)=>{
    try{
        //get data
        console.log(1);
        const {bio,fullName,profilePic }=req.body;
        const userId=req.user._id;


        let updatedUser;
        console.log(req.body);
        if(!profilePic){
            // console.log(0)
            updatedUser=await User.findByIdAndUpdate(
                userId,  
                {bio,fullName},
                {new:true}
            );

            res.json({
            success:true,
            user:updatedUser,
            message:"user updated succesfully"
            });
        }
        else{
            
            const upload=await cloudinary.uploader.upload(profilePic);
            // console.log(1)

        updatedUser=await User.findByIdAndUpdate(
            userId,
            { profilePic:upload.secure_url, bio, fullName},
            {new:true}
        ); 

        res.json({
            success:true,
            user:updatedUser,
            message:"user updated succesfully"
        })
        }

        
    }
    catch(error){
        console.log(error.message);
        res.json({
            success:false,
            message:error.message
        });
    }
};
