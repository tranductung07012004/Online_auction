import React, { useState, useEffect } from 'react';

// Định nghĩa interface cho testimonial
interface Testimonial {
  id: number;
  name: string;
  feedback: string;
  avatar: string;
}

// Component với kiểu React.FC
const TestimonialsSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Roselina Stepheny",
      feedback:
        "I just wanted to share a quick note and let you know that your company did a really good job. I'm glad I decided to choose or bride as my wedding day, it's really great how easy your website is to update and manage. I never have any problem at all during choosing my dress, receive it and then returned it to you back, in addition whatever you said in your website as a consultation, online ... comes true, I really recommended you to everyone. I never have any problem at all during choosing my dress, receive it and then returned it to you back, in addition whatever you said in your website as a consultation, online ... comes true, I really recommended you to everyone.I never have any problem at all during choosing my dress, receive it and then returned it to you back, in addition whatever you said in your website as a consultation, online ... comes true, I really recommended you to everyone.",
      avatar: "avt1.jpg",
    },
    {
      id: 2,
      name: "John Doe",
      feedback:
        "Working with this company has been an absolute pleasure. Their attention to detail and commitment to customer satisfaction is top-notch. Highly recommended!",
      avatar: "avt2.jpg",
    },
    {
      id: 3,
      name: "Jane Smith",
      feedback:
        "The process was super easy and straightforward. The team was very supportive, and the result exceeded my expectations. Will definitely come back again!",
      avatar: "avt3.jpg",
    },
    {
      id: 4,
      name: "Citadel",
      feedback:
        "The process was super easy and straightforward. The team was very supportive, and the result exceeded my expectations. Will definitely come back again!",
      avatar: "avt3.jpg",
    },
    {
      id: 5,
      name: "Citadel5",
      feedback:
        "The process was super easy and straightforward. The team was very supportive, and the result exceeded my expectations. Will definitely come back again!",
      avatar: "avt3.jpg",
    },
    {
      id: 6,
      name: "Citadel6",
      feedback:
        "The process was super easy and straightforward. The team was very supportive, and the result exceeded my expectations. Will definitely come back again!",
      avatar: "avt3.jpg",
    },
    {
      id: 7,
      name: "John Doe7",
      feedback:
        "Working with this company has been an absolute pleasure. Their attention to detail and commitment to customer satisfaction is top-notch. Highly recommended!",
      avatar: "avt2.jpg",
    },
    {
      id: 8,
      name: "Jane Smith8",
      feedback:
        "The process was super easy and straightforward. The team was very supportive, and the result exceeded my expectations. Will definitely come back again!",
      avatar: "avt3.jpg",
    },
    {
      id: 9,
      name: "Citadel9",
      feedback:
        "The process was super easy and straightforward. The team was very supportive, and the result exceeded my expectations. Will definitely come back again!",
      avatar: "avt3.jpg",
    },
    {
      id: 10,
      name: "Citadel10",
      feedback:
        "The process was super easy and straightforward. The team was very supportive, and the result exceeded my expectations. Will definitely come back again!",
      avatar: "avt3.jpg",
    },
    {
      id: 11,
      name: "Citadel11",
      feedback:
        "The process was super easy and straightforward. The team was very supportive, and the result exceeded my expectations. Will definitely come back again!",
      avatar: "avt3.jpg",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [readMore, setReadMore] = useState<boolean>(false);

  useEffect(() => {
    setReadMore(false);
  }, [currentIndex]);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const { name, feedback, avatar } = testimonials[currentIndex];
  const TRUNCATE_LENGTH = 200;
  const isLongFeedback = feedback.length > TRUNCATE_LENGTH;
  const displayedFeedback =
    !readMore && isLongFeedback ? feedback.slice(0, TRUNCATE_LENGTH) + "..." : feedback;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-8">
          What Our Customers Are Saying
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prevTestimonial}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer"
            >
              ←
            </button>
            <div className="flex-1 text-center">
              <div className="max-w-2xl mx-auto">
                <p className="text-gray-600 text-lg mb-2 min-h-[160px] flex flex-col items-center justify-center">
                  {displayedFeedback}
                  {isLongFeedback && (
                    <span
                      onClick={() => setReadMore(prev => !prev)}
                      className="text-blue-500 cursor-pointer mt-2"
                    >
                      {readMore ? "Read less" : "Read more"}
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <img
                  src={avatar}
                  alt={name}
                  className="w-20 h-20 object-cover rounded-full mb-2"
                />
                <p className="font-semibold text-gray-800">{name}</p>
              </div>
            </div>
            <button
              onClick={nextTestimonial}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;