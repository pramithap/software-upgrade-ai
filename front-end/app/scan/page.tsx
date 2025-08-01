export default function ScanPage() {
  return (
    <div className="bg-gradient-to-b from-[#1A237E]/10 to-transparent">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-[#1A237E]">Scan Your Codebase</h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <p className="text-lg mb-4 text-gray-600">Start a new scan of your repositories to analyze dependencies and identify upgrade opportunities.</p>
          {/* Add scan functionality here */}
        </div>
      </div>
    </div>
  );
}
