interface TeamMember {
  name: string
  role: string
  image: string
  bio: string
}

export function OurTeam() {
  const teamMembers: TeamMember[] = [
    {
      name: "Nguyễn Minh Triết",
      role: "Founder & CEO",
      image: "/triet.jpg",
      bio: "Với hơn 15 năm kinh nghiệm trong ngành thời trang cưới, Nguyễn Minh Triết đã xây dựng Enchanted Weddings từ một ý tưởng nhỏ thành công ty hàng đầu trong lĩnh vực cho thuê váy cưới cao cấp.",
    },
    {
      name: "Đỗ Hải Yến",
      role: "Creative Director",
      image: "/yen.jpg",
      bio: "Đỗ Hải Yến mang đến tầm nhìn sáng tạo và đam mê với thời trang cưới. Cô chịu trách nhiệm lựa chọn và phát triển bộ sưu tập váy cưới đa dạng của chúng tôi.",
    },
    {
      name: "Trần Tiến Lợi",
      role: "Head of Operations",
      image: "/loi.jpg",
      bio: "Trần Tiến Lợi đảm bảo mọi quy trình từ đặt lịch hẹn đến giao nhận váy cưới đều diễn ra suôn sẻ, mang đến trải nghiệm hoàn hảo cho khách hàng.",
    },
    {
      name: "Trần Đức Tùng",
      role: "Lead Bridal Consultant",
      image: "/tung.jpg",
      bio: "Với con mắt thẩm mỹ tinh tế và sự thấu hiểu sâu sắc, Trần Đức Tùng đã giúp hàng nghìn cô dâu tìm được chiếc váy cưới hoàn hảo cho ngày trọng đại của họ.",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl  mb-6">Đội ngũ của chúng tôi</h2>
          <div className="w-20 h-1 bg-[#c3937c] mx-auto mb-8"></div>
          <p className="text-lg text-[#404040]">
            Gặp gỡ những con người tài năng và đam mê đứng sau Enchanted Weddings. Chúng tôi là một đội ngũ chuyên
            nghiệp với sứ mệnh giúp mỗi cô dâu tỏa sáng trong ngày cưới của mình.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:-translate-y-2"
            >
              <img
                src={member.image || "/placeholder.svg"}
                alt={member.name}
                className="w-full h-80 object-cover object-center"
              />
              <div className="p-6">
                <h3 className="text-xl  mb-1">{member.name}</h3>
                <p className="text-[#c3937c] font-medium mb-4">{member.role}</p>
                <p className="text-[#404040]">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

