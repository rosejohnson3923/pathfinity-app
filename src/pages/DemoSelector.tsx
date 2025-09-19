import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  School,
  Building2,
  UserCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export function DemoSelector() {
  const navigate = useNavigate();

  const demoCategories = [
    {
      title: "👦👧 Students",
      icon: <Users className="w-6 h-6" />,
      description: "Experience learning through different grade levels",
      color: "from-blue-500 to-indigo-600",
      users: [
        {
          name: "Sam Brown",
          grade: "Kindergarten",
          school: "Sand View Elementary",
          description: "Early learner discovering foundational skills",
          email: "sam.brown@sandview.plainviewisd.edu",
          password: "password123",
          emoji: "🧒",
          urlParam: "sam-k"
        },
        {
          name: "Alex Davis",
          grade: "1st Grade",
          school: "Sand View Elementary",
          description: "Building reading and math fundamentals",
          email: "alex.davis@sandview.plainviewisd.edu",
          password: "password123",
          emoji: "🌟",
          urlParam: "alex-1st"
        },
        {
          name: "Jordan Smith",
          grade: "7th Grade",
          school: "Ocean View Middle",
          description: "Advancing through middle school challenges",
          email: "jordan.smith@oceanview.plainviewisd.edu",
          password: "password123",
          emoji: "🌊",
          urlParam: "jordan-7th"
        },
        {
          name: "Taylor Johnson",
          grade: "10th Grade",
          school: "City View High",
          description: "Preparing for college and career paths",
          email: "taylor.johnson@cityview.plainviewisd.edu",
          password: "password123",
          emoji: "🏙️",
          urlParam: "taylor-10th"
        }
      ]
    },
    {
      title: "👩‍🏫 Teachers",
      icon: <BookOpen className="w-6 h-6" />,
      description: "Manage classrooms and track student progress",
      color: "from-emerald-500 to-teal-600",
      users: [
        {
          name: "Ms. Jenna Grain",
          grade: "K-2 Teacher",
          school: "Sand View Elementary",
          description: "Elementary educator focused on early literacy",
          email: "jenna.grain@sandview.plainviewisd.edu",
          password: "password123",
          emoji: "👩‍🏫",
          urlParam: "teacher-view"
        },
        {
          name: "Ms. Brenda Sea",
          grade: "Middle School",
          school: "Ocean View Middle",
          description: "Science teacher inspiring young minds",
          email: "brenda.sea@oceanview.plainviewisd.edu",
          password: "password123",
          emoji: "👩‍🔬",
          urlParam: "brenda-teacher"
        },
        {
          name: "Mr. John Land",
          grade: "High School",
          school: "City View High",
          description: "Math teacher preparing students for advanced topics",
          email: "john.land@cityview.plainviewisd.edu",
          password: "password123",
          emoji: "👨‍🏫",
          urlParam: "john-teacher"
        }
      ]
    },
    {
      title: "👨‍👩‍👧‍👦 Parents",
      icon: <UserCircle className="w-6 h-6" />,
      description: "Monitor your child's progress and support their learning",
      color: "from-purple-500 to-pink-600",
      users: [
        {
          name: "Sarah Davis",
          grade: "Parent",
          school: "Alex's Parent",
          description: "Supporting elementary learning at home",
          email: "sarah.davis@family.pathfinity.edu",
          password: "password123",
          emoji: "👩‍👧",
          urlParam: "sarah-parent"
        },
        {
          name: "Mike Brown",
          grade: "Parent",
          school: "Sam's Parent",
          description: "Engaged in kindergarten education",
          email: "mike.brown@family.pathfinity.edu",
          password: "password123",
          emoji: "👨‍👦",
          urlParam: "mike-parent"
        }
      ]
    },
    {
      title: "🏫 Administration",
      icon: <Building2 className="w-6 h-6" />,
      description: "School and district leadership dashboards",
      color: "from-gray-600 to-gray-800",
      users: [
        {
          name: "Dr. Maria Rodriguez",
          grade: "Principal",
          school: "Sand View Elementary",
          description: "School-level analytics and management",
          email: "principal@plainviewisd.edu",
          password: "password123",
          emoji: "🏫",
          urlParam: "principal"
        },
        {
          name: "Dr. James Wilson",
          grade: "Superintendent",
          school: "Plainview ISD",
          description: "District-wide oversight and strategy",
          email: "superintendent@plainviewisd.edu",
          password: "password123",
          emoji: "🎓",
          urlParam: "superintendent"
        }
      ]
    }
  ];

  const handleDemoSelect = (urlParam: string) => {
    // Navigate to login with demo parameters
    navigate(`/app/login?demo=true&user=${urlParam}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src="/images/pathfinity-logo-metallic-dark.png"
                alt="Pathfinity"
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Demo Experience Center
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose a persona to explore Pathfinity's features
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/app/login')}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Subscriber Login
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Plainview ISD Test Environment
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Experience Pathfinity from Every Perspective
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select a demo account below to explore how Pathfinity transforms education for students,
            empowers teachers, engages parents, and provides insights for administrators.
          </p>
        </div>

        {/* Demo Categories */}
        <div className="space-y-8">
          {demoCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {/* Category Header */}
              <div className={`bg-gradient-to-r ${category.color} p-4`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {category.title}
                    </h3>
                    <p className="text-sm text-white/80">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Users Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.users.map((user, userIndex) => (
                    <button
                      key={userIndex}
                      onClick={() => handleDemoSelect(user.urlParam)}
                      className="group relative p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 text-left border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-3xl">{user.emoji}</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                            {user.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.grade} • {user.school}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {user.description}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transform group-hover:translate-x-1 transition-transform" />
                      </div>

                      {/* Credentials Preview */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 dark:text-gray-400">Email:</span>
                            <span className="text-gray-700 dark:text-gray-300 font-mono text-[10px]">
                              {user.email}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500 dark:text-gray-400">Password:</span>
                            <span className="text-gray-700 dark:text-gray-300 font-mono">
                              ••••••••••••
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
          <div className="flex items-start space-x-2">
            <span className="text-amber-600 dark:text-amber-400">ℹ️</span>
            <div className="text-sm text-amber-800 dark:text-amber-200">
              <p className="font-semibold mb-1">Demo Environment Notice</p>
              <p>
                This is a demonstration environment with sample data. All student progress,
                grades, and analytics shown are simulated for testing purposes. No real
                student data is used or stored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DemoSelector;