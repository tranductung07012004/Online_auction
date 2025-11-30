import React, { useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

// Định nghĩa kiểu cho mỗi item trong faqData
interface FAQItem {
  question: string;
  answer: string;
}

// Dữ liệu FAQ mẫu với kiểu đã định nghĩa
const faqData: FAQItem[] = [
  {
    question: "How long does shipping take?",
    answer:
      "Shipping usually takes 3-5 business days depending on your location. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee.",
  },
  {
    question: "What is included in the rental price?",
    answer:
      "Shipping usually takes 3-5 business days depending on your location. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Shipping usually takes 3-5 business days depending on your location. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee.",
  },
  {
    question: "Can I try on the dresses before renting?",
    answer:
      "Shipping usually takes 3-5 business days depending on your location. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee.",
  },
  {
    question: "How far in advance should I book my bridal dress?",
    answer:
      "Shipping usually takes 3-5 business days depending on your location. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee.",
  },
  {
    question: "What happens if the dress gets damaged?",
    answer:
      "Shipping usually takes 3-5 business days depending on your location. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee.",
  },
  {
    question: "Are there options for renting accessories?",
    answer:
      "Shipping usually takes 3-5 business days depending on your location. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee.",
  },
  {
    question: "How do I know what size to order?",
    answer:
      "Shipping usually takes 3-5 business days depending on your location. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee.",
  },
  {
    question: "Are there any additional fees for cleaning the dress?",
    answer:
      "Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee. Basic cleaning is included in the rental price. Heavy stains or damage may require an extra cleaning fee.",
  },
];

// Component với kiểu React.FC
const FAQSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Hàm toggleFAQ với tham số index kiểu number
  const toggleFAQ = (index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-12 bg-[#FBF8F1]">
      <div className="container mx-auto px-4">
        {/* Tiêu đề FAQ */}
        <h2 className="text-center text-[#C3937C] text-[32px] sm:text-3xl font-semibold mb-8">
          FAQ's
        </h2>

        {/* Grid 2 cột trên màn hình lớn */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqData.map((item, index) => (
            <div key={index} className="relative overflow-visible">
              {/* Câu hỏi */}
              <div
                onClick={() => toggleFAQ(index)}
                className="border rounded-md p-4 cursor-pointer transition-colors duration-200 bg-[#FFFFFF] 
                           hover:bg-[#b4bfb7] flex items-center justify-between"
              >
                <h3 className="font-[600] text-[16px] text-[#0C0C0C] sm:text-lg">
                  {item.question}
                </h3>
                {/* Dấu + hoặc - */}
                <span className="w-5 h-5">
                  {activeIndex === index ? (
                    <ChevronUpIcon />
                  ) : (
                    <ChevronDownIcon />
                  )}
                </span>
              </div>

              {/* Câu trả lời (absolute) */}
              {activeIndex === index && (
                <div
                  className="absolute left-0 top-full mt-2 w-full bg-white shadow-lg 
                              p-4 z-10 border rounded-md"
                >
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Phần "Still Have Question?" bên dưới */}
        {/* <div className="text-center mt-12">
          <h3 className="text-[24px] text-[#000000] font-semibold mb-2">Still Have Question?</h3>
          <p className="text-[#505050] text-[18px] mb-4">
            Contact us using the information below. We'll respond promptly
            to your inquiries and feedback.
          </p>

          <button className="bg-[#FFFFFF] text-[#C3937C] text-[18px] mx-auto px-4 py-2 rounded-[100px] shadow-md hover:bg-[#82438a] transition-colors duration-200 flex items-center gap-2 cursor-pointer">
            Shoot a Direct Message
            <img src="icon8.png" alt="Direct Message Icon" className="w-5 h-5" />
          </button>
        </div> */}
      </div>
    </section>
  );
};

export default FAQSection;