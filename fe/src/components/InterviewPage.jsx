import { useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function InterviewPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const questions = location.state?.questions || [];
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedQuestion, setSelectedQuestion] = useState(questions[0] || "");
    const [results, setResults] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [videoBlob, setVideoBlob] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    const [error, setError] = useState("");
    const videoRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    const isLastQuestion = currentIndex === questions.length - 1;
    
    // Check if current question is already answered or being processed
    const isQuestionAnswered = results.some(
        r => r.question === selectedQuestion && (r.finalScore !== "Processing..." && r.finalScore !== undefined)
    );
    const isQuestionProcessing = results.some(
        r => r.question === selectedQuestion && r.finalScore === "Processing..."
    );

    useEffect(() => {
        // Redirect if no questions are available
        if (!questions.length) {
            navigate("/", { replace: true });
            return;
        }

        let timer;
        if (isRecording) {
            setTimeLeft(120);
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRecording, questions, navigate]);

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedQuestion(questions[currentIndex + 1]);
            resetRecording();
            setError("");
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setSelectedQuestion(questions[currentIndex - 1]);
            resetRecording();
            setError("");
        }
    };

    const handleSkip = () => {
        if (isQuestionAnswered || isQuestionProcessing) {
            setError("This question has already been answered or is being processed.");
            return;
        }

        setResults((prev) => [
            ...prev,
            { 
                question: selectedQuestion, 
                answerQuality: "Skipped", 
                bodyLanguage: "N/A", 
                finalScore: 0 
            }
        ]);
        handleNext();
    };

    const startRecording = async () => {
        if (isQuestionAnswered || isQuestionProcessing) {
            setError("This question has already been answered or is being processed.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            recordedChunksRef.current = [];

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: "video/mp4" });
                setVideoBlob(blob);
                videoRef.current.srcObject = null;
                videoRef.current.src = URL.createObjectURL(blob);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setError("");
        } catch (error) {
            console.error("Error starting recording:", error);
            setError("Failed to access camera/microphone. Please check your permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
            setIsRecording(false);
        }
    };

    const resetRecording = () => {
        setVideoBlob(null);
        setIsRecording(false);
        setTimeLeft(120);
        setError("");
    };

    const handleSubmitVideo = async () => {
        if (isQuestionAnswered || isQuestionProcessing) {
            setError("This question has already been answered or is being processed.");
            return;
        }

        if (!videoBlob) {
            setError("Please record a video first!");
            return;
        }

        if (isProcessing) {
            setError("Please wait for the current video to finish processing.");
            return;
        }

        const currentQuestionIndex = currentIndex;
        setIsProcessing(true);
        setError("");

        // Add processing placeholder
        setResults((prev) => {
            const updatedResults = [...prev];
            updatedResults[currentQuestionIndex] = {
                question: selectedQuestion,
                answerQuality: "Processing...",
                bodyLanguage: "Processing...",
                finalScore: "Processing...",
            };
            return updatedResults;
        });

        const formData = new FormData();
        formData.append("video", videoBlob, "response.mp4");
        formData.append("questionText", selectedQuestion);

        resetRecording();
        handleNext();

        try {
            const response = await axios.post("http://localhost:5000/analyze", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setResults((prev) => {
                const updatedResults = [...prev];
                updatedResults[currentQuestionIndex] = response.data;
                return updatedResults;
            });
        } catch (error) {
            console.error("Error analyzing video:", error);
            setResults((prev) => {
                const updatedResults = [...prev];
                updatedResults[currentQuestionIndex] = {
                    question: selectedQuestion,
                    answerQuality: "Failed to process",
                    bodyLanguage: "Failed to process",
                    finalScore: 0,
                };
                return updatedResults;
            });
            setError("Failed to analyze video. Please try again or skip this question.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinish = () => {
        if (results.length < questions.length) {
            setError("Please answer or skip all questions before finishing.");
            return;
        }

        const overallScore = results.reduce((sum, r) => {
            const score = typeof r.finalScore === 'number' ? r.finalScore : 0;
            return sum + score;
        }, 0) / questions.length;
        
        navigate("/results", { state: { results, overallScore } });
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Left Panel: Question List & Selected Question */}
            <div className="w-1/3 bg-white shadow-lg p-6 flex flex-col">
                <h2 className="text-xl font-bold mb-4">Interview Questions</h2>

                <ul className="border rounded-md">
                    {questions.map((question, index) => {
                        const result = results.find(r => r.question === question);
                        const isAnswered = result && result.finalScore !== "Processing...";
                        const isProcessing = result && result.finalScore === "Processing...";

                        return (
                            <li
                                key={index}
                                className={`p-3 border-b flex justify-between items-center ${
                                    selectedQuestion === question ? "bg-blue-100" : "hover:bg-gray-200"
                                }`}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setSelectedQuestion(question);
                                    resetRecording();
                                }}
                            >
                                <span>Question {index + 1}</span>
                                {isProcessing ? (
                                    <span className="text-blue-500">Processing...</span>
                                ) : isAnswered ? (
                                    <span className="text-green-500 font-bold">✔</span>
                                ) : (
                                    <span className="text-gray-400">○</span>
                                )}
                            </li>
                        );
                    })}
                </ul>

                {/* Selected Question */}
                {selectedQuestion && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md shadow-sm">
                        <h3 className="text-lg font-semibold">Selected Question</h3>
                        <p className="mt-1 text-gray-700">{selectedQuestion}</p>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}
            </div>

            {/* Right Panel: Recording & Navigation */}
            <div className="w-2/3 flex flex-col items-center justify-center p-6">
                {/* Timer Display */}
                <div className="text-lg font-bold mb-4">Time Left: {timeLeft}s</div>

                {/* Camera Preview */}
                <div className="w-full max-w-2xl h-96 bg-black rounded-lg flex items-center justify-center shadow-lg relative">
                    <video ref={videoRef} className="w-full h-full object-cover rounded-lg" autoPlay muted />
                    {videoBlob && (
                        <video src={URL.createObjectURL(videoBlob)} controls className="absolute inset-0 w-full h-full rounded-lg" />
                    )}
                </div>

                {/* Recording Controls */}
                <div className="mt-6 flex gap-4">
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            disabled={isQuestionAnswered || isQuestionProcessing}
                            className="px-6 py-3 bg-red-500 text-white text-lg rounded hover:bg-red-600 disabled:opacity-50"
                        >
                            Start Recording
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="px-6 py-3 bg-red-700 text-white text-lg rounded hover:bg-red-800"
                        >
                            Stop Recording
                        </button>
                    )}

                    {videoBlob && (
                        <>
                            <button
                                onClick={handleSubmitVideo}
                                disabled={isProcessing || isQuestionAnswered || isQuestionProcessing}
                                className="px-6 py-3 bg-green-500 text-white text-lg rounded hover:bg-green-600 disabled:opacity-50"
                            >
                                {isProcessing ? "Processing..." : "Submit Video"}
                            </button>
                            <button
                                onClick={resetRecording}
                                disabled={isQuestionAnswered || isQuestionProcessing}
                                className="px-6 py-3 bg-blue-500 text-white text-lg rounded hover:bg-blue-600 disabled:opacity-50"
                            >
                                Retry Video
                            </button>
                        </>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-8 w-full max-w-2xl flex justify-between gap-4">
                    <button
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                        className="px-6 py-3 bg-gray-300 text-gray-700 text-lg rounded hover:bg-gray-400 disabled:opacity-50"
                    >
                        Previous
                    </button>

                    <button
                        onClick={handleSkip}
                        disabled={isQuestionAnswered || isQuestionProcessing}
                        className="px-6 py-3 bg-yellow-400 text-white text-lg rounded hover:bg-yellow-500 disabled:opacity-50"
                    >
                        Skip
                    </button>

                    {isLastQuestion ? (
                        <button
                            onClick={handleFinish}
                            disabled={results.length < questions.length || isProcessing}
                            className={`px-6 py-3 text-lg rounded ${
                                results.length < questions.length || isProcessing
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-purple-500 text-white hover:bg-purple-600"
                            }`}
                        >
                            Finish
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="px-6 py-3 bg-gray-300 text-gray-700 text-lg rounded hover:bg-gray-400"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}