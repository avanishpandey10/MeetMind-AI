import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { meetingService } from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import ChatInterface from './ChatInterface'

const MeetingResults = ({ currentMeeting, setCurrentMeeting }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [meeting, setMeeting] = useState(currentMeeting)
  const [loading, setLoading] = useState(!currentMeeting)
  const [activeTab, setActiveTab] = useState('summary')
  const [email, setEmail] = useState(null)
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!meeting && id) {
      fetchMeeting()
    }
  }, [id])

  const fetchMeeting = async () => {
    try {
      setLoading(true)
      const data = await meetingService.getMeeting(id)
      setMeeting(data)
      setCurrentMeeting(data)
      setEmail(data.followUpEmail || null)
    } catch (error) {
      toast.error('Failed to load meeting')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateEmail = async () => {
    setIsGeneratingEmail(true)
    try {
      const result = await meetingService.generateFollowUpEmail(meeting._id)
      setEmail(result.email)
      toast.success('Follow-up email generated!')
    } catch (error) {
      toast.error('Failed to generate email')
    } finally {
      setIsGeneratingEmail(false)
    }
  }

  const handleExportMarkdown = async () => {
    setExporting(true)
    try {
      await meetingService.exportMarkdown(meeting._id)
      toast.success('Markdown exported successfully!')
    } catch (error) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const handleUpdateActionItem = async (itemId, newStatus) => {
    try {
      const updatedMeeting = await meetingService.updateActionItem(
        meeting._id, 
        itemId, 
        newStatus
      )
      setMeeting(updatedMeeting)
      setCurrentMeeting(updatedMeeting)
      toast.success('Status updated!')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading meeting details..." />
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Meeting not found</h3>
        <p className="text-gray-600 mb-6">The meeting you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          ← Back to Home
        </button>
      </div>
    )
  }

  const tabs = [
    { id: 'summary', label: '📝 Summary' },
    { id: 'actions', label: `✅ Actions (${meeting.actionItems?.length || 0})` },
    { id: 'decisions', label: `💡 Decisions (${meeting.decisions?.length || 0})` },
    { id: 'email', label: '📧 Follow-up' },
  ]

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      {/* Header Card */}
      <div className="card overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {meeting.title || 'Meeting Analysis'}
              </h2>
              <p className="text-blue-100 mt-1 text-sm">
                Processed on {new Date(meeting.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleExportMarkdown}
                disabled={exporting}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all backdrop-blur-sm text-sm"
              >
                {exporting ? '📥 Exporting...' : '📥 Export MD'}
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all backdrop-blur-sm text-sm"
              >
                ← New Meeting
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-4 border-b-2 font-medium transition-all whitespace-nowrap text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  📝 Meeting Summary
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {meeting.summary}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-100">
                  <div className="text-3xl font-bold text-green-600">
                    {meeting.actionItems?.length || 0}
                  </div>
                  <div className="text-sm text-green-700 mt-1 font-medium">
                    Action Items
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 text-center border border-purple-100">
                  <div className="text-3xl font-bold text-purple-600">
                    {meeting.decisions?.length || 0}
                  </div>
                  <div className="text-sm text-purple-700 mt-1 font-medium">
                    Decisions
                  </div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center border border-orange-100">
                  <div className="text-3xl font-bold text-orange-600">
                    {meeting.metadata?.wordCount || 0}
                  </div>
                  <div className="text-sm text-orange-700 mt-1 font-medium">
                    Words Analyzed
                  </div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 text-center border border-pink-100">
                  <div className="text-3xl font-bold text-pink-600">
                    {meeting.actionItems?.filter(i => i.status === 'completed').length || 0}
                  </div>
                  <div className="text-sm text-pink-700 mt-1 font-medium">
                    Completed
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Items Tab */}
          {activeTab === 'actions' && (
            <div className="space-y-3">
              {meeting.actionItems?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-500">No action items found in this meeting</p>
                </div>
              ) : (
                meeting.actionItems.map((item, index) => (
                  <div 
                    key={item._id || index}
                    className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <select
                            value={item.status || 'pending'}
                            onChange={(e) => handleUpdateActionItem(item._id, e.target.value)}
                            className={`text-xs font-medium rounded-lg px-2 py-1 border-0 cursor-pointer ${getStatusColor(item.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          <span className={`text-lg ${
                            item.status === 'completed' 
                              ? 'line-through text-gray-400' 
                              : 'text-gray-800'
                          }`}>
                            {item.description}
                          </span>
                        </div>
                        <div className="mt-2 ml-24 flex flex-wrap items-center gap-3 text-sm">
                          <span className="flex items-center space-x-1 text-gray-600">
                            <span>👤</span>
                            <span className="font-medium">{item.assignee || 'Unassigned'}</span>
                          </span>
                          {item.deadline && (
                            <span className="flex items-center space-x-1 text-red-600">
                              <span>⏰</span>
                              <span className="font-medium">{item.deadline}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Decisions Tab */}
          {activeTab === 'decisions' && (
            <div className="space-y-3">
              {meeting.decisions?.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💡</div>
                  <p className="text-gray-500">No decisions recorded in this meeting</p>
                </div>
              ) : (
                meeting.decisions.map((decision, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100"
                  >
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="text-gray-800 text-lg">{decision}</p>
                      <p className="text-sm text-gray-500 mt-1">Decision #{index + 1}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Follow-up Email Tab */}
          {activeTab === 'email' && (
            <div>
              {!email ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📧</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    Generate Follow-up Email
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Create a professional follow-up email based on the meeting summary and action items
                  </p>
                  <button
                    onClick={handleGenerateEmail}
                    disabled={isGeneratingEmail}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    {isGeneratingEmail ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Generate Email</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="prose max-w-none">
                      <ReactMarkdown>{email}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(email)
                        toast.success('Email copied to clipboard!')
                      }}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <span>📋</span>
                      <span>Copy to Clipboard</span>
                    </button>
                    <button
                      onClick={() => setEmail(null)}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <span>🔄</span>
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Toggle Button */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowChat(!showChat)}
          className="btn-primary flex items-center space-x-2"
        >
          <span>💬</span>
          <span>{showChat ? 'Hide Chat' : 'Chat with Meeting'}</span>
        </button>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <ChatInterface 
          meetingId={meeting._id} 
          transcript={meeting.transcript} 
        />
      )}
    </div>
  )
}

export default MeetingResults