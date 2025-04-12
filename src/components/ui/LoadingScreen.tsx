
import React from "react";
import { Loader } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-payday-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-payday-purple">P</span>
          </div>
          <Loader className="h-full w-full animate-spin text-payday-purple opacity-70" strokeWidth={1.5} />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gradient">Payday</h1>
        <p className="text-sm text-gray-400">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
