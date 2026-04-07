"use client";

import { useState } from 'react';
import html2canvas from 'html2canvas';

export default function ShareButton({ targetId, fileName = "liga-stats" }: { targetId: string, fileName?: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleShare = async () => {
    setIsExporting(true);
    // Add a slight delay to ensure the UI is ready
    setTimeout(async () => {
      const element = document.getElementById(targetId);
      if (element) {
        try {
          const canvas = await html2canvas(element, { 
            backgroundColor: '#fafffb', // our flat light background
            scale: 2 // High res
          });
          const dataUrl = canvas.toDataURL('image/png');
          
          // Trigger download
          const link = document.createElement('a');
          link.download = `${fileName}.png`;
          link.href = dataUrl;
          link.click();
        } catch (err) {
          console.error("Failed to generate image", err);
          alert("Failed to export image. Please try again.");
        }
      }
      setIsExporting(false);
    }, 100);
  };

  return (
    <button 
      onClick={handleShare} 
      disabled={isExporting}
      className="primary-btn" 
      style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isExporting ? 0.7 : 1 }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
        <polyline points="16 6 12 2 8 6"></polyline>
        <line x1="12" y1="2" x2="12" y2="15"></line>
      </svg>
      {isExporting ? 'Preparing Image...' : 'Save as Photo'}
    </button>
  );
}
