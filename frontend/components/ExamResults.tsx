"use client"
import { useState } from 'react'

type QuestionResult = {
  id: number
  question: string
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  explanation?: string
}

type ExamResult = {
  examTitle: string
  productTitle: string
  score: number
  timeSpent: number
  totalQuestions: number
  correctAnswers: number
  completedAt: string
  questions: QuestionResult[]
}

interface ExamResultsProps {
  result: ExamResult
  onClose: () => void
}

export default function ExamResults({ result, onClose }: ExamResultsProps) {
  const [showExplanations, setShowExplanations] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent! Outstanding performance.'
    if (score >= 80) return 'Great job! Well done.'
    if (score >= 70) return 'Good work! Keep improving.'
    if (score >= 60) return 'Passed! Review the material.'
    return 'Needs improvement. Consider retaking the exam.'
  }

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between sticky top-0 bg-white">
        <div>
          <h1 className="text-xl font-semibold">Exam Results</h1>
          <p className="text-sm text-gray-600">{result.examTitle}</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Close
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Correct Answers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">
                {result.timeSpent}m
              </div>
              <div className="text-sm text-gray-600">Time Spent</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600">
                {formatDate(result.completedAt)}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className={`text-lg font-medium ${getScoreColor(result.score)}`}>
              {getScoreMessage(result.score)}
            </p>
          </div>
        </div>

        {/* Question Analysis */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Question Analysis</h2>
            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
            >
              {showExplanations ? 'Hide' : 'Show'} Explanations
            </button>
          </div>

          <div className="space-y-4">
            {result.questions.map((question, index) => (
              <div
                key={question.id}
                className={`border rounded-lg p-4 ${
                  question.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    question.isCorrect 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium mb-2">{question.question}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Your Answer:</span>
                        <span className={`ml-2 ${
                          question.isCorrect ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {question.userAnswer}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Correct Answer:</span>
                        <span className="ml-2 text-green-700">{question.correctAnswer}</span>
                      </div>
                    </div>

                    {showExplanations && question.explanation && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <span className="font-medium text-gray-700">Explanation:</span>
                        <p className="mt-1 text-gray-600">{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((result.correctAnswers / result.totalQuestions) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(result.timeSpent / result.totalQuestions)}m
              </div>
              <div className="text-sm text-gray-600">Avg Time per Question</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {result.questions.filter(q => q.isCorrect).length}
              </div>
              <div className="text-sm text-gray-600">Questions Correct</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <button
            onClick={() => window.location.href = '/exams'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Take Another Exam
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
