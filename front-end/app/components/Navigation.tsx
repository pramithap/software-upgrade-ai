export default function Navigation() {
  return (
    <nav className="bg-gradient-to-r from-[#1A237E] via-[#283593] to-[#1A237E] text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <a href="/" className="flex items-center group">
              <div className="bg-white/10 rounded-lg p-2 backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
                <svg 
                  className="w-8 h-8 text-white group-hover:text-white/80 transition-colors" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-xl font-bold tracking-tight group-hover:text-white/80 transition-all duration-300 transform group-hover:translate-x-1">
                  CodeCare AI
                </div>
                <div className="text-xs text-white/80 font-medium">
                  AI-powered Software Upgrade Assistant
                </div>
              </div>
            </a>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center">
            <div className="flex items-center">
              <a href="/scan" className="px-4 py-2 font-semibold hover:bg-white/10 transition-all duration-300 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Scan</span>
              </a>
              <span className="text-white/30 mx-1">|</span>
              <a href="/repositories" className="px-4 py-2 font-semibold hover:bg-white/10 transition-all duration-300 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>Repositories</span>
              </a>
              <span className="text-white/30 mx-1">|</span>
              <a href="/dependency-graph" className="px-4 py-2 font-semibold hover:bg-white/10 transition-all duration-300 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <span>Dependency Graph</span>
              </a>
              <span className="text-white/30 mx-1">|</span>
              <a href="/recommendations" className="px-4 py-2 font-semibold hover:bg-white/10 transition-all duration-300 flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Recommendations</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
