import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/HomePage";
import QuestionForm from "./components/QuestionForm";
import InterviewPage from "./components/InterviewPage";
import ResultsPage from "./components/ResultsPage";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/question-form" element={<QuestionForm />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/results" element={<ResultsPage />} />

      </Routes>
    </Router>
  );
}
