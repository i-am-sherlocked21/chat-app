//authenticate user

import jwt from "jsonwebtoken";
import User from "../models/User.js";




// middle ware to protect route
export const protectRoute=async(req,res , next)=>{
    try{
        const token=req.headers.token;
        if(!token){
            return res.json({
                success:false,
                message:"error in finding token"
            });
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        const user=await User.findById(decoded.userId).select("-password");

        if(!user){
            return res.json({
                success:false,
                message:"user not found"
            });
        }

        req.user=user; 
        next();
    }
    catch(error){
        console.log(error.message);
        res.json({
            success:false,
            message:error.message
        });
    }
};


