export function OurStory() {
  return (
    <section className="py-20 bg-[#f8f3ee]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl  mb-6">Our Story</h2>
          <div className="w-20 h-1 bg-[#c3937c] mx-auto mb-8"></div>
          <p className="text-lg text-[#404040] mb-6">
            Enchanted Weddings was born in 2015 with a simple mission: to help every bride access the most beautiful
            wedding dresses without having to spend a large amount of money.
          </p>
          <p className="text-lg text-[#404040]">
            We believe that every bride deserves to have her dream wedding dress for her special day. With our
            premium wedding dress rental service, we have helped over 10,000 brides across the country shine on
            their wedding day.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src="https://i.pinimg.com/736x/4c/4c/5e/4c4c5e12c4f95fdccd7162f4151ad8f2.jpg"
              alt="Founder of Enchanted Weddings"
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
          <div>
            <h3 className="text-2xl  mb-4">From Dream to Reality</h3>
            <p className="text-[#404040] mb-6">
              Everything started when our founder, Nguyễn Minh Triết, realized that many brides had to give up their dream
              wedding dress because the cost was too high. With a background in fashion and a passion for wedding dresses,
              she decided to create a solution.
            </p>
            <p className="text-[#404040] mb-6">
              "I believe that every bride deserves to feel special and confident on her wedding day, without having to
              worry about the cost," Nguyễn Minh Triết shares. "That's why we started Enchanted Weddings - to make
              dreams come true."
            </p>
            <p className="text-[#404040]">
              Today, Enchanted Weddings proudly has a collection of over 500 wedding dress designs from world-renowned
              designers, along with a team of dedicated consultants helping each bride find the perfect dress for her
              special day.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

