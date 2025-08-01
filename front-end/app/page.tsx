
export default function Home() {
  return (
    <div className="bg-gradient-to-b from-[#2C1810]/10 to-transparent">
      <div className="container mx-auto px-6">
        {/* Hero Section */}
        <div className="py-20 text-center">
          <h1 className="text-5xl font-bold mb-6 text-[#2C1810]">
            Intelligent Software Upgrades
          </h1>
          <p className="text-xl mb-12 text-gray-600">
            Revolutionize your upgrade process with AI-powered insights
          </p>
          <a
            href="/scan"
            className="bg-[#2C1810] text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-[#1A0D09] transition-colors"
          >
            Start Scanning
          </a>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-8 py-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-[#2C1810]">Smart Dependency Analysis</h2>
            <p className="text-gray-600 leading-relaxed">
              An AI-driven assistant that scans your codebase(s), identifies current tech/library versions (e.g., Node.js, Axis2, Java, Ant, Chemaxon), and provides smart upgrade paths optimized for security, compatibility, platform constraints, and future-proofing.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-[#2C1810]">Complex Upgrades Made Simple</h2>
            <p className="text-gray-600 leading-relaxed">
              Manual upgrades are painful, especially in large, legacy or polyglot codebases. We simplify the process with intelligent automation and clear upgrade paths.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-[#2C1810]">Environmental Awareness</h2>
            <p className="text-gray-600 leading-relaxed">
              Dependency trees and environment-specific constraints (OS, containers, infra) lead to failed upgrades, delays, and technical debt. Our AI considers your entire ecosystem.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold mb-4 text-[#2C1810]">Holistic Upgrade Strategy</h2>
            <p className="text-gray-600 leading-relaxed">
              Unlike existing tools that only check one repo at a time, we provide comprehensive cross-system upgrade recommendations while considering your deployment environment limitations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
