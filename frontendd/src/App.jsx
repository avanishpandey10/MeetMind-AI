import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ResultsPage from './pages/ResultsPage'
import HistoryPage from './pages/HistoryPage'

function App() {
  const [currentMeeting, setCurrentMeeting] = useState(null)

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                setCurrentMeeting={setCurrentMeeting} 
              />
            } 
          />
          <Route 
            path="/results/:id" 
            element={
              <ResultsPage 
                currentMeeting={currentMeeting}
                setCurrentMeeting={setCurrentMeeting}
              />
            } 
          />
          <Route 
            path="/history" 
            element={
              <HistoryPage 
                setCurrentMeeting={setCurrentMeeting}
              />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-600">
              <span className="text-lg">📋</span>
              <span className="font-semibold text-gradient">MeetMind AI</span>
            </div>
            <p className="text-gray-500 text-sm">
              AI-Powered Meeting & Workflow Assistant © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App