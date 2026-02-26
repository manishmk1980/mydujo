import React from 'react';
import { Link } from 'react-router-dom';
import { Sword, Send, Trophy, Volume2, AtSign } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-12 px-6 mt-12">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary p-2 rounded-lg">
              <Sword className="text-white size-4" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">MY<span className="text-primary">DOJO</span></h2>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Excellence in Martial Arts training since 1998. Dedicated to fostering strength, discipline, and community.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-6">Programs</h4>
          <ul className="space-y-4 text-slate-500 text-sm">
            <li><Link className="hover:text-primary" to="#">Karate for Kids</Link></li>
            <li><Link className="hover:text-primary" to="#">Adult Judo</Link></li>
            <li><Link className="hover:text-primary" to="#">Self Defense</Link></li>
            <li><Link className="hover:text-primary" to="#">Corporate Training</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Company</h4>
          <ul className="space-y-4 text-slate-500 text-sm">
            <li><Link className="hover:text-primary" to="#">Our Story</Link></li>
            <li><Link className="hover:text-primary" to="/instructors">Meet Instructors</Link></li>
            <li><Link className="hover:text-primary" to="#">Contact Locations</Link></li>
            <li><Link className="hover:text-primary" to="#">Privacy Policy</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6">Newsletter</h4>
          <p className="text-slate-500 text-sm mb-4">Stay updated with class schedules and events.</p>
          <div className="flex gap-2">
            <input 
              className="flex-1 rounded-lg border-slate-200 bg-white text-sm focus:ring-primary focus:border-primary px-3 py-2" 
              placeholder="Email address" 
              type="email"
            />
            <button className="px-4 py-2 bg-primary text-white rounded-lg">
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-slate-400 text-xs">© 2024 MyDojo Martial Arts Academy. All rights reserved.</p>
        <div className="flex gap-6">
          <Link className="text-slate-400 hover:text-primary transition-colors" to="#">
            <Trophy className="size-5" />
          </Link>
          <Link className="text-slate-400 hover:text-primary transition-colors" to="#">
            <Volume2 className="size-5" />
          </Link>
          <Link className="text-slate-400 hover:text-primary transition-colors" to="#">
            <AtSign className="size-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
