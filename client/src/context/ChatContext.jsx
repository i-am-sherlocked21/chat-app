// src/context/ChatContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./Authcontext.jsx";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { axios, authUser, socket } = useContext(AuthContext);

  const [user, setUser] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUser(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getMessages = async (receiverId) => {
    try {
      const { data } = await axios.get(`/api/messages/${receiverId}`);
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const sendMessage = async (message) => {
  try {
    const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, {
      text: message.text || "",
      image: message.image || null,
      receiverId: selectedUser._id,
    });

    if (data.success) {
      setMessages((prev) => [...prev, data.newMessage]);

      if (socket) {
        socket.emit("sendMessage", {
          receiverId: selectedUser._id,
          message: data.newMessage,
        });
      }
    }
  } catch (error) {
    console.error("Send message failed:", error);
    toast.error("Sending failed");
  }
};


  useEffect(() => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser?._id === newMessage.senderId) {
        setMessages((prev) => [...prev, newMessage]);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1,
        }));
      }
    });

    return () => socket.off("newMessage");
  }, [socket, selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        user,
        messages,
        selectedUser,
        setSelectedUser,
        getMessages,
        getUsers,
        sendMessage,
        unseenMessages,
        setUnseenMessages
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

