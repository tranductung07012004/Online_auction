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
      title: "Book Appointment",
      description:
        "Book an appointment online or by phone for a personal consultation with our wedding dress experts.",
    },
    {
      icon: Sparkles,
      title: "Find Perfect Dress",
      description:
        "Our experts will help you explore and try on dresses that match your style, body type, and budget.",
    },
    {
      icon: Check,
      title: "Rent Dress",
      description: "Once you've found the perfect dress, you can rent it immediately with flexible rental periods from 3-7 days.",
    },
    {
      icon: Heart,
      title: "Shine on Your Wedding Day",
      description:
        "Receive your dress cleaned and carefully prepared, ready for you to shine on your special day.",
    },
  ]

  return (
    <section className="py-20 bg-[#f8f3ee]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl  mb-6">Our Process</h2>
          <div className="w-20 h-1 bg-[#c3937c] mx-auto mb-8"></div>
          <p className="text-lg text-[#404040]">
            We've created a simple and efficient process to help you find your dream wedding dress easily
            and stress-free.
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

