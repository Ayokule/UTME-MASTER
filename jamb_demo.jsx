import React, { useState } from 'react';
import { BookOpen, Users, BarChart3, Settings, Clock, CheckCircle, XCircle, Award, Crown, Lock, Zap, TrendingUp, Target, Brain, Star } from 'lucide-react';

// Main App Component with Routing
export default function JAMBPrepDemo() {
  const [currentPage, setCurrentPage] = useState('login');
  const [userType, setUserType] = useState('student');
  const [isPremium, setIsPremium] = useState(false);

  const pages = {
    login: <LoginPage onLogin={(type) => { setUserType(type); setCurrentPage(type === 'admin' ? 'admin' : 'subjects'); }} />,
    subjects: <SubjectSelectionPage isPremium={isPremium} onSelect={() => setCurrentPage('test')} onUpgrade={() => setCurrentPage('pricing')} />,
    test: <TestPage isPremium={isPremium} onFinish={() => setCurrentPage('score')} />,
    score: <ScorePage isPremium={isPremium} onRetake={() => setCurrentPage('subjects')} />,
    admin: <AdminPage onLogout={() => setCurrentPage('login')} />,
    pricing: <PricingPage isPremium={isPremium} onUpgrade={() => { setIsPremium(true); setCurrentPage('subjects'); }} />
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation Demo Buttons */}
      <div className="bg-white border-b border-gray-200 p-4 flex gap-2 flex-wrap shadow-sm">
        <button onClick={() => setCurrentPage('login')} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700">Login</button>
        <button onClick={() => setCurrentPage('subjects')} className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">Subjects</button>
        <button onClick={() => setCurrentPage('test')} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Test</button>
        <button onClick={() => setCurrentPage('score')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Score</button>
        <button onClick={() => setCurrentPage('admin')} className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">Admin</button>
        <button onClick={() => setCurrentPage('pricing')} className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">Pricing</button>
        <button onClick={() => setIsPremium(!isPremium)} className={`px-3 py-1 rounded text-sm ${isPremium ? 'bg-amber-600 text-white' : 'bg-gray-300'}`}>
          {isPremium ? '⭐ Premium' : 'Free'}
        </button>
      </div>
      
      {pages[currentPage]}
    </div>
  );
}

// 1. LOGIN PAGE
function LoginPage({ onLogin }) {
  const [isStudent, setIsStudent] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            JAMB Prep Master
          </h1>
          <p className="text-gray-600 mt-2">Ace your JAMB exam with confidence</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Toggle Student/Admin */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setIsStudent(true)}
              className={`flex-1 py-2 rounded-md font-medium transition ${isStudent ? 'bg-white text-indigo-600 shadow' : 'text-gray-600'}`}
            >
              Student
            </button>
            <button 
              onClick={() => setIsStudent(false)}
              className={`flex-1 py-2 rounded-md font-medium transition ${!isStudent ? 'bg-white text-purple-600 shadow' : 'text-gray-600'}`}
            >
              Admin
            </button>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email or Phone</label>
              <input 
                type="text" 
                placeholder="student@example.com or 08012345678"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <button 
              type="button"
              onClick={() => onLogin(isStudent ? 'student' : 'admin')}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition transform hover:scale-[1.02]"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="#" className="text-sm text-indigo-600 hover:underline">Forgot password?</a>
            <p className="mt-4 text-sm text-gray-600">
              Don't have an account? <a href="#" className="text-indigo-600 font-medium hover:underline">Register</a>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">Demo: Click buttons above to navigate</p>
      </div>
    </div>
  );
}

// 2. SUBJECT SELECTION PAGE
function SubjectSelectionPage({ isPremium, onSelect, onUpgrade }) {
  const subjects = [
    { id: 1, name: 'English Language', icon: '📚', color: 'blue', questions: isPremium ? 2500 : 500, locked: false },
    { id: 2, name: 'Mathematics', icon: '🔢', color: 'green', questions: isPremium ? 3000 : 600, locked: false },
    { id: 3, name: 'Physics', icon: '⚛️', color: 'purple', questions: isPremium ? 2000 : 400, locked: !isPremium },
    { id: 4, name: 'Chemistry', icon: '🧪', color: 'pink', questions: isPremium ? 2200 : 0, locked: !isPremium },
    { id: 5, name: 'Biology', icon: '🧬', color: 'emerald', questions: isPremium ? 2400 : 0, locked: !isPremium },
    { id: 6, name: 'Economics', icon: '💰', color: 'yellow', questions: isPremium ? 1800 : 0, locked: !isPremium },
    { id: 7, name: 'Government', icon: '⚖️', color: 'indigo', questions: isPremium ? 1600 : 0, locked: !isPremium },
    { id: 8, name: 'Literature', icon: '📖', color: 'rose', questions: isPremium ? 1500 : 0, locked: !isPremium },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Choose Your Subject</h1>
            <p className="text-gray-600 mt-1">Select a subject to start practicing</p>
          </div>
          {!isPremium && (
            <button onClick={onUpgrade} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition">
              <Crown className="w-5 h-5" />
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard icon={<BookOpen className="w-6 h-6" />} label="Total Questions" value={isPremium ? "18,000+" : "1,500"} color="blue" />
          <StatCard icon={<Target className="w-6 h-6" />} label="Subjects" value={isPremium ? "8" : "2"} color="green" />
          <StatCard icon={<Clock className="w-6 h-6" />} label="Tests Taken" value="24" color="purple" />
          <StatCard icon={<Award className="w-6 h-6" />} label="Avg Score" value="68%" color="pink" />
        </div>
      </div>

      {/* Free Version Banner */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Free Version - Limited Access</p>
              <p className="text-sm text-amber-700">Upgrade to unlock all 8 subjects and 18,000+ questions</p>
            </div>
          </div>
        </div>
      )}

      {/* Subject Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subjects.map(subject => (
          <SubjectCard 
            key={subject.id} 
            subject={subject} 
            isPremium={isPremium}
            onSelect={onSelect}
            onUpgrade={onUpgrade}
          />
        ))}
      </div>

      {/* Premium Features */}
      {!isPremium && (
        <div className="mt-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <Crown className="w-12 h-12 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Unlock Premium Features</h3>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Feature text="10,000+ Verified Questions" />
                <Feature text="JAMB Past Questions (2010-2024)" />
                <Feature text="All 8 Subjects Unlocked" />
                <Feature text="Detailed Performance Analytics" />
                <Feature text="Answer Explanations" />
                <Feature text="Score Predictions" />
              </div>
              <button onClick={onUpgrade} className="mt-6 bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:shadow-lg transition">
                Upgrade Now - ₦100,000
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectCard({ subject, isPremium, onSelect, onUpgrade }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
    emerald: 'from-emerald-500 to-emerald-600',
    yellow: 'from-yellow-500 to-yellow-600',
    indigo: 'from-indigo-500 to-indigo-600',
    rose: 'from-rose-500 to-rose-600',
  };

  return (
    <div className={`relative bg-white rounded-xl p-6 shadow-lg border-2 ${subject.locked ? 'border-gray-200 opacity-60' : 'border-transparent hover:shadow-xl'} transition cursor-pointer`}
         onClick={() => subject.locked ? onUpgrade() : onSelect()}>
      {subject.locked && (
        <div className="absolute top-3 right-3">
          <Lock className="w-5 h-5 text-gray-400" />
        </div>
      )}
      
      <div className={`w-16 h-16 bg-gradient-to-br ${colors[subject.color]} rounded-2xl flex items-center justify-center text-3xl mb-4`}>
        {subject.icon}
      </div>
      
      <h3 className="font-bold text-lg mb-2 text-gray-900">{subject.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{subject.questions} questions available</p>
      
      {subject.locked ? (
        <button className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg font-medium">
          🔒 Premium Only
        </button>
      ) : (
        <button className={`w-full bg-gradient-to-r ${colors[subject.color]} text-white py-2 rounded-lg font-medium hover:shadow-md transition`}>
          Start Practice
        </button>
      )}
    </div>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    pink: 'bg-pink-50 text-pink-600'
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <div className={`inline-flex p-3 rounded-lg ${colors[color]} mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

// 3. TEST PAGE
function TestPage({ isPremium, onFinish }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10800); // 3 hours in seconds
  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 1,
      text: "What is the past tense of 'go'?",
      options: ["Goed", "Went", "Gone", "Going"],
      subject: "English"
    },
    {
      id: 2,
      text: "If x² - 5x + 6 = 0, what are the values of x?",
      options: ["x = 2 or 3", "x = 1 or 6", "x = -2 or -3", "x = 2 or -3"],
      subject: "Mathematics"
    }
  ];

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">JAMB Mock Exam 2024</h1>
            <p className="text-gray-600">English, Mathematics, Physics, Chemistry</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">{formatTime(timeLeft)}</div>
              <div className="text-sm text-gray-600">Time Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{currentQ + 1}/180</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Question Area */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-indigo-100 text-indigo-600 px-4 py-1 rounded-full font-semibold text-sm">
                {questions[currentQ].subject}
              </span>
              <span className="text-gray-500">Question {currentQ + 1}</span>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {questions[currentQ].text}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {questions[currentQ].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers({...answers, [currentQ]: idx})}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    answers[currentQ] === idx 
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQ] === idx ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                    }`}>
                      {answers[currentQ] === idx && <div className="w-3 h-3 bg-white rounded-full" />}
                    </div>
                    <span className="font-medium">{String.fromCharCode(65 + idx)}.</span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <button 
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                className="px-6 py-2 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
                disabled={currentQ === 0}
              >
                ← Previous
              </button>
              
              {currentQ < questions.length - 1 ? (
                <button 
                  onClick={() => setCurrentQ(currentQ + 1)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
                >
                  Next →
                </button>
              ) : (
                <button 
                  onClick={onFinish}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700"
                >
                  Submit Exam
                </button>
              )}
            </div>
          </div>

          {/* Premium Hint */}
          {!isPremium && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-800">
                <Lock className="w-5 h-5" />
                <span className="text-sm font-medium">Free version: Basic questions only. Upgrade for JAMB past questions!</span>
              </div>
            </div>
          )}
        </div>

        {/* Question Navigator */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4">Question Navigator</h3>
            
            <div className="grid grid-cols-6 gap-2 mb-6">
              {Array.from({length: 30}, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm ${
                    i === currentQ 
                      ? 'bg-indigo-600 text-white' 
                      : answers[i] !== undefined 
                        ? 'bg-green-100 text-green-700 border border-green-300' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 border border-green-300 rounded" />
                <span className="text-gray-600">Answered: 12</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-100 rounded" />
                <span className="text-gray-600">Unanswered: 168</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-indigo-600 rounded" />
                <span className="text-gray-600">Current</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. SCORE PAGE
function ScorePage({ isPremium, onRetake }) {
  const score = {
    total: 280,
    max: 400,
    percentage: 70,
    subjects: [
      { name: 'English', score: 68, max: 100, correct: 34, total: 45 },
      { name: 'Mathematics', score: 72, max: 100, correct: 36, total: 45 },
      { name: 'Physics', score: 68, max: 100, correct: 34, total: 45 },
      { name: 'Chemistry', score: 72, max: 100, correct: 36, total: 45 }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Celebration Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white mb-6 text-center">
        <Award className="w-20 h-20 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">Great Job!</h1>
        <p className="text-xl opacity-90">You scored above average</p>
      </div>

      {/* Main Score Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="text-center mb-8">
          <div className="text-7xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            {score.total}/{score.max}
          </div>
          <div className="text-2xl text-gray-600">
            {score.percentage}% - Above Average
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="grid grid-cols-2 gap-6">
          {score.subjects.map((subject, idx) => (
            <div key={idx} className="border-2 border-gray-100 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">{subject.name}</h3>
                <span className="text-2xl font-bold text-green-600">{subject.score}/{subject.max}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div className="bg-green-500 h-3 rounded-full" style={{width: `${subject.score}%`}} />
              </div>
              <p className="text-sm text-gray-600">{subject.correct} correct out of {subject.total} questions</p>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Analytics */}
      {isPremium ? (
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">+12%</div>
                <div className="text-sm text-gray-600">Improvement</div>
              </div>
            </div>
            <p className="text-sm text-gray-500">From last attempt</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">78%</div>
                <div className="text-sm text-gray-600">Predicted Score</div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Actual JAMB estimate</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">Top 15%</div>
                <div className="text-sm text-gray-600">Ranking</div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Among all users</p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <Crown className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-lg text-amber-900 mb-2">Unlock Detailed Analytics</h3>
              <p className="text-amber-800 mb-4">See performance predictions, improvement trends, topic strengths, and more!</p>
              <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg">
                Upgrade to Premium - ₦100,000
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button onClick={onRetake} className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition">
          Take Another Test
        </button>
        <button className="flex-1 border-2 border-gray-300 py-4 rounded-xl font-bold hover:bg-gray-50 transition">
          Review Answers
        </button>
        <button className="flex-1 border-2 border-gray-300 py-4 rounded-xl font-bold hover:bg-gray-50 transition">
          Share Results
        </button>
      </div>
    </div>
  );
}

// 5. ADMIN PAGE
function AdminPage({ onLogout }) {
  const stats = {
    totalStudents: 247,
    activeToday: 89,
    totalExams: 1453,
    avgScore: 68.5
  };

  const recentStudents = [
    { name: 'John Doe', email: 'john@example.com', score: 75, subject: 'Mathematics', time: '2 mins ago' },
    { name: 'Jane Smith', email: 'jane@example.com', score: 82, subject: 'English', time: '15 mins ago' },
    { name: 'Mike Johnson', email: 'mike@example.com', score: 68, subject: 'Physics', time: '1 hour ago' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage students, questions, and system settings</p>
        </div>
        <button onClick={onLogout} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Logout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <AdminStatCard icon={<Users />} label="Total Students" value={stats.totalStudents} change="+12" color="blue" />
        <AdminStatCard icon={<Zap />} label="Active Today" value={stats.activeToday} change="+5" color="green" />
        <AdminStatCard icon={<BookOpen />} label="Total Exams" value={stats.totalExams} change="+45" color="purple" />
        <AdminStatCard icon={<BarChart3 />} label="Avg Score" value={`${stats.avgScore}%`} change="+2.3%" color="pink" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="col-span-2 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Exam Activity</h2>
          <div className="space-y-3">
            {recentStudents.map((student, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                    {student.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{student.score}%</div>
                  <div className="text-sm text-gray-600">{student.subject}</div>
                </div>
                <div className="text-sm text-gray-500">{student.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700">
              + Add Student
            </button>
            <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700">
              + Import Questions
            </button>
            <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700">
              Create Exam
            </button>
            <button className="w-full border-2 border-gray-300 py-3 rounded-lg font-medium hover:bg-gray-50">
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ icon, label, value, change, color }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500'
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className={`inline-flex p-3 rounded-lg ${colors[color]} text-white mb-4`}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-gray-600 text-sm">{label}</div>
      <div className="text-green-600 text-sm font-medium mt-2">{change} this week</div>
    </div>
  );
}

// 6. PRICING PAGE
function PricingPage({ isPremium, onUpgrade }) {
  const plans = [
    {
      name: 'Free',
      price: '₦0',
      description: 'Try before you buy',
      features: [
        '30-day trial',
        '50 students maximum',
        'Basic questions (500)',
        'English & Mathematics only',
        'Simple results',
        'Demo watermark'
      ],
      current: !isPremium,
      cta: 'Current Plan',
      highlight: false
    },
    {
      name: 'Premium',
      price: '₦100,000',
      period: 'one-time',
      description: 'Full access forever',
      features: [
        'Unlimited students',
        '10,000+ verified questions',
        'All 8 JAMB subjects',
        'Past questions (2010-2024)',
        'Detailed analytics',
        'Answer explanations',
        'Performance predictions',
        '1 year free updates'
      ],
      current: isPremium,
      cta: isPremium ? 'Current Plan' : 'Upgrade Now',
      highlight: true
    },
    {
      name: 'Enterprise',
      price: '₦200,000',
      period: 'one-time',
      description: 'For large institutions',
      features: [
        'Everything in Premium',
        'Lifetime updates',
        'White-label branding',
        'Source code access',
        'Priority support',
        'Custom features',
        'On-site training',
        'Multiple locations'
      ],
      current: false,
      cta: 'Contact Sales',
      highlight: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600">One-time payment. Own it forever.</p>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <div key={idx} className={`relative bg-white rounded-2xl shadow-xl border-2 ${plan.highlight ? 'border-indigo-600 transform scale-105' : 'border-gray-200'} p-8`}>
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-1">{plan.price}</div>
              {plan.period && <div className="text-gray-600">{plan.period}</div>}
              <p className="text-gray-600 mt-2">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={plan.cta === 'Upgrade Now' ? onUpgrade : undefined}
              disabled={plan.current}
              className={`w-full py-3 rounded-xl font-bold transition ${
                plan.highlight
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg'
                  : plan.current
                    ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    : 'border-2 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold mb-2">Is this a subscription?</h4>
            <p className="text-gray-600">No! One-time payment. Own it forever.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Can I upgrade later?</h4>
            <p className="text-gray-600">Yes, pay the difference anytime.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Refund policy?</h4>
            <p className="text-gray-600">30-day money-back guarantee.</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">Need help?</h4>
            <p className="text-gray-600">Email support@jambprep.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}