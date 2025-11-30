import logo from '../../public/LOGO.png';
  
export default function Footer() {
  // Get current year for copyright
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#EAD9C9]">
          <div className="container mx-auto px-4 py-8">
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <img className="w-1/4 h-auto" src={logo} alt="Enchanted Weddings Logo" />
            </div>
    
            {/* Nội dung chính */}
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
              {/* 4 cột (text-left) */}
              <div className="grid grid-cols-2 md:grid-cols-4 ml-20 gap-4">
                <div className="text-left">
                  <h3 className="font-semibold mb-4 text-gray-800">The Services</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className='cursor-pointer hover:text-[#6164bc]'>How it works</li>
                    <li className='cursor-pointer hover:text-[#6164bc]'>FAQ</li>
                    <li className='cursor-pointer hover:text-[#6164bc]'>Our cleansing process</li>
                    <li className='cursor-pointer hover:text-[#6164bc]'>Professional consultation</li>
                    <li className='cursor-pointer hover:text-[#6164bc]'>Personalized dress for you</li>
                    <li className='cursor-pointer hover:text-[#6164bc]'>Return policy</li>
                    <li className='cursor-pointer hover:text-[#6164bc]'>Customize your dress size</li>
                  </ul>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-4 text-gray-800">The Company</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className='cursor-pointer hover:text-[#6164bc]'>Privacy policy</li>
                    <li className='cursor-pointer hover:text-[#6164bc]'>Personal information</li>
                    <li className='cursor-pointer hover:text-[#6164bc]'>Terms of service</li>
                    <li className='cursor-pointer hover:text-[#6164bc]'>Community</li>
                  </ul>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-4 text-gray-800">About us</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className='cursor-pointer hover:text-[#6164bc]'>Our story</li>
                    <li className='cursor-pointer hover:text-[#6164bc]'>Sustainability</li>
                    <li className='cursor-pointer hover:text-[#6164bc]'>Careers</li>
                  </ul>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold mb-4 text-gray-800">Supports</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className='cursor-pointer hover:text-[#6164bc]'>Email us</li>
                    <li className='cursor-pointer hover:text-[#6164bc]'>Help and contact</li>
                  </ul>
                </div>
              </div>
    
              {/* 3 khối bên phải (ta có thể để text-left hoặc text-center) */}
              <div className=" flex flex-col items-start gap-8 md:flex-row md:items-center lg:flex-col lg:items-start justify-center">
                <div className="text-left">
                  <h4 className="font-semibold mb-4 text-[#000000]">Mobile app</h4>
                  <button className="bg-[#C3937C] px-4 py-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2 cursor-pointer">
                    <img src="icon9.png" alt="AppleIcon"/>
                    <span className='text-[#FFFFFF] text-[16px]'>Download on the</span>
                    <span className='text-[#FFFFFF] text-[16px] font-[600]'>App Store</span>
                  </button>
                </div>
    
                <div className="text-left">
                  <h4 className="font-semibold mb-4 text-gray-800">Get 5% off</h4>
                  <button className="bg-[#C3937C] text-white px-4 py-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200 text-sm cursor-pointer">
                    Subscribe Now
                  </button>
                </div>
    
                <div className="text-left">
                  <h4 className="font-semibold mb-4 text-gray-800">
                    Stay connected with
                  </h4>
                  <div className="flex items-center gap-3">
                    <img className="cursor-pointer" src="icon10.png" alt="AppleIcon"/>
                    <img className="cursor-pointer" src="icon11.png" alt="AppleIcon"/>
                    <img className="cursor-pointer" src="icon12.png" alt="AppleIcon"/>
                  </div>
                </div>
              </div>
    
            </div>
    
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Copyright © {currentYear}. All rights reserved.</p>
            </div>
          </div>
    </footer>
  );
}