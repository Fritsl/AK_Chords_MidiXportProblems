import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import ArrangementContainer from './components/arrangement/ArrangementContainer';
import Footer from './components/Footer';
import Auth from './components/Auth';
import ChordPatternAnalyzer from './pages/ChordPatternAnalyzer';
import { playback } from './utils/playbackService';
import type { User } from '@supabase/supabase-js';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [showColors, setShowColors] = useState(true);
  const [mode, setMode] = useState<'repeat' | 'stretch'>('repeat');
  const [selectedTemplate, setSelectedTemplate] = useState<{
    category: string;
    subgenre: string;
  } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleTemplateSelect = (category: string, subgenre: string, applyToAll: boolean = false) => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    setSelectedTemplate({ category, subgenre });
  };

  if (loading || !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[180px]">
      <div className="max-w-[2000px] w-full mx-auto p-4 lg:p-8">
        <div className="flex justify-between items-center mb-4">
          {!user && (
            <button
              onClick={() => setShowAuth(true)}
              className="btn-primary"
            >
              Sign In
            </button>
          )}
          <button
            onClick={() => setShowAnalyzer(!showAnalyzer)}
            className="btn-secondary"
          >
            {showAnalyzer ? 'Back to Editor' : 'Analyze Patterns'}
          </button>
        </div>
        
        {showAnalyzer ? (
          <ChordPatternAnalyzer />
        ) : (
          <ArrangementContainer
            user={user}
            showAuth={() => setShowAuth(true)}
            showColors={showColors}
            mode={mode}
            selectedTemplate={selectedTemplate}
            bpm={bpm}
            onBpmChange={setBpm}
            timeSignature={timeSignature}
            onTimeSignatureChange={setTimeSignature}
          />
        )}
      </div>
      {user && !showAnalyzer && (
        <Footer 
          showColors={showColors} 
          onShowColorsChange={setShowColors}
          onTemplateSelect={handleTemplateSelect}
          mode={mode}
          onModeChange={setMode}
          bpm={bpm}
          onBpmChange={setBpm}
          timeSignature={timeSignature}
          onTimeSignatureChange={setTimeSignature}
        />
      )}
      {showAuth && (
        <Auth onAuthComplete={() => setShowAuth(false)} />
      )}
    </div>
  );
}

export default App;