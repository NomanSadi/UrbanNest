import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-urban-green text-white pt-16 pb-8 px-6 md:px-12 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold tracking-tight">UrbanNest</h2>
          <p className="text-white/70 text-sm leading-relaxed font-medium">
            Finding your next home in Bangladesh made simple, smart, and secure. 
            Join thousands of happy renters today.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-6 text-lg tracking-tight">Learn More</h3>
          <ul className="space-y-3 text-white/70 text-sm font-medium">
            <li><a href="#" className="hover:text-white transition">About</a></li>
            <li><a href="#" className="hover:text-white transition">Verified Listings</a></li>
            <li><a href="#" className="hover:text-white transition">Rental Guide</a></li>
            <li><a href="#" className="hover:text-white transition">Careers</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-6 text-lg tracking-tight">Neighborhoods</h3>
          <ul className="space-y-3 text-white/70 text-sm font-medium">
            <li><a href="#" className="hover:text-white transition">Gulshan & Banani</a></li>
            <li><a href="#" className="hover:text-white transition">Dhanmondi</a></li>
            <li><a href="#" className="hover:text-white transition">Uttara</a></li>
            <li><a href="#" className="hover:text-white transition">Chittagong City</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-6 text-lg tracking-tight">Contact Us</h3>
          <p className="text-white/70 text-sm mb-2 font-medium">Support: support@urbannest.com.bd</p>
          <p className="text-white/70 text-sm font-medium">Helpline: +880 1700 000 000</p>
          
          <div className="flex gap-4 mt-8">
            <a href="#" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><i className="fab fa-facebook-f text-sm"></i></a>
            <a href="#" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><i className="fab fa-instagram text-sm"></i></a>
            <a href="#" className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><i className="fab fa-linkedin-in text-sm"></i></a>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/10 pt-8 text-center text-white/40 text-[10px] font-semibold uppercase tracking-widest">
        © 2025 UrbanNest | Dhaka, Bangladesh
      </div>
    </footer>
  );
};

export default Footer;