import { useLocation, useNavigate } from "react-router-dom";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { results, overallScore } = location.state || { results: [], overallScore: 0 };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-3xl">
        <h1 className="text-xl font-bold text-center mb-4">Interview Results</h1>

        {/* Overall Score */}
        <div className="mb-4 text-center bg-blue-100 p-2 rounded-md">
          <h2 className="text-lg font-semibold">Overall Score: {overallScore.toFixed(1)} / 10</h2>
        </div>

        {/* Question-wise Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {results.map((result, index) => (
            <div key={index} className="p-3 border rounded-lg bg-gray-50">
              <h3 className="font-semibold text-sm mb-1">Q{index + 1}: {result.question}</h3>
              <p className="text-xs text-gray-700"><strong>Answer:</strong> {result.answerQuality}</p>
              <p className="text-xs text-gray-700"><strong>Body Language:</strong> {result.bodyLanguage || "N/A"}</p>
              <p className="text-xs font-semibold"><strong>Score:</strong> {result.finalScore} / 10</p>
            </div>
          ))}
        </div>

        {/* Back to Home Button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
