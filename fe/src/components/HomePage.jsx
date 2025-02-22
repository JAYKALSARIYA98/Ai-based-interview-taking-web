import React from 'react';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, PlayCircle } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-600 to-blue-600 text-white overflow-hidden">
      <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] mix-blend-overlay opacity-10" />
      
      <motion.div 
        className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 md:p-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          variants={itemVariants}
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 mb-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">AI-Powered Interview Assistant</span>
          </motion.div>

          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100"
            variants={itemVariants}
          >
            Master Your Interview Skills
            <br />with AI Guidance
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-blue-100/90 mb-8 leading-relaxed"
            variants={itemVariants}
          >
            Experience the future of interview preparation with real-time AI analysis.
            Get instant feedback, improve your confidence, and ace your next interview.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div 
            className="flex flex-col md:flex-row gap-4 justify-center items-center"
            variants={itemVariants}
          >
            <motion.button
              className="group relative px-8 py-4 text-lg font-semibold bg-white text-purple-700 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-150 overflow-hidden"
              onClick={() => navigate("/question-form")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="relative z-10 flex items-center">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white to-blue-100"
                initial={false}
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            </motion.button>

            <motion.button
              className="flex items-center px-6 py-4 text-lg font-medium bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <PlayCircle className="w-5 h-5 mr-2" />
              Watch Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="mt-16 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            {
              title: "Real-time Analysis",
              description: "Get instant feedback on your interview performance"
            },
            {
              title: "Body Language",
              description: "Improve your non-verbal communication skills"
            },
            {
              title: "Detailed Reports",
              description: "Receive comprehensive performance analytics"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-blue-100/80">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 bg-white/5 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
                x: [0, 100, 0],
                y: [0, 100, 0],
              }}
              transition={{
                duration: 15 + i * 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}