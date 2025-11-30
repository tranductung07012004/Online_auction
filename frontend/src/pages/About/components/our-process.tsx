import type React from "react"
import { Check, Calendar, Sparkles, Heart } from "lucide-react"

interface ProcessStep {
  icon: React.ElementType
  title: string
  description: string
}

export function OurProcess() {
  const steps: ProcessStep[] = [
    {
      icon: Calendar,
      title: "Đặt lịch hẹn",
      description:
        "Đặt lịch hẹn trực tuyến hoặc qua điện thoại để được tư vấn cá nhân với chuyên gia váy cưới của chúng tôi.",
    },
    {
      icon: Sparkles,
      title: "Tìm váy hoàn hảo",
      description:
        "Chuyên gia của chúng tôi sẽ giúp bạn khám phá và thử các mẫu váy phù hợp với phong cách, vóc dáng và ngân sách của bạn.",
    },
    {
      icon: Check,
      title: "Đặt thuê váy",
      description: "Khi đã tìm được chiếc váy hoàn hảo, bạn có thể đặt thuê ngay với thời gian linh hoạt từ 3-7 ngày.",
    },
    {
      icon: Heart,
      title: "Tỏa sáng trong ngày cưới",
      description:
        "Nhận váy đã được vệ sinh và chuẩn bị kỹ lưỡng, sẵn sàng để bạn tỏa sáng trong ngày trọng đại của mình.",
    },
  ]

  return (
    <section className="py-20 bg-[#f8f3ee]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl  mb-6">Quy trình của chúng tôi</h2>
          <div className="w-20 h-1 bg-[#c3937c] mx-auto mb-8"></div>
          <p className="text-lg text-[#404040]">
            Chúng tôi đã tạo ra một quy trình đơn giản và hiệu quả để giúp bạn tìm được chiếc váy cưới trong mơ một cách
            dễ dàng và không căng thẳng.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white rounded-lg p-8 text-center shadow-md">
              <div className="w-16 h-16 bg-[#c3937c]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <step.icon className="h-8 w-8 text-[#c3937c]" />
              </div>
              <h3 className="text-xl  mb-4">{step.title}</h3>
              <p className="text-[#404040]">{step.description}</p>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2">
                  <div className="w-8 h-1 bg-[#c3937c]"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* <div className="mt-16 text-center">
          <a
            href="/booking"
            className="inline-flex items-center bg-[#c3937c] hover:bg-[#a67563] text-white rounded-full px-8 py-3 font-medium transition-colors"
          >
            Đặt lịch hẹn ngay
          </a>
        </div> */}
      </div>
    </section>
  )
}

