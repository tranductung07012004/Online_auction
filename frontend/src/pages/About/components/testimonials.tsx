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
      date: "Tháng 6, 2023",
      text: "Tôi đã thuê váy cưới từ Enchanted Weddings cho đám cưới của mình và đó là quyết định tuyệt vời nhất! Chiếc váy hoàn hảo và dịch vụ thật sự xuất sắc. Mọi người đều khen ngợi váy của tôi và không ai có thể tin rằng đó là váy thuê.",
    },
    {
      name: "Thanh Thảo",
      image: "https://i.pinimg.com/736x/15/2d/ac/152dacf8f23167e4a16dd80db075f605.jpg",
      rating: 5,
      date: "Tháng 3, 2023",
      text: "Đội ngũ tại Enchanted Weddings thật sự tận tâm và chuyên nghiệp. Họ đã giúp tôi tìm được chiếc váy phù hợp nhất với vóc dáng và phong cách của tôi. Tôi cảm thấy như một nàng công chúa trong ngày cưới của mình!",
    },
    {
      name: "Minh Tú",
      image: "https://i.pinimg.com/736x/ce/7b/87/ce7b87665bf35272ca6b5d2fa4dfb632.jpg",
      rating: 5,
      date: "Tháng 12, 2022",
      text: "Tôi đã lo lắng về việc tìm váy cưới vì ngân sách hạn hẹp, nhưng Enchanted Weddings đã giúp tôi tiết kiệm rất nhiều mà vẫn có được chiếc váy trong mơ. Chất lượng váy và dịch vụ đều vượt xa mong đợi của tôi.",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl  mb-6">Khách hàng nói gì về chúng tôi</h2>
          <div className="w-20 h-1 bg-[#c3937c] mx-auto mb-8"></div>
          <p className="text-lg text-[#404040]">
            Hàng nghìn cô dâu đã tin tưởng Enchanted Weddings cho ngày trọng đại của họ. Đây là những gì họ nói về trải
            nghiệm của mình.
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

