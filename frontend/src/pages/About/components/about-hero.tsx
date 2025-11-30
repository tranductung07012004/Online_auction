export function AboutHero() {
  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://i.pinimg.com/736x/db/2c/e0/db2ce0c6e4997897ddb885a9a5615a08.jpg')",
          backgroundPosition: "center 30%",
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl md:text-5xl lg:text-6xl  mb-6">Về Enchanted Weddings</h1>
        <p className="text-lg md:text-xl max-w-2xl">
          Chúng tôi biến những giấc mơ thành hiện thực với bộ sưu tập váy cưới cho thuê đẳng cấp và dịch vụ tận tâm
        </p>
      </div>
    </div>
  )
}

