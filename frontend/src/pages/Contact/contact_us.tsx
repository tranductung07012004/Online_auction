import { Phone, Mail } from "lucide-react"
import Header from '../../components/header';
import Footer from '../../components/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto flex-grow px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Image with Contact Info */}
          <div className="relative rounded-lg overflow-hidden">
            <img
              src="/placeholder.svg?height=600&width=600"
              alt="Bride in wedding dress"
              width={600}
              height={600}
              className="w-full h-full object-cover brightness-75"
            />
            <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center p-8 text-white">
              <h2 className="text-xl font-medium mb-6">Contact Info:</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5" />
                  <p>Call Direction: +1-234-9898</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5" />
                  <p>Email: enchanted@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="space-y-6">
            <h1 className="text-3xl font-medium text-[#c3937c]">Contact us</h1>
            <form className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full p-4 border border-[#dfdfdf] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-4 border border-[#dfdfdf] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="Phone number"
                  className="w-full p-4 border border-[#dfdfdf] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                />
              </div>
              <div>
                <textarea
                  placeholder="Message"
                  rows={8}
                  className="w-full p-4 border border-[#dfdfdf] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#c3937c]"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-[#fbf8f1] text-[#c3937c] font-medium rounded-lg hover:bg-[#ead9c9] transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
