
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-urban-green text-white pt-16 pb-8 px-6 md:px-12 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold">UrbanNest</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Finding your next home in Bangladesh made simple, smart, and secure. 
            Join thousands of happy renters today.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold mb-6 text-lg">Learn More</h3>
          <ul className="space-y-3 text-white/70 text-sm">
            <li><a href="#" className="hover:text-white transition">About Lift</a></li>
            <li><a href="#" className="hover:text-white transition">Press Releases</a></li>
            <li><a href="#" className="hover:text-white transition">Environment</a></li>
            <li><a href="#" className="hover:text-white transition">Jobs</a></li>
            <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-6 text-lg">Tickets & Booking</h3>
          <ul className="space-y-3 text-white/70 text-sm">
            <li><a href="#" className="hover:text-white transition">Lift Tickets</a></li>
            <li><a href="#" className="hover:text-white transition">Season Passes</a></li>
            <li><a href="#" className="hover:text-white transition">Vacation Packages</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-6 text-lg">Contact Us</h3>
          <p className="text-white/70 text-sm mb-4">Hotline: 123-456-7890</p>
          <p className="text-white/70 text-sm">Query: 123-456-7890</p>
          
          <div className="flex gap-4 mt-8">
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">f</a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">i</a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">t</a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">y</a>
          </div>
        </div>
      </div>
      
      <div className="border-t border-white/10 pt-8 text-center text-white/50 text-xs">
        © 2025 UrbanNest | All Rights Reserved
      </div>
    </footer>
  );
};

export default Footer;
