import React from 'react';
import { Button } from '../ui/button';
import { Play, Square } from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({ isRunning, onStart, onStop }) => {
  return (
    <div className="flex justify-center space-x-4 mt-4">
      {!isRunning ? (
        <Button 
          onClick={onStart}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <Play className="mr-2 h-5 w-5" />
          Start Timer
        </Button>
      ) : (
        <Button 
          onClick={onStop}
          variant="destructive"
          size="lg"
        >
          <Square className="mr-2 h-5 w-5" />
          Stop Timer
        </Button>
      )}
    </div>
  );
};

export default TimerControls;
