import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import Navbar from './pages/Navbar'
import HomePage from "./pages/HomePage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WatcherPage from "./pages/WatcherPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import WatcherForm from "./pages/AddForm";

function App() {
  return (
      <AuthProvider>
        <Router>
          <Navbar/>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/watchers/:watcher_id" element={<WatcherPage />} />
              <Route path='/profile' element={<ProfilePage/>}/>
              <Route path='/admin' element={<AdminPage/>}/>
              <Route path='/addform' element={<WatcherForm/>}/>
          </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;
