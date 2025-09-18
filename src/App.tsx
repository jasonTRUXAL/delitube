import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VideoPage from './pages/VideoPage';
import UploadPage from './pages/UploadPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import MyVideosPage from './pages/MyVideosPage';
import AdminPage from './pages/AdminPage';
import { useAuthStore } from './stores/authStore';

function App() {
  const { refreshUser, loading } = useAuthStore();
  
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="video/:id" element={<VideoPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="my-videos" element={<MyVideosPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="search" element={<ExplorePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;