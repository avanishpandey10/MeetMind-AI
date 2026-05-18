import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { meetingService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const HistoryPage = ({ setCurrentMeeting }) => {
  const navigate = useNavigate()
  const [meetings, setMeetings] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadMeetings()
  }, [search, page])

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setPage(1)
      loadMeetings()
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [search])

  const loadMeetings = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await meetingService.getMeetings({ 
        search, 
        page,
        limit: 10 
      })
      setMeetings(data.meetings || [])
      setPagination(data.pagination)
    } catch (error) {
      setError('Failed to load meetings. Please check your connection.')
      console.error('Error loading meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMeeting = async (meetingId) => {
    try {
      const meeting = await meetingService.getMeeting(meetingId)
      setCurrentMeeting(meeting)
      navigate(`/results/${meetingId}`)
    } catch (error) {
      toast.error('Failed to load meeting')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="card p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Meeting History</h2>
            <p className="text-gray-600 mt-1">
              Browse and search your processed meetings
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn-primary flex items-center space-x-2"
          >
            <span>📝</span>
            <span>New Meeting</span>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Search meetings by title or content..."
              className="input-field pl-12"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" text="Loading meetings..." />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button onClick={loadMeetings} className="btn-secondary">
              🔄 Retry
            </button>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {search ? 'No meetings found' : 'No meetings yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {search 
                ? 'Try adjusting your search terms' 
                : 'Process your first meeting to see it here'}
            </p>
            {!search && (
              <button
                onClick={() => navigate('/')}
                className="btn-primary"
              >
                🚀 Process Your First Meeting
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map(meeting => (
              <div
                key={meeting._id}
                onClick={() => handleSelectMeeting(meeting._id)}
                className="bg-gray-50 rounded-xl p-5 cursor-pointer hover:shadow-md transition-all border border-transparent hover:border-blue-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {meeting.title || 'Untitled Meeting'}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {meeting.metadata?.wordCount || 0} words
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {meeting.summary}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-3">
                      <span className="text-xs text-gray-500 flex items-center space-x-1">
                        <span>📅</span>
                        <span>{formatDate(meeting.createdAt)}</span>
                      </span>
                      <span className="text-xs text-gray-500 flex items-center space-x-1">
                        <span>✅</span>
                        <span>{meeting.actionItems?.length || 0} action items</span>
                      </span>
                      <span className="text-xs text-gray-500 flex items-center space-x-1">
                        <span>💡</span>
                        <span>{meeting.decisions?.length || 0} decisions</span>
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <svg 
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  ← Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        pageNum === page
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryPage