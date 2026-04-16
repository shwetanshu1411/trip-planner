import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, Map, Compass, Luggage, Camera, Coffee, Sun, Cloud } from 'lucide-react';

const loadingSteps = [
  { icon: <Compass className="w-8 h-8" />, text: "Finding hidden gems..." },
  { icon: <Map className="w-8 h-8" />, text: "Mapping out the best routes..." },
  { icon: <Luggage className="w-8 h-8" />, text: "Packing virtual bags..." },
  { icon: <Camera className="w-8 h-8" />, text: "Scouting photo spots..." },
  { icon: <Coffee className="w-8 h-8" />, text: "Finding local cafes..." },
  { icon: <Sun className="w-8 h-8" />, text: "Checking the weather..." },
  { icon: <Cloud className="w-8 h-8" />, text: "Consulting the stars..." },
  { icon: <Plane className="w-8 h-8" />, text: "Finalizing your adventure..." },
];

const LoadingItinerary: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % loadingSteps.length);
    }, 2500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 5;
      });
    }, 500);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 px-4">
      <div className="relative w-48 h-48 mb-12">
        {/* Animated Background Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-dashed border-primary/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-2 border-dotted border-primary/10 rounded-full"
        />

        {/* Central Icon Animation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 45 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="text-primary"
            >
              {loadingSteps[currentStep].icon}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Flying Plane Animation */}
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <motion.div 
            className="absolute -top-2 left-1/2 -ml-3 text-primary"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Plane className="w-6 h-6 rotate-90" />
          </motion.div>
        </motion.div>
      </div>

      <div className="text-center space-y-6 max-w-md w-full">
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900">Crafting Your Journey</h3>
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-slate-500 font-medium h-6"
            >
              {loadingSteps[currentStep].text}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>Departure</span>
            <span>Arrival</span>
          </div>
        </div>

        <div className="pt-8">
          <p className="text-xs text-slate-400 italic">
            "The world is a book and those who do not travel read only one page."
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingItinerary;
