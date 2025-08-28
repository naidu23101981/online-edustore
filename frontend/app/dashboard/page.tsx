"use client"
import { useState } from 'react'

type ExamAttempt = {
  id: string
  examTitle: string
  productTitle: string
  score: number
  timeSpent: number
  completedAt: string
  totalQuestions: number
  correctAnswers: number
}

type AvailableExam = {
  id: string
  title: string
  productTitle: string
  duration: number
  questions: number
}

const mockAttempts: ExamAttempt[] = [
  {
    id: '1',
    examTitle: 'Sample PDF 2',
    productTitle: 'Sample PDF 2',
    score: 85,
    timeSpent: 42,
    completedAt: '2024-01-15T10:30:00Z',
    totalQuestions: 25,
    correctAnswers: 21
  },
  {
    id: '2',
    examTitle: 'Sample PDF 1',
    productTitle: 'Sample PDF 1',
    score: 92,
    timeSpent: 28,
    completedAt: '2024-01-10T14:20:00Z',
    totalQuestions: 20,
    correctAnswers: 18
  }
]

const mockAvailableExams: AvailableExam[] = [
  {
    id: '3',
    title: 'Sample PDF 3',
    productTitle: 'Sample PDF 3',
    duration: 60,
    questions: 30
  },
  {
    id: '4',
    title: 'Sample PDF 4',
    productTitle: 'Sample PDF 4',
    duration: 40,
    questions: 22
  }
]

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState<'exams' | 'attempts' | 'leaderboard' | 'downloads' | 'settings'>('exams')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">User Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        {[
          { id: 'exams', label: 'Available Exams', count: mockAvailableExams.length },
          { id: 'attempts', label: 'My Attempts', count: mockAttempts.length },
          { id: 'leaderboard', label: 'Leaderboard', count: 0 },
          { id: 'downloads', label: 'Downloads', count: 0 },
          { id: 'settings', label: 'Settings', count: 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 border-b-2 font-medium ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Available Exams Tab */}
      {activeTab === 'exams' && (
        <div>
          <h2 className="text-lg font-medium mb-4">Available Exams</h2>
          {mockAvailableExams.length === 0 ? (
            <p className="text-gray-600">No exams available. Purchase products to unlock exams.</p>
          ) : (
            <div className="grid gap-4">
              {mockAvailableExams.map((exam) => (
                <div key={exam.id} className="border rounded-lg p-4 hover:shadow-sm transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{exam.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">PDF Title: {exam.productTitle}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>⏱️ {exam.duration} min</span>
                        <span>📝 {exam.questions} questions</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.location.href = '/exams'}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Take Exam
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Attempts Tab */}
      {activeTab === 'attempts' && (
        <div>
          <h2 className="text-lg font-medium mb-4">My Exam Attempts</h2>
          {mockAttempts.length === 0 ? (
            <p className="text-gray-600">No exam attempts yet. Start with an available exam!</p>
          ) : (
            <div className="grid gap-4">
              {mockAttempts.map((attempt) => (
                <div key={attempt.id} className="border rounded-lg p-4 hover:shadow-sm transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{attempt.examTitle}</h3>
                      <p className="text-sm text-gray-600 mt-1">PDF Title: {attempt.productTitle}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>📊 Score: <span className={getScoreColor(attempt.score)}>{attempt.score}%</span></span>
                        <span>⏱️ Time: {attempt.timeSpent} min</span>
                        <span>✅ {attempt.correctAnswers}/{attempt.totalQuestions} correct</span>
                        <span>📅 {formatDate(attempt.completedAt)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert('View detailed results - coming soon!')}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div>
          <h2 className="text-lg font-medium mb-4">Personal Performance</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{mockAttempts.length}</div>
                <div className="text-sm text-gray-600">Exams Taken</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(mockAttempts.reduce((sum, a) => sum + a.score, 0) / mockAttempts.length)}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {Math.round(mockAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / mockAttempts.length)}m
                </div>
                <div className="text-sm text-gray-600">Avg Time</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Downloads Tab */}
      {activeTab === 'downloads' && (
        <div>
          <h2 className="text-lg font-medium mb-4">My Downloads</h2>
          <p className="text-gray-600">Your purchased PDFs will appear here.</p>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <h2 className="text-lg font-medium mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Profile Information</h3>
              <p className="text-sm text-gray-600">Update your profile details and preferences.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Security</h3>
              <p className="text-sm text-gray-600">Change password and security settings.</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Notifications</h3>
              <p className="text-sm text-gray-600">Manage email and exam notifications.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


