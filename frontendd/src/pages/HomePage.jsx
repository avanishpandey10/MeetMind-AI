import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { meetingService } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const HomePage = ({ setCurrentMeeting }) => {
  const navigate = useNavigate()
  const [transcript, setTranscript] = useState('')
  const [title, setTitle] = useState('')
  const [inputMode, setInputMode] = useState('paste')
  const [isProcessing, setIsProcessing] = useState(false)
  const [charCount, setCharCount] = useState(0)

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'text/vtt': ['.vtt']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0]
      try {
        const text = await file.text()
        setTranscript(text)
        setCharCount(text.length)
        setTitle(file.name.replace(/\.[^/.]+$/, ""))
        toast.success(`📄 File loaded: ${file.name}`)
      } catch (error) {
        toast.error('Failed to read file. Please try again.')
      }
    }
  })

  const handleTranscriptChange = (e) => {
    const text = e.target.value
    setTranscript(text)
    setCharCount(text.length)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!transcript.trim()) {
      toast.error('Please enter meeting notes or transcript')
      return
    }
    
    if (transcript.trim().length < 50) {
      toast.error('Transcript should be at least 50 characters for better results')
      return
    }

    setIsProcessing(true)
    const loadingToast = toast.loading('🤖 AI is processing your meeting...')

    try {
      const result = await meetingService.processMeeting({ 
        transcript, 
        title: title || 'Untitled Meeting' 
      })
      
      setCurrentMeeting(result)
      toast.dismiss(loadingToast)
      toast.success('✅ Meeting processed successfully!')
      navigate(`/results/${result._id}`)
    } catch (error) {
      toast.dismiss(loadingToast)
      const errorMessage = error.response?.data?.error || 'Failed to process meeting'
      toast.error(`❌ ${errorMessage}`)
      console.error('Processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClear = () => {
    setTranscript('')
    setTitle('')
    setCharCount(0)
    toast.success('Cleared')
  }

  // Example transcript for demo
  const loadExampleTranscript = () => {
    const exampleTranscript = `Weekly Product Team Sync - March 15, 2024

John: Good morning everyone. Let's start with the sprint review. Sarah, can you update us on the user authentication feature?

Sarah: Sure. We've completed the backend implementation and are now working on the frontend integration. I expect to finish by next Wednesday.

John: Great. What about the payment gateway integration, Mike?

Mike: We've hit a blocker with the Stripe API. I need to coordinate with the security team to get the webhook endpoints configured. I'll schedule a meeting with them for tomorrow.

John: Keep me posted on that. Lisa, how's the dashboard redesign coming along?

Lisa: The wireframes are ready and I've shared them with the design team. I'll need feedback by Friday to start the implementation next week.

John: Perfect. Let's make a decision on the deployment schedule. Given the current progress, I propose we push the release to March 25th instead of the 20th.

Sarah: I agree, that gives us more time for testing.

Mike: Sounds good to me.

Lisa: Works for me too.

John: Alright, decision made - release date moved to March 25th. Also, we need to prepare the client demo for next Tuesday. Lisa, can you handle that?

Lisa: Yes, I'll prepare the presentation and share it with the team by Monday.

John: One last thing - we need to update the API documentation. Mike, can you take care of that by end of this week?

Mike: Will do.

John: Great meeting everyone. Let's sync again next Monday at 10 AM.`

    setTranscript(exampleTranscript)
    setCharCount(exampleTranscript.length)
    setTitle('Weekly Product Team Sync')
    toast.success('📋 Example transcript loaded!')
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Process Meeting Notes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Paste your meeting transcript or upload a file to get AI-powered summaries, 
            action items, and follow-up emails
          </p>
        </div>
        
        {/* Input Mode Toggle */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={() => setInputMode('paste')}
            className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-medium ${
              inputMode === 'paste' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>✏️</span>
            <span>Paste Text</span>
          </button>
          <button
            onClick={() => setInputMode('upload')}
            className={`px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 font-medium ${
              inputMode === 'upload' 
                ? 'bg-blue-500 text-white shadow-lg' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>📁</span>
            <span>Upload File</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Meeting Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly Sprint Planning, Client Meeting"
              className="input-field"
            />
          </div>

          {inputMode === 'paste' ? (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Meeting Notes / Transcript
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    {charCount} characters
                  </span>
                  <button
                    type="button"
                    onClick={loadExampleTranscript}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    📋 Load Example
                  </button>
                </div>
              </div>
              <textarea
                value={transcript}
                onChange={handleTranscriptChange}
                placeholder="Paste your meeting notes or transcript here...&#10;&#10;Example format:&#10;John: Let's start the meeting...&#10;Sarah: I'll work on the dashboard...&#10;Mike: We need to fix the API..."
                rows={12}
                className="input-field resize-none font-mono text-sm"
              />
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Transcript File
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50 scale-105' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-6xl mb-4">
                  {isDragActive ? '📥' : '📁'}
                </div>
                <p className="text-lg text-gray-600 font-medium">
                  {isDragActive 
                    ? 'Drop the file here...' 
                    : 'Drag & drop a .txt or .vtt file here'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  or click to browse your files
                </p>
              </div>
              {transcript && inputMode === 'upload' && (
                <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-500 text-xl">✅</span>
                    <p className="text-green-700 font-medium">
                      File loaded successfully ({charCount} characters)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isProcessing || !transcript.trim()}
              className="btn-primary flex-1 flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner size="sm" text="" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Process Meeting</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary"
              disabled={isProcessing}
            >
              🗑️ Clear
            </button>
          </div>
        </form>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: '📝',
            title: 'Smart Summaries',
            description: 'Get concise 3-4 sentence summaries of your meetings'
          },
          {
            icon: '✅',
            title: 'Action Items',
            description: 'Automatically extract tasks with assignees and deadlines'
          },
          {
            icon: '📧',
            title: 'Follow-up Emails',
            description: 'Generate professional follow-up emails instantly'
          }
        ].map((feature, index) => (
          <div key={index} className="card p-6 text-center hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default HomePage