import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">ContentScheduler</h1>
            <div className="flex space-x-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                🔒 Zero Vulnerabilities
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                ✅ Chrome Safe
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                🚀 Next.js 15
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">
            Schedule Your Content
            <span className="text-blue-600 block">Securely & Efficiently</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Professional content scheduling platform with enterprise-grade security, 
            zero vulnerabilities, and seamless LinkedIn integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/schedule"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Scheduling →
            </a>
            <a 
              href="/landing"
              className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose ContentScheduler?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="text-xl font-semibold mb-3">Enterprise Security</h4>
              <p className="text-gray-600">
                Zero known vulnerabilities with regular security audits and Next.js 15 security features.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-semibold mb-3">Lightning Fast</h4>
              <p className="text-gray-600">
                Built with Next.js 15 and React 19 for optimal performance and user experience.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🔗</div>
              <h4 className="text-xl font-semibold mb-3">LinkedIn Integration</h4>
              <p className="text-gray-600">
                Seamless LinkedIn connectivity with secure OAuth authentication and content publishing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto text-center px-4">
          <p className="mb-4">
            © 2024 ContentScheduler - Secure, Fast, Reliable Content Management
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <span>✅ Security Verified</span>
            <span>🚀 Performance Optimized</span>
            <span>🔒 Privacy Protected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
