import React, { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Plus, X, Star, Settings, Search, TrendingUp, Clock, Bookmark } from 'lucide-react';

export default function NexaraWeb() {
  const [tabs, setTabs] = useState([
    { id: 1, url: 'nexara://home', title: 'Home', history: ['nexara://home'], historyIndex: 0 }
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [inputUrl, setInputUrl] = useState('nexara://home');
  const [bookmarks, setBookmarks] = useState([
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    { name: 'Stack Overflow', url: 'https://stackoverflow.com' }
  ]);
  const [recentSites, setRecentSites] = useState([
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'GitHub', url: 'https://github.com' }
  ]);
  const iframeRef = useRef(null);

  const currentTab = tabs.find(t => t.id === activeTab);

  const updateHistory = (tab, newUrl) => {
    const newHistory = tab.history.slice(0, tab.historyIndex + 1);
    newHistory.push(newUrl);
    return {
      ...tab,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      url: newUrl
    };
  };

  const navigate = (url) => {
    if (!url) return;
    
    if (url !== 'nexara://home' && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    setTabs(tabs.map(t => {
      if (t.id === activeTab) {
        return updateHistory(t, url);
      }
      return t;
    }));
    setInputUrl(url);

    // Add to recent sites
    if (url !== 'nexara://home' && !recentSites.find(r => r.url === url)) {
      const domain = url.replace(/^https?:\/\//, '').split('/')[0];
      setRecentSites([{ name: domain, url }, ...recentSites.slice(0, 7)]);
    }
  };

  const goBack = () => {
    if (currentTab.historyIndex > 0) {
      const newIndex = currentTab.historyIndex - 1;
      const newUrl = currentTab.history[newIndex];
      setTabs(tabs.map(t => 
        t.id === activeTab ? { ...t, historyIndex: newIndex, url: newUrl } : t
      ));
      setInputUrl(newUrl);
    }
  };

  const goForward = () => {
    if (currentTab.historyIndex < currentTab.history.length - 1) {
      const newIndex = currentTab.historyIndex + 1;
      const newUrl = currentTab.history[newIndex];
      setTabs(tabs.map(t => 
        t.id === activeTab ? { ...t, historyIndex: newIndex, url: newUrl } : t
      ));
      setInputUrl(newUrl);
    }
  };

  const canGoBack = currentTab?.historyIndex > 0;
  const canGoForward = currentTab?.historyIndex < currentTab?.history?.length - 1;

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      navigate(inputUrl);
    }
  };

  const addTab = () => {
    const newId = Math.max(...tabs.map(t => t.id)) + 1;
    setTabs([...tabs, { 
      id: newId, 
      url: 'nexara://home', 
      title: 'Home',
      history: ['nexara://home'],
      historyIndex: 0
    }]);
    setActiveTab(newId);
    setInputUrl('nexara://home');
  };

  const closeTab = (id, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTab === id) {
      setActiveTab(newTabs[0].id);
      setInputUrl(newTabs[0].url);
    }
  };

  const switchTab = (id) => {
    setActiveTab(id);
    const tab = tabs.find(t => t.id === id);
    setInputUrl(tab.url);
  };

  const reload = () => {
    if (currentTab.url === 'nexara://home') return;
    if (iframeRef.current) {
      iframeRef.current.src = currentTab.url;
    }
  };

  const goHome = () => {
    navigate('nexara://home');
  };

  const addBookmark = () => {
    if (currentTab.url && currentTab.url !== 'nexara://home' && !bookmarks.find(b => b.url === currentTab.url)) {
      const name = prompt('Bookmark name:', currentTab.title);
      if (name) {
        setBookmarks([...bookmarks, { name, url: currentTab.url }]);
      }
    }
  };

  const removeBookmark = (url) => {
    setBookmarks(bookmarks.filter(b => b.url !== url));
  };

  const HomePage = () => (
    <div className="min-h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Logo and Search */}
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold text-white mb-6 tracking-tight">
            Nexara <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">Web</span>
          </h1>
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search or enter URL..."
              className="w-full px-6 py-4 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-white/60 text-lg outline-none focus:border-cyan-400 focus:bg-white/20 transition-all"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  navigate(e.target.value);
                }
              }}
            />
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-white/60" size={24} />
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Bookmarks */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Bookmark className="text-cyan-400" size={20} />
              <h2 className="text-xl font-semibold text-white">Bookmarks</h2>
            </div>
            <div className="space-y-2">
              {bookmarks.slice(0, 4).map((bookmark, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all group"
                  onClick={() => navigate(bookmark.url)}
                >
                  <span className="text-white/90">{bookmark.name}</span>
                  <X 
                    size={16} 
                    className="text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBookmark(bookmark.url);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sites */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-pink-400" size={20} />
              <h2 className="text-xl font-semibold text-white">Recent</h2>
            </div>
            <div className="space-y-2">
              {recentSites.slice(0, 4).map((site, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all"
                  onClick={() => navigate(site.url)}
                >
                  <span className="text-white/90">{site.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Sites */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-yellow-400" size={20} />
            <h2 className="text-xl font-semibold text-white">Popular Sites</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Google', 'YouTube', 'Twitter', 'Reddit', 'Amazon', 'Netflix', 'Spotify', 'LinkedIn'].map((site, i) => (
              <div
                key={i}
                className="p-4 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all text-center"
                onClick={() => navigate(`https://www.${site.toLowerCase()}.com`)}
              >
                <span className="text-white/90 font-medium">{site}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Tabs Bar */}
      <div className="flex items-center bg-gray-900 px-2 pt-2 border-b border-gray-800">
        <div className="flex flex-1 overflow-x-auto gap-1">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg cursor-pointer min-w-40 max-w-56 transition-colors ${
                activeTab === tab.id 
                  ? 'bg-gray-950 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-750'
              }`}
            >
              <span className="truncate flex-1 text-sm font-medium">
                {tab.title || 'New Tab'}
              </span>
              {tabs.length > 1 && (
                <X
                  size={16}
                  className="hover:bg-gray-700 rounded p-0.5 transition-colors"
                  onClick={(e) => closeTab(tab.id, e)}
                />
              )}
            </div>
          ))}
        </div>
        <button
          onClick={addTab}
          className="p-2 ml-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          title="New Tab"
        >
          <Plus size={18} />
        </button>
        <button
          className="p-2 ml-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 bg-gray-900 px-4 py-3 border-b border-gray-800">
        <button 
          onClick={goBack}
          disabled={!canGoBack}
          className={`p-2 rounded-lg transition-colors ${
            canGoBack 
              ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
              : 'text-gray-700 cursor-not-allowed'
          }`}
          title="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={goForward}
          disabled={!canGoForward}
          className={`p-2 rounded-lg transition-colors ${
            canGoForward 
              ? 'hover:bg-gray-800 text-gray-300 hover:text-white' 
              : 'text-gray-700 cursor-not-allowed'
          }`}
          title="Forward"
        >
          <ArrowRight size={20} />
        </button>
        <button 
          onClick={reload} 
          className="p-2 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-colors"
          title="Reload"
        >
          <RotateCw size={20} />
        </button>
        <button 
          onClick={goHome} 
          className="p-2 hover:bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-colors"
          title="Home"
        >
          <Home size={20} />
        </button>

        {/* URL Bar */}
        <div className="flex-1 flex items-center bg-gray-800 rounded-lg px-4 py-2.5 border border-gray-700 focus-within:border-cyan-500 transition-colors">
          <input
            type="text"
            value={inputUrl === 'nexara://home' ? '' : inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={(e) => e.target.select()}
            className="flex-1 bg-transparent text-white outline-none text-sm placeholder-gray-500"
            placeholder="Search or enter URL..."
          />
        </div>

        <button 
          onClick={addBookmark}
          disabled={currentTab.url === 'nexara://home'}
          className={`p-2 rounded-lg transition-colors ${
            currentTab.url === 'nexara://home'
              ? 'text-gray-700 cursor-not-allowed'
              : bookmarks.find(b => b.url === currentTab.url)
                ? 'text-yellow-400 hover:bg-gray-800'
                : 'text-gray-400 hover:bg-gray-800 hover:text-yellow-400'
          }`}
          title="Bookmark"
        >
          <Star size={20} fill={bookmarks.find(b => b.url === currentTab.url) ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative overflow-hidden">
        {currentTab.url === 'nexara://home' ? (
          <HomePage />
        ) : (
          <iframe
            ref={iframeRef}
            src={currentTab.url}
            className="w-full h-full border-0 bg-white"
            title="Browser Content"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
          />
        )}
      </div>
    </div>
  );
    }
