const { useState, useEffect, useRef } = React;

// Setup basic Icons as pure SVGs
const SearchIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const MusicIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>;

// SVGs for Instruments
const GuitarNeckSVG = ({ chordStr }) => {
  // A simplistic pseudo-chord rendering for demo purposes
  const hash = Array.from(chordStr).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const dots = [
    { string: hash % 6, fret: (hash % 3) + 1 },
    { string: (hash + 1) % 6, fret: ((hash + 1) % 3) + 1 },
    { string: (hash + 2) % 6, fret: ((hash + 2) % 3) + 1 },
  ];

  return (
    <svg width="80" height="100" viewBox="0 0 100 120" style={{ margin: "0 auto", display: "block" }}>
      {/* Frets */}
      <rect x="20" y="20" width="60" height="80" fill="none" stroke="#9ca3af" strokeWidth="2" />
      <line x1="20" y1="40" x2="80" y2="40" stroke="#9ca3af" strokeWidth="2" />
      <line x1="20" y1="60" x2="80" y2="60" stroke="#9ca3af" strokeWidth="2" />
      <line x1="20" y1="80" x2="80" y2="80" stroke="#9ca3af" strokeWidth="2" />
      
      {/* Strings */}
      {[0,1,2,3,4,5].map(i => (
        <line key={i} x1={20 + i*12} y1="20" x2={20 + i*12} y2="100" stroke="#f3f4f6" strokeWidth={1 + (5-i)*0.2} />
      ))}
      
      {/* Dots */}
      {dots.map((d, i) => (
        <circle key={i} cx={20 + d.string*12} cy={20 + d.fret*20 - 10} r="5" fill="#00f2fe" />
      ))}
    </svg>
  );
};

const PianoKeysSVG = ({ chordStr }) => {
  const hash = Array.from(chordStr).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const keysToHighlight = [hash % 7, (hash + 2) % 7, (hash + 4) % 7];
  
  return (
    <svg width="100" height="60" viewBox="0 0 140 80" style={{ margin: "0 auto", display: "block" }}>
      {/* White keys */}
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={`w${i}`} x={i*20} y="0" width="20" height="80" fill={keysToHighlight.includes(i) ? "#00f2fe" : "#f3f4f6"} stroke="#1a1d24" strokeWidth="1" />
      ))}
      {/* Black keys */}
      {[0,1,3,4,5].map(i => (
        <rect key={`b${i}`} x={i*20 + 12} y="0" width="16" height="50" fill="#232730" />
      ))}
    </svg>
  );
};


const Metronome = ({ bpm, setBpm, isPlaying, setIsPlaying, isOpen, closeMetronome }) => {
  const [activeBeat, setActiveBeat] = useState(false);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);

  const playClick = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);

    setActiveBeat(true);
    setTimeout(() => setActiveBeat(false), 100);
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = (60 / bpm) * 1000;
      timerRef.current = setInterval(playClick, interval);
      // play first immediately
      playClick();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, bpm]);

  return (
    <div className={`metronome-panel ${isOpen ? 'open' : ''}`}>
      <div className="metronome-header">
        <h3 style={{fontFamily: 'var(--font-heading)'}}>Metronome</h3>
        <button className="btn-icon" onClick={closeMetronome} style={{width: 30, height: 30, fontSize: '1.2rem'}}>&times;</button>
      </div>
      
      <div className="bpm-display">
        <div className="bpm-value">{bpm}</div>
        <div style={{color: 'var(--text-muted)'}}>BPM</div>
      </div>
      
      <input 
        type="range" 
        min="40" max="220" 
        value={bpm} 
        onChange={(e) => setBpm(Number(e.target.value))}
        className="slider" 
      />
      
      <div style={{display: 'flex', justifyContent: 'center', marginBottom: '1.5rem'}}>
        <button 
          className="btn-primary" 
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? "STOP" : "START"}
        </button>
      </div>
      
      <div className={`visual-beat ${activeBeat ? 'active' : ''}`}></div>
    </div>
  );
};


const SongDetail = ({ song, instrument, onBack }) => {
  const [transposeSteps, setTransposeSteps] = useState(0);

  const handleTranspose = (steps) => {
    setTransposeSteps(prev => prev + steps);
  };

  const transposedChords = song.chords.map(c => window.transposeChord(c, transposeSteps));
  const newKey = window.transposeChord(song.key, transposeSteps);

  // Capo logic
  // If we transpose up N steps (modulo 12), we can just place a capo on fret N and play original shapes!
  let capoFret = song.guitar.capo;
  if (instrument === 'guitar') {
    capoFret = (song.guitar.capo + transposeSteps) % 12;
    if (capoFret < 0) capoFret += 12; // Handle negative 
  }

  return (
    <div className="song-detail">
      <button onClick={onBack} style={{color: 'var(--accent-neon)', marginBottom: '1rem', fontWeight: 600}}>
        &larr; Back to songs
      </button>

      <div className="song-header">
        <div>
          <h2 style={{fontSize: '3rem', marginBottom: '0.5rem'}}>{song.title}</h2>
          <div className="card-subtitle">{song.artist}</div>
          <div className="badges" style={{marginTop: '1rem'}}>
             <span className="badge">Key: {newKey}</span>
             <span className="badge">Tempo: {song.bpm} BPM</span>
             {instrument === 'guitar' && <span className="badge">Capo Fret: {capoFret === 0 ? "Open" : capoFret}</span>}
          </div>
          
          <div style={{marginTop: '1.5rem'}}>
             <h4 style={{marginBottom: '0.5rem', color: 'var(--text-muted)'}}>
               {instrument === 'guitar' ? "Strumming Pattern" : "Piano Arpeggio Pattern"}
             </h4>
             <div style={{fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', display: 'inline-block'}}>
               {instrument === 'guitar' ? song.guitar.strumming : song.piano.arpeggio}
             </div>
          </div>
        </div>

        <div className="transpose-controls">
          <button className="t-btn" onClick={() => handleTranspose(-1)}>-</button>
          <div className="transpose-value">{transposeSteps > 0 ? `+${transposeSteps}` : transposeSteps}</div>
          <button className="t-btn" onClick={() => handleTranspose(1)}>+</button>
        </div>
      </div>

      <h3 className="section-title">Chords Used</h3>
      
      {instrument === 'guitar' && capoFret !== 0 && transposeSteps !== 0 && (
         <div style={{padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--green)', color: 'var(--green)', borderRadius: '8px', marginBottom: '1rem'}}>
           <strong>Tip:</strong> With Capo on fret {capoFret}, you can play the original shapes: {song.chords.join(', ')}
         </div>
      )}

      <div className="chords-display">
        {transposedChords.map((chord, index) => (
          <div className="chord-box" key={index}>
            <div className="chord-name">{chord}</div>
            
            <div style={{marginTop: '1.5rem', marginBottom: '0.5rem'}}>
               {instrument === 'guitar' ? <GuitarNeckSVG chordStr={chord} /> : <PianoKeysSVG chordStr={chord} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


const App = () => {
  const [instrument, setInstrument] = useState('guitar');
  const [searchQuery, setSearchQuery] = useState('');
  const [metronomeOpen, setMetronomeOpen] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [isMetronomePlaying, setIsMetronomePlaying] = useState(false);
  
  const [selectedSong, setSelectedSong] = useState(null);

  const filteredSongs = window.SONG_DATA.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">DYNAMIC<span style={{color: 'var(--text-main)'}}>CHORD</span></div>
        
        <div className="nav-links">
          <div className="nav-link active">Songs</div>
          <div className="nav-link">Library</div>
          <div className="nav-link">Learn</div>
        </div>
      </header>

      <main className="main-content">
        
        {!selectedSong && (
          <div className="hero">
            <h1>Learn, Play, and <br/><span>Master Music</span></h1>
            <p>Access thousands of chords, adaptive sheet music, and an interactive learning platform designed for both guitar and piano.</p>
          </div>
        )}

        <div className="controls-bar">
          <div style={{position: 'relative', flex: '1', maxWidth: '400px'}}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search songs or artists..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{paddingLeft: '2.5rem', width: '100%'}}
            />
            <div style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)'}}>
              <SearchIcon />
            </div>
          </div>

          <div className="toggle-group" onClick={() => setInstrument(instrument === 'guitar' ? 'piano' : 'guitar')} style={{cursor: 'pointer'}}>
            <div className={`toggle-pill ${instrument === 'piano' ? 'right' : ''}`}></div>
            <div className={`toggle-btn ${instrument === 'guitar' ? 'active' : ''}`}>Guitar</div>
            <div className={`toggle-btn ${instrument === 'piano' ? 'active' : ''}`}>Piano</div>
          </div>

          <button className="btn-icon" onClick={() => setMetronomeOpen(true)} title="Open Metronome">
             <MusicIcon />
          </button>
        </div>

        {selectedSong ? (
          <SongDetail song={selectedSong} instrument={instrument} onBack={() => setSelectedSong(null)} />
        ) : (
          <>
            <h2 className="section-title">Featured Songs</h2>
            <div className="grid">
              {filteredSongs.map(song => (
                <div className="card" key={song.id} onClick={() => setSelectedSong(song)} style={{cursor: 'pointer'}}>
                  <div className="card-subtitle">{song.artist}</div>
                  <h3 className="card-title">{song.title}</h3>
                  <div className="badges">
                    <span className="badge">Key: {song.key}</span>
                    <span className="badge">{song.bpm} BPM</span>
                  </div>
                  <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1}}>
                    Chords: {song.chords.slice(0, 4).join(', ')}...
                  </p>
                  <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--accent-neon)', fontWeight: 600, fontSize: '0.9rem'}}>
                    Play Now &rarr;
                  </div>
                </div>
              ))}
              
              {filteredSongs.length === 0 && (
                <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)'}}>
                  No songs found for "{searchQuery}". Try Wonderwall!
                </div>
              )}
            </div>
          </>
        )}

      </main>

      <Metronome 
        bpm={bpm} 
        setBpm={setBpm} 
        isPlaying={isMetronomePlaying} 
        setIsPlaying={setIsMetronomePlaying} 
        isOpen={metronomeOpen} 
        closeMetronome={() => setMetronomeOpen(false)} 
      />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
