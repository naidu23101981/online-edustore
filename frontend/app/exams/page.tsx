"use client"
import { useState, useEffect } from 'react'

type Exam = {
  id: string
  title: string
  productTitle: string
  duration: number // minutes
  questions: number
  status: 'locked' | 'available' | 'completed'
  score?: number
  timeSpent?: number
}

// Ensure 1-1 mapping: exam.title === productTitle
const mockExams: Exam[] = Array.from({ length: 34 }).map((_, i) => {
  const n = i + 1
  return {
    id: String(n),
    title: `Sample PDF ${n}`,
    productTitle: `Sample PDF ${n}`,
    duration: 30 + (n % 4) * 10,
    questions: 20 + (n % 5) * 5,
    status: n % 3 === 0 ? 'completed' : n % 2 === 0 ? 'available' : 'locked',
    score: n % 3 === 0 ? 70 + (n % 4) * 5 : undefined,
    timeSpent: n % 3 === 0 ? 20 + (n % 5) * 5 : undefined,
  }
})

export default function ExamsPage() {
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)

  const getStatusColor = (status: Exam['status']) => {
    switch (status) {
      case 'locked': return 'text-gray-500 bg-gray-100'
      case 'available': return 'text-green-600 bg-green-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
    }
  }

  const getStatusText = (status: Exam['status']) => {
    switch (status) {
      case 'locked': return 'Purchase Required'
      case 'available': return 'Ready to Start'
      case 'completed': return 'Completed'
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Exams</h1>
      <p className="text-gray-600 mb-6">Each exam maps 1:1 with its PDF title.</p>
      
      <div className="grid gap-4">
        {mockExams.map((exam) => (
          <div key={exam.id} className="border rounded-lg p-4 hover:shadow-sm transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{exam.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>⏱️ {exam.duration} min</span>
                  <span>📝 {exam.questions} questions</span>
                  {exam.score && <span>📊 Score: {exam.score}%</span>}
                  {exam.timeSpent && <span>⏱️ Time: {exam.timeSpent} min</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                  {getStatusText(exam.status)}
                </span>
                {exam.status === 'available' && (
                  <button 
                    onClick={() => setSelectedExam(exam)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Start Exam
                  </button>
                )}
                {exam.status === 'locked' && (
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-auth'))}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Purchase
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedExam && (
        <ExamInterface exam={selectedExam} onClose={() => setSelectedExam(null)} />
      )}
    </div>
  )
}

function ExamInterface({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60) // seconds
  const [isStarted, setIsStarted] = useState(false)

  const mockQuestions = Array.from({ length: exam.questions }, (_, i) => ({
    id: i + 1,
    question: `Question ${i + 1}: What is the correct answer for this sample question?`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'Option A'
  }))

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < exam.questions - 1) {
      setCurrentQuestion(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    // TODO: Submit exam results to backend
    alert('Exam submitted!')
    onClose()
  }

  // Timer countdown effect
  useEffect(() => {
    if (!isStarted) return
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          handleSubmit() // Auto-submit when time runs out
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isStarted])

  if (!isStarted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-semibold mb-4">Start Exam: {exam.title}</h2>
          <div className="space-y-3 text-sm">
            <p><strong>Duration:</strong> {exam.duration} minutes</p>
            <p><strong>Questions:</strong> {exam.questions}</p>
            <p><strong>Instructions:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>You cannot switch tabs or close the browser</li>
              <li>Timer will auto-submit when time runs out</li>
              <li>You can navigate between questions</li>
              <li>All answers are saved automatically</li>
            </ul>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 px-4 py-2 border rounded">
              Cancel
            </button>
            <button 
              onClick={() => setIsStarted(true)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = mockQuestions[currentQuestion]

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{exam.title}</h2>
          <p className="text-sm text-gray-600">Question {currentQuestion + 1} of {exam.questions}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-red-600">
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-gray-600">Time Remaining</div>
        </div>
      </div>

      {/* Question */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">{currentQ.question}</h3>
          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <label key={index} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={option}
                  checked={answers[currentQuestion] === option}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="mr-3"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          
          <div className="flex gap-2">
            {mockQuestions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded text-sm ${
                  answers[index] 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                } ${currentQuestion === index ? 'ring-2 ring-blue-500' : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === exam.questions - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white rounded"
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  )
}


