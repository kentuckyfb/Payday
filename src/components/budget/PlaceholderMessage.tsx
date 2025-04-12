
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface PlaceholderMessageProps {
  icon: ReactNode;
  message: string;
  subMessage?: string;
  buttonText?: string;
  buttonAction?: () => void;
}

const PlaceholderMessage: React.FC<PlaceholderMessageProps> = ({
  icon,
  message,
  subMessage,
  buttonText,
  buttonAction,
}) => {
  return (
    <div className="text-center py-8 text-gray-400 rounded-lg border border-dashed border-gray-600 bg-white/5 my-4">
      <div className="mx-auto mb-4 opacity-50 flex justify-center">{icon}</div>
      <p className="font-medium">{message}</p>
      {subMessage && <p className="text-sm mt-1 mb-4">{subMessage}</p>}
      
      {buttonText && buttonAction && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={buttonAction}
          className="mt-3"
        >
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default PlaceholderMessage;
