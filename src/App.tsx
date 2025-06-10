import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VideoPage from './pages/VideoPage';
import EditVideoPage from './pages/EditVideoPage';
import UploadPage from './pages/UploadPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import MyVideosPage from './pages/MyVideosPage';
import AdminPage from './pages/AdminPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { useAuthStore } from './stores/authStore';

function App() {
  const { refreshUser } = useAuthStore();
  
  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="video/:id" element={<VideoPage />} />
          <Route path="video/:id/edit" element={<EditVideoPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route path="user/:username" element={<UserProfilePage />} />
          <Route path="my-videos" element={<MyVideosPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="search" element={<ExplorePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App