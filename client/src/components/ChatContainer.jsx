import React, { useContext, useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../context/ChatContext';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ChatContainer = () => {
  const scrollEnd = useRef();
  const {
    messages,
    selectedUser,
    setSelectedUser,
    getMessages,
    sendMessage,
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const [input, setInput] = useState('');

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return; // prevent empty message

    await sendMessage({
      text: input,
      image: null,
    });

    setInput('');
  };

  // Handle sending image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select a valid image');
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result;
      console.log('Image base64:', base64.slice(0, 50));

      // Send message with current input text + image
      await sendMessage({
        text: input || '',
        image: base64,
      });

      setInput(''); // clear input after send
      e.target.value = ''; // reset file input
    };

    reader.readAsDataURL(file);
  };

  // Fetch messages on selectedUser change
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // Auto-scroll when messages update
  useEffect(() => {
    if (scrollEnd.current && messages.length) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
        <img src={assets.logo_icon} alt="" className="max-w-16" />
        <p className="text-lg font-medium text-white">Chat Anytime, Anywhere</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-scroll relative backdrop-blur-lg">
      {/*------ Header ------*/}
      <div className="flex items-center gap-3 py-3 max-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.profile_martin}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && (
            <span className="w-2 h-2 rounded-full bg-green-500" />
          )}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt=""
          className="md:hidden max-w-7 cursor-pointer"
        />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      {/* Messages List */}
      <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages.map((msg, index) => {
          const isOwnMessage = msg.senderId === authUser._id;

          return (
            <div
              key={index}
              className={`w-full flex ${
                isOwnMessage ? 'justify-end' : 'justify-start'
              } mb-2`}
            >
              <div
                className={`flex items-end gap-2 ${
                  isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className="flex flex-col items-center gap-1 w-10 min-w-[40px]">
                  <img
                    src={
                      isOwnMessage
                        ? authUser?.profilePic || assets.avatar_icon
                        : selectedUser?.profilePic || assets.avatar_icon
                    }
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border border-gray-400"
                  />
                  <p className="text-[10px] text-gray-400">
                    {formatMessageTime(msg.createdAt)}
                  </p>
                </div>

                {/* Message Bubble */}
                <div
                  className={`flex flex-col gap-1 max-w-[200px] ${
                    isOwnMessage ? 'items-end text-right' : 'items-start text-left'
                  }`}
                >
                  {msg.image && (
                    <img
  src={msg.image}
  alt="sent image"
  className="w-[120px] h-[120px] object-cover border border-gray-700 rounded-lg"
/>
                  )}
                  {msg.text && (
                    <p
                      className={`p-2 md:text-sm font-light rounded-lg break-all text-white ${
                        isOwnMessage
                          ? 'rounded-br-none bg-violet-500/40'
                          : 'rounded-bl-none bg-violet-600/30'
                      }`}
                    >
                      {msg.text}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {/* Scroll to this div when messages update */}
        <div ref={scrollEnd} />
      </div>

      {/* Bottom Input Area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 bg-black/30 backdrop-blur-md">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
          />
          <input
            onChange={handleSendImage}
            type="file"
            id="image"
            accept="image/png,image/jpeg"
            hidden
          />
          <label htmlFor="image" className="cursor-pointer">
            <img src={assets.gallery_icon} alt="" className="w-5 mr-2" />
          </label>
        </div>

        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="Send"
          className="w-7 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default ChatContainer;
