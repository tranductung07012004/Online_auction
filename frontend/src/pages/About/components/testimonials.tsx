import { Star } from "lucide-react"

interface Testimonial {
  name: string
  image: string
  rating: number
  date: string
  text: string
}

export function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      name: "Ngọc Linh",
      image: "https://i.pinimg.com/736x/ab/02/11/ab0211aa51e8f13cf12ba981e2f698f9.jpg",
      rating: 5,
      date: "June 2023",
      text: "I rented my wedding dress from Enchanted Weddings for my wedding and it was the best decision! The dress was perfect and the service was truly excellent. Everyone complimented my dress and no one could believe it was rented.",
    },
    {
      name: "Thanh Thảo",
      image: "https://i.pinimg.com/736x/15/2d/ac/152dacf8f23167e4a16dd80db075f605.jpg",
      rating: 5,
      date: "March 2023",
      text: "The team at Enchanted Weddings is truly dedicated and professional. They helped me find the perfect dress that matched my body type and style. I felt like a princess on my wedding day!",
    },
    {
      name: "Minh Tú",
      image: "https://i.pinimg.com/736x/ce/7b/87/ce7b87665bf35272ca6b5d2fa4dfb632.jpg",
      rating: 5,
      date: "December 2022",
      text: "I was worried about finding a wedding dress because of my limited budget, but Enchanted Weddings helped me save a lot while still getting my dream dress. The dress quality and service both exceeded my expectations.",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl  mb-6">What Our Customers Say</h2>
          <div className="w-20 h-1 bg-[#c3937c] mx-auto mb-8"></div>
          <p className="text-lg text-[#404040]">
            Thousands of brides have trusted Enchanted Weddings for their special day. Here's what they say about their
            experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-8 shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image || "/placeholder.svg"}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className=" text-lg">{testimonial.name}</h3>
                  <p className="text-sm text-[#404040]">{testimonial.date}</p>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < testimonial.rating ? "text-[#c3937c] fill-[#c3937c]" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[#404040] italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

