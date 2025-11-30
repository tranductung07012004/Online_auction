import React from 'react';
import CountUp from 'react-countup';

// Định nghĩa interface cho props
interface RentedCounterBoxProps {
  end: number;
}

// Component với kiểu dữ liệu
const RentedCounterBox: React.FC<RentedCounterBoxProps> = ({ end }) => {
  return (
    <div className="w-[300px] h-[300px] bg-[#EAD9C9] rounded-tr-[50px] rounded-bl-[50px] rounded-br-[50px] flex flex-col items-center justify-center text-white">
      <h2 className="text-4xl font-bold">
        <CountUp start={0} end={end} duration={2.5} prefix="+" />
      </h2>
      <p className="mt-2 text-lg">Rented Dresses</p>
    </div>
  );
};

export default RentedCounterBox;