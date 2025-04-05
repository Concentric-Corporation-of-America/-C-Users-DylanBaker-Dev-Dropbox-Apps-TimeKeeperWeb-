import React from 'react';
import Timer from '../components/timer/Timer';

const TimerPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Timer</h1>
      <Timer />
    </div>
  );
};

export default TimerPage;
