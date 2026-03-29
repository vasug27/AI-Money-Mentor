import { useState } from 'react'
import { SignedIn, SignedOut, UserButton, SignInButton, useUser } from '@clerk/clerk-react'
import './App.css'
import { BrowserRouter, Routes, Route,Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import HealthScore from './pages/HealthScore'
import FirePlanner from './pages/FirePlanner'
import TaxWizard from './pages/TaxWizard'
import LifeEventAdvisor from './pages/LifeEventAdvisor'
import CouplePlanner from './pages/CouplePlanner'
import LandingPage from './pages/LandingPage'
import MFXray from './pages/MFXray'

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><Navigate to="/" /></SignedOut>
    </>
  )
}

function App() {

  return (
    
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/health-score" element={<ProtectedRoute><HealthScore /></ProtectedRoute>} />
          <Route path="/fire" element={<ProtectedRoute><FirePlanner /></ProtectedRoute>} />
          <Route path="/tax" element={<ProtectedRoute><TaxWizard /></ProtectedRoute>} />
          <Route path="/life-event" element={<ProtectedRoute><LifeEventAdvisor /></ProtectedRoute>} />
          <Route path="/couple" element={<ProtectedRoute><CouplePlanner /></ProtectedRoute>} />
          <Route path="/mf-xray" element={<ProtectedRoute><MFXray /></ProtectedRoute>} />
        </Routes>
      </div>
    
  )
}

export default App
