import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Lock, Send, Smartphone, MessageSquare,
  Image as ImageIcon, Video, Github, Linkedin, Instagram,
  ExternalLink, Sparkles, Download, Upload, Loader2,
  CheckCircle2, AlertCircle, Trash2
} from 'lucide-react';
import nithishImg from '@assets/bg_removed_nithish_1768310368786.png';
import { listFolder, uploadFile, getTemporaryLink, deleteFile } from './services/dropbox';
import { NavigationCards } from './components/NavigationCards';

const Navbar = ({ isOpen, setIsOpen, onNavigate }) => (
  <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center bg-zinc-900/90 backdrop-blur-xl border-b border-purple-500/30 overflow-hidden group">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: '100%' }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent"
    />

    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => onNavigate('home')}
      className="text-xl md:text-2xl font-black tracking-tighter text-purple-500 relative z-10"
    >
      NITHISH<span className="text-white">.T</span>
    </motion.button>
    <motion.button
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setIsOpen(true)}
      className="p-3 text-white bg-purple-600 rounded-2xl glow-purple relative z-10"
    >
      <Menu size={24} />
    </motion.button>
  </nav>
);

const Section = ({ id, title, children, className = "" }) => (
  <section id={id} className={`min-h-screen py-32 px-6 md:px-24 flex flex-col ${className}`}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-16"
    >
      <h2 className="text-sm font-bold text-purple-500 uppercase tracking-[0.3em] mb-2">{title}</h2>
      <div className="h-1 w-20 bg-purple-600 rounded-full" />
    </motion.div>
    {children}
  </section>
);

const Gallery = ({ onBack }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [items, setItems] = useState({ photos: [], videos: [] });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [customFileName, setCustomFileName] = useState('');
  const [activeTab, setActiveTab] = useState('photos');
  const [previewItem, setPreviewItem] = useState(null);
  const fileInputRef = useRef(null);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const entries = await listFolder();
      const filtered = entries.filter(item =>
        item['.tag'] === 'file' &&
        (item.name.match(/\.(jpg|jpeg|png|gif|mp4|mov|webm)$/i))
      );

      const photos = [];
      const videos = [];

      // Fetch temporary links for images to use as thumbnails
      const itemsWithLinks = await Promise.all(filtered.map(async (item) => {
        const isImage = item.name.match(/\.(jpg|jpeg|png|gif)$/i);
        if (isImage) {
          try {
            const link = await getTemporaryLink(item.path_display);
            return { ...item, previewUrl: link };
          } catch (e) {
            return item;
          }
        }
        return item;
      }));

      itemsWithLinks.forEach(item => {
        if (item.name.match(/\.(mp4|mov|webm)$/i)) {
          videos.push(item);
        } else {
          photos.push(item);
        }
      });

      setItems({ photos, videos });
    } catch (err) {
      showNotification('Failed to load gallery items', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLocked) {
      fetchItems();
      showNotification('Connected to Secure Server', 'success');
    }
  }, [isLocked]);

  const handleUnlock = (e) => {
    e.preventDefault();
    if (password === '26909') {
      setIsLocked(false);
      setError('');
    } else {
      setError('Invalid Access Key');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    setCustomFileName(file.name.split('.')[0]);
    setShowUploadModal(true);
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;

    const extension = pendingFile.name.split('.').pop();
    const finalFile = new File([pendingFile], `${customFileName}.${extension}`, { type: pendingFile.type });

    setUploading(true);
    setShowUploadModal(false);
    showNotification(`Uploading ${finalFile.name}...`, 'info');

    try {
      await uploadFile(finalFile);
      showNotification('Upload successful!', 'success');
      fetchItems();
    } catch (err) {
      showNotification('Upload failed', 'error');
    } finally {
      setUploading(false);
      setPendingFile(null);
    }
  };

  const handleDelete = async (path, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;

    try {
      showNotification(`Deleting ${name}...`, 'info');
      await deleteFile(path);
      showNotification('Deleted successfully', 'success');
      fetchItems();
    } catch (err) {
      showNotification('Delete failed', 'error');
    }
  };

  const handlePreview = async (path, name) => {
    try {
      showNotification('Opening preview...', 'info');
      const link = await getTemporaryLink(path);
      const isVideo = name.match(/\.(mp4|mov|webm)$/i);
      setPreviewItem({ link, name, isVideo, path });
    } catch (err) {
      showNotification('Failed to generate preview', 'error');
    }
  };

  const handleDownload = async (path, name) => {
    try {
      const link = await getTemporaryLink(path);
      const a = document.createElement('a');
      a.href = link;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      showNotification('Failed to download file', 'error');
    }
  };

  if (isLocked) {
    return (
      <Section id="gallery" title="Private Space">
        <button onClick={onBack} className="mb-8 text-purple-500 font-bold flex items-center gap-2">← Back Home</button>
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="glass-card p-10 rounded-[2.5rem] max-w-md w-full text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
            <div className="inline-flex p-5 bg-purple-600/10 rounded-3xl mb-8">
              <Lock size={40} className="text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Encrypted Gallery</h3>
            <p className="text-zinc-500 mb-8">Access is restricted. Please provide the 4-digit security key to view private content.</p>
            <form onSubmit={handleUnlock} className="flex flex-col gap-4">
              <input
                type="password"
                placeholder="••••"
                className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl text-white text-center text-2xl tracking-widest outline-none focus:border-purple-500/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <button type="submit" className="bg-purple-600 p-5 rounded-2xl font-bold hover:bg-purple-700 transition-all glow-purple active:scale-95">
                Authenticate
              </button>
            </form>
          </motion.div>
        </div>
      </Section>
    );
  }

  const MediaGrid = ({ items, title, icon: Icon }) => (
    <div className="mb-20">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-purple-600/10 rounded-xl text-purple-500">
          <Icon size={24} />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter">{title}</h3>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-zinc-800 to-transparent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -10 }}
            className="aspect-[4/3] glass-card rounded-3xl overflow-hidden group relative"
          >
            {/* Thumbnail/Preview */}
            {item.previewUrl ? (
              <img
                src={item.previewUrl}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                <Video size={48} className="text-zinc-800" />
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 md:bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between p-4 md:p-6">
              <div className="flex justify-end relative z-10">
                <button
                  onClick={() => handleDelete(item.path_display, item.name)}
                  className="p-2 md:p-3 bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="relative z-10 bg-black/20 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none p-3 rounded-2xl md:p-0">
                <h4 className="text-white font-bold truncate text-sm md:text-base uppercase mb-2">{item.name}</h4>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(item.path_display, item.name)}
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-bold text-[9px] md:text-[10px] uppercase hover:bg-white hover:text-black transition-all active:scale-95"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownload(item.path_display, item.name)}
                      className="p-1.5 md:p-2 bg-purple-600 rounded-xl text-white hover:bg-purple-700 transition-all active:scale-95"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                  <span className="text-zinc-400 text-[8px] md:text-[10px] font-bold">{(item.size / 1024 / 1024).toFixed(1)}MB</span>
                </div>
              </div>
            </div>

            {/* Content info for non-hover state */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-0 transition-opacity">
              <p className="text-[10px] font-black text-white/70 uppercase tracking-widest truncate">{item.name}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <Section id="gallery" title="The Gallery">
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl bg-zinc-900 border border-purple-500/30 shadow-2xl backdrop-blur-xl"
          >
            {notification.type === 'success' && <CheckCircle2 className="text-green-500" size={20} />}
            {notification.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
            {notification.type === 'info' && <Loader2 className="text-purple-500 animate-spin" size={20} />}
            <span className="text-sm font-bold text-white uppercase tracking-wider">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative glass-card p-10 rounded-[3rem] w-full max-w-md border border-purple-500/30"
            >
              <h3 className="text-2xl font-black mb-6 uppercase">Name your media</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-2 mb-2 block">Filename</label>
                  <input
                    type="text"
                    value={customFileName}
                    onChange={(e) => setCustomFileName(e.target.value)}
                    className="w-full bg-black border border-zinc-800 p-5 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all"
                    placeholder="Enter name..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-zinc-900 p-5 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmUpload}
                    className="flex-[2] bg-purple-600 p-5 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-purple-700 transition-all glow-purple"
                  >
                    Upload Now
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-2xl"
            onClick={() => setPreviewItem(null)}
          >
            <motion.button
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute top-6 right-6 md:top-10 md:right-10 p-4 bg-white/10 text-white rounded-2xl hover:bg-white hover:text-black transition-all z-[100001]"
              onClick={() => setPreviewItem(null)}
            >
              <X size={24} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-7xl w-full max-h-full flex flex-col items-center gap-6"
            >
              <div className="w-full flex items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 shadow-2xl relative">
                {previewItem.isVideo ? (
                  <video
                    src={previewItem.link}
                    controls
                    autoPlay
                    className="max-w-full max-h-[75vh] h-auto shadow-2xl"
                  />
                ) : (
                  <img
                    src={previewItem.link}
                    alt={previewItem.name}
                    className="max-w-full max-h-[75vh] h-auto object-contain shadow-2xl"
                  />
                )}
              </div>

              <div className="flex flex-col items-center gap-2">
                <h3 className="text-white font-black text-xl md:text-2xl uppercase tracking-tighter text-center">
                  {previewItem.name}
                </h3>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => handleDownload(previewItem.path, previewItem.name)}
                    className="flex items-center gap-2 bg-purple-600 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-purple-700 transition-all active:scale-95"
                  >
                    <Download size={14} /> Download
                  </button>
                  <button
                    onClick={() => setPreviewItem(null)}
                    className="px-6 py-3 bg-white/10 rounded-xl text-white font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
        <div className="flex flex-col gap-4">
          <button onClick={onBack} className="text-purple-500 font-bold flex items-center gap-2">← Back Home</button>

          <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800">
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'photos' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Captured Moments
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'videos' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Motion Gallery
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,video/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-purple-600/10 border border-purple-500/30 px-6 py-4 rounded-2xl font-bold text-purple-500 hover:bg-purple-600 hover:text-white transition-all active:scale-95 disabled:opacity-50"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {uploading ? 'Processing...' : 'Upload to Server'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="text-purple-500 animate-spin mb-4" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Synchronizing Server...</p>
        </div>
      ) : (
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'photos' && (
                items.photos.length > 0 ? (
                  <MediaGrid items={items.photos} title="Captured Moments" icon={ImageIcon} />
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No photos found in secure archive.</p>
                  </div>
                )
              )}

              {activeTab === 'videos' && (
                items.videos.length > 0 ? (
                  <MediaGrid items={items.videos} title="Motion Gallery" icon={Video} />
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No motion media found in secure archive.</p>
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </Section>
  );
};

const WaterAnimation = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-40 overflow-hidden pointer-events-none z-10">
      {/* Wave Layers */}
      <div className="absolute inset-0">
        <motion.svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="absolute top-0 w-[200%] h-32 opacity-20 fill-purple-900/30"
          animate={{ x: [-1440, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <path d="M0,0C120,50,240,100,360,100C480,100,600,50,720,50C840,50,960,100,1080,100C1200,100,1320,50,1440,50L1440,0L0,0Z" />
        </motion.svg>
        <motion.svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="absolute top-0 w-[200%] h-24 opacity-40 fill-purple-600/10"
          animate={{ x: [0, -1440] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        >
          <path d="M0,40C150,20,300,60,450,60C600,60,750,20,900,20C1050,20,1200,60,1350,60L1440,60L1440,0L0,0Z" />
        </motion.svg>
        <motion.svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="absolute top-0 w-[200%] h-20 opacity-30 fill-purple-500/20"
          animate={{ x: [-1440, 0], y: [0, 5, 0] }}
          transition={{
            x: { duration: 25, repeat: Infinity, ease: "linear" },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <path d="M0,80C200,60,400,100,600,100C800,100,1000,60,1200,60L1440,80L1440,0L0,0Z" />
        </motion.svg>
      </div>
    </div>
  );
};

const App = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const navItems = [
    { name: 'HOME', icon: Sparkles },
    { name: 'ABOUT', icon: MessageSquare },
    { name: 'GALLERY', icon: ImageIcon },
    { name: 'APPS', icon: Smartphone },
    { name: 'CONTACT', icon: Github },
    { name: 'FEEDBACK', icon: Send }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return (
          <Section id="about" title="Philosophy">
            <button onClick={() => setCurrentPage('home')} className="mb-8 text-purple-500 font-bold flex items-center gap-2">← Back Home</button>
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-10">
                <h3 className="text-5xl md:text-7xl font-bold leading-tight">I believe in <span className="text-purple-500 underline decoration-zinc-800 underline-offset-8">Minimalism</span> with Maximum impact.</h3>
                <p className="text-2xl text-zinc-400 font-medium leading-relaxed">Every pixel should have a purpose. Every animation should tell a story. I specialize in building high-performance interfaces that don't just work—they feel alive.</p>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-5xl font-black text-white mb-2">04+</div>
                    <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Years Experience</div>
                  </div>
                  <div>
                    <div className="text-5xl font-black text-white mb-2">50+</div>
                    <div className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Creative Projects</div>
                  </div>
                </div>
              </div>
              <div className="glass-card p-12 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all duration-700" />
                <h4 className="text-2xl font-bold mb-10">Core Expertise</h4>
                <div className="space-y-8">
                  {[{ name: 'Creative UI Design', level: '95%' }, { name: 'Motion Graphics', level: '85%' }, { name: 'Frontend Architecture', level: '90%' }, { name: 'Mobile Experience', level: '80%' }].map(skill => (
                    <div key={skill.name}>
                      <div className="flex justify-between mb-4">
                        <span className="text-zinc-300 font-bold">{skill.name}</span>
                        <span className="text-purple-500 font-bold">{skill.level}</span>
                      </div>
                      <div className="h-2 bg-zinc-900 rounded-full overflow-hidden p-[2px]">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: skill.level }} transition={{ duration: 1.5, ease: "circOut" }} className="h-full bg-gradient-to-r from-purple-700 to-purple-400 rounded-full shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        );
      case 'gallery':
        return <Gallery onBack={() => setCurrentPage('home')} />;
      case 'apps':
        return (
          <Section id="apps" title="Ecosystem">
            <button onClick={() => setCurrentPage('home')} className="mb-8 text-purple-500 font-bold flex items-center gap-2">← Back Home</button>
            <div className="grid md:grid-cols-3 gap-8">
              {[{ name: 'Nova OS', desc: 'A minimalist operating system conceptual interface.' }, { name: 'Pulse', desc: 'Real-time health monitoring for athletes.' }, { name: 'Cipher', desc: 'Encrypted communication platform for teams.' }].map((app, i) => (
                <motion.div key={i} whileHover={{ y: -15 }} className="glass-card p-10 rounded-[2.5rem] group hover:border-purple-500/40 transition-all duration-500">
                  <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-500 mb-8 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500">
                    <Smartphone size={32} />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{app.name}</h3>
                  <p className="text-zinc-500 text-lg leading-relaxed mb-8">{app.desc}</p>
                  <button className="flex items-center gap-3 font-bold text-purple-400 group-hover:text-purple-300 transition-colors">Case Study <ExternalLink size={18} /></button>
                </motion.div>
              ))}
            </div>
          </Section>
        );
      case 'feedback':
        return (
          <Section id="feedback" title="Testimonials">
            <button onClick={() => setCurrentPage('home')} className="mb-8 text-purple-500 font-bold flex items-center gap-2">← Back Home</button>
            <div className="max-w-4xl mx-auto glass-card p-12 md:p-20 rounded-[4rem] text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 text-purple-500/10 pointer-events-none">
                <MessageSquare size={120} />
              </div>
              <h3 className="text-4xl md:text-6xl font-black mb-8 text-gradient">Your Voice Matters</h3>
              <p className="text-xl text-zinc-400 mb-16 font-medium leading-relaxed">I value honest feedback as it helps me grow and refine my craft. Share your experience working with me or your thoughts on this space.</p>
              <form action="https://formspree.io/f/your-form-id" method="POST" className="space-y-6">
                <textarea name="message" placeholder="How can I improve?" rows="4" className="w-full bg-black/50 border border-zinc-800 p-8 rounded-[2rem] text-white text-xl outline-none focus:border-purple-500/50 transition-all resize-none"></textarea>
                <button type="submit" className="inline-flex items-center gap-4 bg-purple-600 px-12 py-6 rounded-full font-bold text-xl hover:bg-purple-700 transition-all glow-purple hover:px-16 active:scale-95">Submit Review <Send size={24} /></button>
              </form>
            </div>
          </Section>
        );
      case 'contact':
        return (
          <Section id="contact" title="Connection">
            <button onClick={() => setCurrentPage('home')} className="mb-8 text-purple-500 font-bold flex items-center gap-2">← Back Home</button>
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h3 className="text-6xl md:text-8xl font-black mb-10 leading-none">READY TO <span className="text-purple-500">START?</span></h3>
                <p className="text-2xl text-zinc-400 mb-12 max-w-lg font-medium leading-relaxed">I'm always open to discussing new projects, creative ideas or opportunities to be part of your visions.</p>
                <div className="flex gap-4">
                  {[Github, Linkedin, Instagram].map((Icon, i) => (
                    <motion.a key={i} whileHover={{ y: -5, scale: 1.1 }} href="#" className="p-5 glass-card rounded-2xl text-purple-500 hover:text-white hover:bg-purple-600 transition-all duration-300">
                      <Icon size={28} />
                    </motion.a>
                  ))}
                </div>
              </div>
              <div className="glass-card p-10 md:p-12 rounded-[3rem] relative">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-2">Name</label>
                      <input type="text" placeholder="John Doe" className="w-full bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-2">Email</label>
                      <input type="email" placeholder="john@example.com" className="w-full bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-2">Message</label>
                    <textarea placeholder="Tell me about your project..." rows="4" className="w-full bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl text-white outline-none focus:border-purple-500/50 transition-all resize-none"></textarea>
                  </div>
                  <button className="w-full bg-purple-600 p-6 rounded-2xl font-bold text-lg hover:bg-purple-700 transition-all glow-purple active:scale-95 flex items-center justify-center gap-3">Send Message <Send size={20} /></button>
                </form>
              </div>
            </div>
          </Section>
        );
      default:
        return (
          <section id="home" className="relative h-screen flex items-center overflow-hidden">
            <div className="absolute inset-0 bg-black" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(139,92,246,0.15),transparent_60%)]" />
            <div className="absolute right-0 bottom-0 h-full w-[50%] md:w-[45%] z-20 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-l from-purple-900/10 via-transparent to-transparent z-10" />
              <motion.img initial={{ x: 150, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} src={nithishImg} alt="Nithish" className="h-full object-contain object-right-bottom" style={{ maskImage: 'linear-gradient(to left, black 60%, transparent 95%), linear-gradient(to top, black 80%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 60%, transparent 95%), linear-gradient(to top, black 80%, transparent 100%)' }} />
            </div>
            <div className="container mx-auto px-6 z-10 grid grid-cols-1 md:grid-cols-12 items-center h-full">
              <div className="md:col-span-6 pt-20">
                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="flex items-center gap-2 text-purple-500 font-bold mb-6"><Sparkles size={18} /><span className="tracking-widest uppercase text-xs md:text-sm">Welcome to my universe</span></motion.div>
                <div className="overflow-hidden"><motion.h1 initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="text-4xl md:text-6xl lg:text-7xl font-black leading-none tracking-tighter mb-8"><span className="block mb-2">NITHISH</span><span className="text-gradient block">DESIGNER.</span></motion.h1></div>
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="flex flex-col md:flex-row gap-8 items-start md:items-center max-w-lg"><p className="text-lg md:text-xl text-zinc-400 font-medium leading-relaxed">Crafting digital experiences where art meets technology. Focused on building the future of the web.</p></motion.div>

                {/* Navigation cards grid at bottom - mobile stack one by one */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl mt-12">
                  {navItems.map((item, i) => (
                    <motion.button
                      key={item.name}
                      onClick={() => setCurrentPage(item.name.toLowerCase())}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + (i * 0.1) }}
                      className="glass-card p-5 flex flex-col items-center justify-center gap-3 group hover:border-purple-500/50 transition-all active:scale-95"
                    >
                      <item.icon className="text-purple-500 group-hover:scale-110 transition-transform" size={20} />
                      <span className="text-[10px] font-black tracking-widest text-zinc-400 group-hover:text-white transition-colors uppercase">
                        {item.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
    }
  };

  return (
    <div className="bg-black text-white selection:bg-purple-500 selection:text-white scroll-smooth overflow-x-hidden min-h-screen flex flex-col">
      <Navbar isOpen={navOpen} setIsOpen={setNavOpen} onNavigate={(page) => setCurrentPage(page)} />

      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-0 bg-black/98 z-[99999] flex flex-col p-8 md:p-12 h-screen w-screen overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-12 shrink-0 relative z-[100000]">
              <div className="text-2xl font-black text-purple-500">NAVIGATION</div>
              <button onClick={() => setNavOpen(false)} className="p-3 text-white bg-zinc-900 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center gap-12 py-12 relative z-[100000]">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="relative w-56 h-56 md:w-72 md:h-72 rounded-3xl overflow-hidden border-2 border-purple-500/30 group shrink-0"
              >
                <img src={nithishImg} alt="Nithish" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              </motion.div>

              {/* Menu items as icon + text list */}
              <div className="flex flex-col items-center gap-6 w-full max-w-md">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + (i * 0.1) }}
                    onClick={() => { setCurrentPage(item.name.toLowerCase()); setNavOpen(false); }}
                    className="flex items-center gap-6 text-xl md:text-2xl font-black text-zinc-400 hover:text-purple-500 transition-all group w-full justify-center py-1"
                  >
                    <item.icon size={24} className="group-hover:scale-110 transition-transform text-purple-500" />
                    <span className="tracking-widest uppercase">{item.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div key={currentPage} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-zinc-900 bg-black mt-auto relative overflow-hidden">
        {/* Water animation at the top section of footer */}
        <WaterAnimation />

        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
            <div className="md:col-span-5 space-y-8">
              <div className="text-3xl font-black text-purple-500 tracking-tighter">NITHISH<span className="text-white">.T</span></div>
              <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-sm">
                Transforming complex ideas into elegant digital realities. Let's build something extraordinary together.
              </p>
              <div className="flex gap-6">
                {[Github, Linkedin, Instagram].map((Icon, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ y: -5, scale: 1.1 }}
                    href="#"
                    className="p-4 bg-zinc-900 rounded-2xl text-purple-500 hover:text-white hover:bg-purple-600 transition-all"
                  >
                    <Icon size={20} />
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Navigation</h4>
                <ul className="space-y-4 text-zinc-500 font-bold text-sm">
                  {['Home', 'About', 'Gallery', 'Apps'].map(item => (
                    <li key={item}><button onClick={() => setCurrentPage(item.toLowerCase())} className="hover:text-purple-500 transition-colors uppercase tracking-widest">{item}</button></li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Contact</h4>
                <ul className="space-y-4 text-zinc-500 font-bold text-sm">
                  <li className="hover:text-white transition-colors cursor-pointer">praveendev629@gmail.com</li>
                  <li className="hover:text-white transition-colors cursor-pointer">+91 8122699623</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Tamil Nadu, India</li>
                </ul>
              </div>
              <div className="col-span-2 md:col-span-1 space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">Updates</h4>
                <div className="relative group">
                  <input type="email" placeholder="Your email" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl text-white text-xs outline-none focus:border-purple-500/50 transition-all" />
                  <button className="absolute right-2 top-2 p-2 bg-purple-600 rounded-xl text-white hover:bg-purple-700 transition-all"><Send size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-10 border-t border-zinc-900/50 px-6 bg-zinc-950/50 relative z-20">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-zinc-600 font-bold uppercase tracking-tighter text-[10px]">© 2026 Crafted with precision and soul.</p>
            <div className="flex gap-8 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
              <a href="#" className="hover:text-purple-500 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-purple-500 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
