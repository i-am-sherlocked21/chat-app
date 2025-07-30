import React, { useContext, useState } from 'react'
import {useNavigate} from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../context/Authcontext.jsx';

const ProfilePage = () => {
   
  const { authUser, updateProfile } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState(authUser.fullName || "");
  const [bio, setBio] = useState(authUser.bio || "");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If no new image, just update name and bio
    if (!selectedImage) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }

    // Convert image to base64 and update
    const reader = new FileReader();
    reader.readAsDataURL(selectedImage);
    reader.onload = async () => {
      const base64Image = reader.result;
      await updateProfile({
        profilePic: base64Image,
        fullName: name,
        bio,
      });
      navigate("/");
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
  <div className="w-full max-w-xl bg-white/5 backdrop-blur-lg border border-gray-600 rounded-2xl shadow-md flex items-center justify-between p-6 max-sm:flex-col gap-6">
    
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 w-full max-sm:items-center"
    >
      <h3 className="text-xl text-white font-semibold mb-2">Update Profile</h3>

      <label
        htmlFor="avatar"
        className="flex items-center gap-4 cursor-pointer text-gray-300 hover:text-white transition-all"
      >
        <input
          onChange={(e) => setSelectedImage(e.target.files[0])}
          type="file"
          id="avatar"
          accept=".png, .jpg, .jpeg"
          hidden
        />
        <img
          src={
            selectedImage
              ? URL.createObjectURL(selectedImage)
              : assets.avatar_icon
          }
          alt="Avatar"
          className="w-20 h-20 rounded-full object-cover border border-gray-500"
        />
        <span className="underline text-sm">Upload Profile Image</span>
      </label>

      <input
        onChange={(e) => setName(e.target.value)}
        value={name}
        type="text"
        required
        placeholder="Your name"
        className="w-full p-2 rounded-md bg-white/10 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
      />

      <textarea
        onChange={(e) => setBio(e.target.value)}
        value={bio}
        required
        rows={3}
        placeholder="Write Profile Bio"
        className="w-full p-2 rounded-md bg-white/10 text-white border border-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
      />

      <button
        type="submit"
        className="bg-gradient-to-r from-purple-500 to-violet-700 hover:from-violet-600 hover:to-purple-800 transition-all text-white font-medium py-2 rounded-full mt-2"
      >
        Save
      </button>
    </form>

    <img
      src={authUser?.profilePic || assets.logo_icon}
      alt="Preview"
      className="w-40 h-40 rounded-full object-cover max-sm:mt-4 border-2 border-violet-600 shadow-md"
    />
  </div>
</div>

  )
}

export default ProfilePage
