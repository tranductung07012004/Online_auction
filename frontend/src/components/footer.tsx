import logo from "/LOGO.png";

export default function Footer() {
  // Get current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#EAD9C9]">
      <div className="container mx-auto px-4 py-4">
        {/* Logo */}
        <div className="flex items-center justify-center mb-0">
          <div className="w-24 h-24 overflow-hidden rounded-lg">
            <img
              className="w-full h-full object-cover object-center"
              src={logo}
              alt="Enchanted Weddings Logo"
            />
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500">
          <p>Copyright © {currentYear}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
