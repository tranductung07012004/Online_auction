import React from 'react';
import CountUp from 'react-countup';

// Định nghĩa interface cho props
interface SatisfiedCounterBoxProps {
  end: number;
}

// Component với kiểu dữ liệu
const SatisfiedCounterBox: React.FC<SatisfiedCounterBoxProps> = ({ end }) => {
  return (
    <div className="w-[300px] h-[300px] bg-[#EAD9C9] rounded-bl-[50px] flex flex-col items-center justify-center text-white">
      <h2 className="text-4xl font-bold">
        <CountUp start={0} end={end} duration={2.5} prefix="+" />
      </h2>
      <p className="mt-2 text-lg">Satisfied Customer</p>
    </div>
  );
};

export default SatisfiedCounterBox;