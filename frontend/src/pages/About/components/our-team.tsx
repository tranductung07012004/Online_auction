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
      bio: "With over 15 years of experience in the wedding fashion industry, Nguyễn Minh Triết has built Enchanted Weddings from a small idea into a leading company in the premium wedding dress rental field.",
    },
    {
      name: "Đỗ Hải Yến",
      role: "Creative Director",
      image: "/yen.jpg",
      bio: "Đỗ Hải Yến brings creative vision and passion for wedding fashion. She is responsible for selecting and developing our diverse wedding dress collection.",
    },
    {
      name: "Trần Tiến Lợi",
      role: "Head of Operations",
      image: "/loi.jpg",
      bio: "Trần Tiến Lợi ensures that every process from booking appointments to dress delivery runs smoothly, providing a perfect experience for customers.",
    },
    {
      name: "Trần Đức Tùng",
      role: "Lead Bridal Consultant",
      image: "/tung.jpg",
      bio: "With an aesthetic eye and deep understanding, Trần Đức Tùng has helped thousands of brides find the perfect wedding dress for their special day.",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl  mb-6">Our Team</h2>
          <div className="w-20 h-1 bg-[#c3937c] mx-auto mb-8"></div>
          <p className="text-lg text-[#404040]">
            Meet the talented and passionate people behind Enchanted Weddings. We are a professional
            team with a mission to help every bride shine on her wedding day.
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

