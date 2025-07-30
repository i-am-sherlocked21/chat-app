import React, { useContext, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSideBar from '../components/RightSideBar';
import { ChatContext } from '../context/ChatContext';

const HomePage = () => {
  const {selectedUser} = useContext(ChatContext);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div
        className={`w-full max-w-[1000px] h-[90%] mx-auto 
        backdrop-blur-xl border-2 border-gray-600 rounded-2xl 
        overflow-hidden grid grid-cols-1 relative 
        ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr]' : 'md:grid-cols-2'}`}
      >
        <Sidebar />
        <ChatContainer  />
        <RightSideBar  />
      </div>
    </div>
  );
};

export default HomePage;
