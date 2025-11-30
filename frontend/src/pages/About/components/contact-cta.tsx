export function ContactCta() {
  return (
    <section className="py-20 bg-[#c3937c]">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl  mb-6 text-white">Sẵn sàng tìm váy cưới trong mơ của bạn?</h2>
        <p className="text-lg text-white/90 max-w-2xl mx-auto mb-10">
          Đặt lịch hẹn ngay hôm nay để được tư vấn cá nhân với chuyên gia váy cưới của chúng tôi. Chúng tôi sẽ giúp bạn
          tìm được chiếc váy hoàn hảo cho ngày trọng đại của mình.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/appointment"
            className="bg-white hover:bg-gray-100 text-[#c3937c] rounded-full px-8 py-3 font-medium transition-colors"
          >
            Đặt lịch hẹn
          </a>
        </div>
      </div>
    </section>
  )
}

