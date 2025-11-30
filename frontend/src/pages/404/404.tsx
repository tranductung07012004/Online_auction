import Header from '../../components/header';
import Footer from '../../components/footer';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* 404 Section */}
      <main className="flex-grow">
        <div className="relative h-[500px] md:h-[600px] w-full">
          <div className="absolute inset-0 bg-black/60 z-10">
            <img
              src="/placeholder.svg?height=600&width=1200"
              alt="Wedding dress background"
              className="object-cover brightness-50 w-full h-full"
            />
          </div>

          <div className="relative z-20 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="text-3xl md:text-4xl font-light mb-4">Sorry, The page you are looking for was not found!</h1>
            <div className="text-6xl md:text-8xl font-bold my-6">404</div>
            <a
              href="/"
              className="mt-6 inline-block px-6 py-3 rounded-full bg-white text-gray-800 hover:bg-primary hover:text-white transition-colors"
            >
              Go Back Home Page
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

