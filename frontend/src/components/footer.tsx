import logo from '../../public/LOGO.png';
  
export default function Footer() {
  // Get current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#EAD9C9]">
      <div className="container mx-auto px-4 py-8">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <img className="w-32 h-auto" src={logo} alt="Enchanted Weddings Logo" />
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-500">
          <p>Copyright © {currentYear}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}