import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, ImageIcon, Smartphone, Github, Send } from 'lucide-react';

const navItems = [
  { name: 'HOME', icon: Sparkles, path: '/' },
  { name: 'ABOUT', icon: MessageSquare, path: '/about' },
  { name: 'GALLERY', icon: ImageIcon, path: '/gallery' },
  { name: 'APPS', icon: Smartphone, path: '/apps' },
  { name: 'CONTACT', icon: Github, path: '/contact' },
  { name: 'FEEDBACK', icon: Send, path: '/feedback' }
];

export const NavigationCards = ({ onNavigate }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl px-4 mt-12">
    {navItems.map((item, i) => (
      <motion.button
        key={item.name}
        onClick={() => onNavigate(item.name.toLowerCase())}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: i * 0.1 }}
        className="glass-card p-6 flex flex-col items-center justify-center gap-3 group hover:border-purple-500/50 transition-all active:scale-95 text-left"
      >
        <item.icon className="text-purple-500 group-hover:scale-110 transition-transform" size={24} />
        <span className="text-xs font-black tracking-widest text-zinc-400 group-hover:text-white transition-colors">
          {item.name}
        </span>
      </motion.button>
    ))}
  </div>
);
