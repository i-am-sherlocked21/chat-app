import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../context/ChatContext.jsx';
import { AuthContext } from '../context/Authcontext.jsx';

const RightSideBar = () => {
  const { selectedUser, messages } = useContext(ChatContext);
  const { logout, onlineUsers } = useContext(AuthContext);
  const [msgImg, setMsgImg] = useState([]);

  useEffect(() => {
    // Get all message images
    setMsgImg(messages.filter(msg => msg.image).map(msg => msg.image));
  }, [messages]);

  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt="User Avatar"
          className='w-20 aspect-[1/1] rounded-full'
        />

        <div className='flex items-center gap-2 text-xl font-medium'>
          
          {onlineUsers.includes(selectedUser._id) && <span>{selectedUser?.fullName}</span>}
        </div>

        <p className='px-10 text-center'>{selectedUser?.bio}</p>
      </div>

      <hr className='border-[#ffffff50] my-4' />

      <div className='px-5 text-xs'>
        <p>Media</p>
        <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-4 opacity-80'>
          {msgImg.map((url, index) => (
            <div key={index} onClick={() => window.open(url)} className='cursor-pointer rounded'>
              <img 
  src={url} 
  alt="media" 
  className="w-[100px] h-[100px] object-cover rounded-md border border-gray-700" 
/>

            </div>
          ))}
        </div>
      </div>

      <button
        onClick={logout}
        className='absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 via-violet-600 to-indigo-500 text-white border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer'
      >
        Logout
      </button>
    </div>
  );
};

export default RightSideBar;

