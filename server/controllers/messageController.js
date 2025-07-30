import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io,userSocketMap } from "../server.js";

//get all users except logged in user
export const getUserForSidebar=async (req,res)=>{
    try{
        //get userid
        const UserId=req.user._id;

        const filteredUser=await User.find({
            _id:{$ne:UserId}
        }).select("-password");


        //count no. of messages not seen
        const unseenMessages={};
        const promises=filteredUser.map(async (user)=>{
            const message=await Message.find({
                senderId:user._id,
                receiverId:UserId,
                seen:false,
            });
            if(message.length>0){
                unseenMessages[user._id]=message.length;
            }
        });

        //use Promise to wait for all the data fething 
        await Promise.all(promises);

        //return response
        res.json(
            {
                success:true,
                users:filteredUser,
                unseenMessages,
                message:"unseen messages found"
            }
        )
    }
    catch(error){
        console.log(error.message);
        res.json({
            success:false,
            message:error.message
        });

    }
};

//get all message for selected user
export const getMessages=async(req,res)=>{
    try{
        //get ids 
        const {id:selectedUserId}=req.params;
        const myId=req.user._id;

        const messages=await Message.find({
            $or:[
                {senderId:myId,
                    receiverId:selectedUserId,
                },
                {senderId:selectedUserId,
                    receiverId:myId,
                }
            ]
        });


        //mark all messages as seen
        await Message.updateMany(
            {
            senderId:selectedUserId,
            receiverId:myId
            },
            {
                $set:{seen:true}
            }
        );

        // return response
        res.json({
            success:true,
            messages
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

//api to mark the messages as seen
export const markMessageAsSeen=async(req,res)=>{
    try{
        const {id}=req.params;

        await Message.findByIdAndUpdate(
            id,
            {seen:true}
        );

        res.json({
            success:true,
            message:"all messages marked",
        })
    }catch(error){
        console.log(error.message);
        res.json({
            success:false,
            message:error.message
        });
    }
};

//to send message to selected user
export const sendMessage = async (req, res) => {
  try {
    // ✅ Destructure directly: no `message` object here
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    console.log("📥 Base64 image (first 50 chars):", image?.slice(0, 50));

    let imageUrl = "";

    // ✅ Upload image if it exists
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chat_images",
      });
      imageUrl = uploadResponse.secure_url;
    }

    // ✅ Create message in DB
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
    });

    // ✅ Emit real-time message via socket
    const receiverSocketid = userSocketMap[receiverId];
    if (receiverSocketid) {
      io.to(receiverSocketid).emit("newMessage", newMessage);
    }

    // ✅ Send response
    return res.status(201).json({
      success: true,
      newMessage,
    });

  } catch (error) {
    console.error("❌ Error in sendMessage:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
};

