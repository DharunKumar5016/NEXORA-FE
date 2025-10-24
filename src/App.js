import React, { useState } from 'react';
import Magnet from './Magnet';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import './App.css';
import LightRays from './LightRays';

import SplitText from "./SplitText";

const API_BASE_URL = 'http://localhost:5000/api';

// Simple SVG Icons as components
const RocketIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SparklesIcon = () => (
  <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const CopyIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);


function App() {
  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };
  const [showLanding, setShowLanding] = useState(true);
  const [landingAnim, setLandingAnim] = useState(false);
  const [activeTab, setActiveTab] = useState('plan');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const tabs = [
    {
      id: 'plan',
      title: 'Smart Planner',
      description: 'Create personalized action plans with market insights',
      icon: <RocketIcon />,
      color: 'blue-cyan',
      placeholder: 'Describe your goal or project you want to plan...',
      examples: [
        'Launch a tech startup in 2025',
        'Learn digital marketing and get certified',
        'Start a YouTube channel about cooking',
        'Build a mobile app for fitness tracking'
      ]
    },
    {
      id: 'blog',
      title: 'Blog Writer',
      description: 'Generate comprehensive blogs with market analysis',
      icon: <DocumentIcon />,
      color: 'purple-pink',
      placeholder: 'Enter the topic you want to write a blog about...',
      examples: [
        'The Future of Artificial Intelligence in 2025',
        'Sustainable Living: Trends and Tips',
        'Remote Work: Best Practices and Tools',
        'Cryptocurrency Market Analysis'
      ]
    },
    {
      id: 'research',
      title: 'Market Research',
      description: 'Get latest market trends and insights',
      icon: <SearchIcon />,
      color: 'orange-red',
      placeholder: 'What market or topic would you like to research...',
      examples: [
        'Electric vehicle market trends 2025',
        'Social media marketing statistics',
        'E-commerce growth in developing countries',
        'Renewable energy investment opportunities'
      ]
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const endpoint = `${API_BASE_URL}/${activeTab}`;
      const payload = activeTab === 'plan' ? { goal: input } : 
                     activeTab === 'blog' ? { topic: input } : 
                     { query: input };

      const response = await axios.post(endpoint, payload);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setInput(example);
  };

  const copyToClipboard = async () => {
    if (!result) return;
    const content = result.plan || result.blog || result.research;
    try {
      await navigator.clipboard.writeText(content);
      alert('Content copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadAsPdf = () => {
    const reportElement = document.querySelector('.markdown-content');
    if (!reportElement) {
      console.error("Could not find the report element to download.");
      return;
    }

    // Add a class to apply print-friendly styles
    reportElement.classList.add('pdf-export');

    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: 'a4'
    });

    pdf.html(reportElement, {
      callback: function (pdf) {
        // Remove the class after PDF generation is complete
        reportElement.classList.remove('pdf-export');
        pdf.save(`${activeTab}-result.pdf`);
      },
      margin: [40, 40, 40, 40],
      autoPaging: 'text',
      x: 0,
      y: 0,
      width: 515, // A4 width in points (595) - margins (40*2)
      windowWidth: reportElement.scrollWidth
    });
  };

  if (showLanding) {
    return (
      <div
        className={`landing-gradient-bg${landingAnim ? ' landing-fadeout' : ''}`}
        style={{
          minHeight: '100vh',
          width: '100vw',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'opacity 0.5s cubic-bezier(.4,0,.2,1), transform 0.5s cubic-bezier(.4,0,.2,1)'
        }}
      >
        {/* LightRays background */}
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
          <LightRays
            raysOrigin="top-center"
            raysColor="#00ffff"
            raysSpeed={1.5}
            lightSpread={0.8}
            rayLength={1.2}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.1}
            distortion={0.05}
            className="custom-rays"
          />
        </div>
        {/* Foreground content */}
        <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{fontSize:'2.5rem',fontWeight:600,color:'#fff',marginBottom:'1.5rem'}}>
            <SplitText
              text="NEXORA AI"
              className="text-2xl font-semibold text-center"
              delay={200}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              onLetterAnimationComplete={handleAnimationComplete}
            />
          </h1>
          <p style={{fontSize:'1rem',color:'rgba(255,255,255,0.9)',marginBottom:'2rem',textAlign:'center'}}>Your study companion for planning, writing, and research</p>
          <Magnet padding={500} disabled={false} magnetStrength={2}>
            <button
              style={{padding:'12px 24px',fontSize:'1rem',borderRadius:'8px',border:'none',background:'rgba(255,255,255,0.2)',color:'#fff',fontWeight:500,cursor:'pointer',transition:'background 0.2s'}}
              onClick={e => {
                // Ripple effect
                const parent = e.target.closest('.landing-gradient-bg');
                if (parent) {
                  const rect = parent.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const wave = document.createElement('div');
                  wave.className = 'pond-wave';
                  wave.style.left = x + 'px';
                  wave.style.top = y + 'px';
                  wave.style.transform = 'translate(-50%, -50%)';
                  parent.appendChild(wave);
                  setTimeout(() => {
                    if (wave.parentNode) wave.parentNode.removeChild(wave);
                  }, 1200);
                }
                setLandingAnim(true);
                setTimeout(() => setShowLanding(false), 500);
              }}
              aria-label="Get Started"
            >
              Get Started
            </button>
          </Magnet>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <div className="logo-section">
              <div className="logo-icon" aria-label="Nexora AI Logo">
                <SparklesIcon />
              </div>
              <div>
                <h1 className="main-title">Nexora AI</h1>
                <p className="subtitle">
                  Your study companion for planning, writing, and research
                </p>
              </div>
            </div>
            <div className="status-indicator" aria-live="polite">
              <span className="status-dot" aria-hidden="true"></span>
              <span>Ready to help</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main">
          <nav className="tabs-container" aria-label="Main features">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                aria-pressed={activeTab === tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setResult(null);
                  setError(null);
                  setInput('');
                }}
              >
                <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
                <span className="tab-title">{tab.title}</span>
                <span className="tab-description">{tab.description}</span>
              </button>
            ))}
          </nav>

          <section className="input-section">
            <div className="section-header">
              <h2 className="section-title">{currentTab.title}</h2>
              <p className="section-subtitle">{currentTab.description}</p>
            </div>
            <form onSubmit={handleSubmit} className="input-form">
              <div className="textarea-container">
                <label htmlFor="main-textarea" className="visually-hidden">{currentTab.placeholder}</label>
                <textarea
                  id="main-textarea"
                  className="main-textarea"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={currentTab.placeholder}
                  maxLength={1000}
                  aria-label={currentTab.placeholder}
                />
                <div className="char-counter">
                  {input.length}/1000
                </div>
              </div>
              <button
                type="submit"
                className={`submit-button ${loading || !input.trim() ? 'disabled' : ''}`}
                disabled={loading || !input.trim()}
                aria-disabled={loading || !input.trim()}
              >
                {loading ? (
                  <span className="loading-content">
                    <span className="spinner" aria-hidden="true"></span>
                    <span>Processing...</span>
                  </span>
                ) : (
                  <span>Generate {currentTab.title}</span>
                )}
              </button>
            </form>
            <div className="examples-section">
              <h4 className="examples-title">Try these examples:</h4>
              <div className="examples-grid">
                {currentTab.examples.map((example, index) => (
                  <button
                    key={index}
                    className="example-button"
                    type="button"
                    onClick={() => handleExampleClick(example)}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {loading && (
            <div className="loading-section" role="status" aria-live="polite">
              <div className="loading-content-center">
                <div className="loading-spinner-large">
                  <div className="spinner-ring" aria-hidden="true"></div>
                </div>
                <div className="loading-text">
                  <h3>Processing your request...</h3>
                  <p>Please wait while we generate your content.</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="results-section" role="alert" aria-live="assertive">
              <div className="results-header">
                <div className="results-title-section">
                  <h3 className="results-title" style={{color: '#dc2626'}}>Error</h3>
                  <p className="results-subtitle">Something went wrong</p>
                </div>
              </div>
              <div className="results-content">
                <p style={{color: '#dc2626'}}>{error}</p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="results-section">
              <div className="results-header">
                <div className="results-title-section">
                  <h3 className="results-title">{currentTab.title} Results</h3>
                  <p className="results-subtitle">
                    Generated on {new Date().toLocaleDateString()}
                  </p>
                </div>
                <div className="results-actions">
                  <button className="action-button" onClick={copyToClipboard} aria-label="Copy results">
                    <CopyIcon />
                    Copy
                  </button>
                  <button className="action-button" onClick={downloadAsPdf} aria-label="Download results as PDF">
                    <DownloadIcon />
                    Download
                  </button>
                </div>
              </div>
              <div className="results-content">
                <div className="markdown-content">
                  <ReactMarkdown
                    components={{
                      h1: ({children}) => <h1 className="md-h1">{children}</h1>,
                      h2: ({children}) => <h2 className="md-h2">{children}</h2>,
                      h3: ({children}) => <h3 className="md-h3">{children}</h3>,
                      p: ({children}) => <p className="md-p">{children}</p>,
                      ul: ({children}) => <ul className="md-ul">{children}</ul>,
                      ol: ({children}) => <ol className="md-ol">{children}</ol>,
                      li: ({children}) => <li className="md-li">{children}</li>,
                      strong: ({children}) => <strong className="md-strong">{children}</strong>,
                      a: ({href, children}) => <a href={href} className="md-link" target="_blank" rel="noopener noreferrer">{children}</a>,
                      blockquote: ({children}) => <blockquote className="md-blockquote">{children}</blockquote>,
                      code: ({children}) => <code className="md-code">{children}</code>,
                      pre: ({children}) => <pre className="md-pre">{children}</pre>
                    }}
                  >
                    {result.plan || result.blog || result.research}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <div className="footer-content">
            <p className="footer-text">
              Powered by Nexora AI
            </p>
            <div className="footer-links">
              <span>Study-focused design</span>
              <span>•</span>
              <span>Clean & accessible</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}




export default App;
