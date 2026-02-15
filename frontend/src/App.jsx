import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard'
import GroupDetails from './pages/GroupDetails';
import Register from './pages/Register';
import Login from './pages/Login';
import CreateGroup from './pages/createGroup';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/:userID/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/:userID/group/:groupID" element={
            <ProtectedRoute>
              <GroupDetails />
            </ProtectedRoute>
          } />
          <Route path="/:userID/create-group" element={
            <ProtectedRoute>
              <CreateGroup />
            </ProtectedRoute>
          } />
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;