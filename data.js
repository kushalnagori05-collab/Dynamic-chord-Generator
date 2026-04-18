window.SONG_DATA = [
  {
    id: 1,
    title: "Wonderwall",
    artist: "Oasis",
    bpm: 87,
    key: "F#m",
    chords: ["F#m7", "A", "Esus4", "B7sus4", "Dadd9"],
    guitar: {
      capo: 2,
      strumming: "D-D-U-U-D-U" // D: Down, U: Up
    },
    piano: {
      arpeggio: "Root - 5th - Octave"
    }
  },
  {
    id: 2,
    title: "Let It Be",
    artist: "The Beatles",
    bpm: 72,
    key: "C",
    chords: ["C", "G", "Am", "F"],
    guitar: {
      capo: 0,
      strumming: "D-DU-DU-DU"
    },
    piano: {
      arpeggio: "Block chords, gentle 4/4 rhythm"
    }
  },
  {
    id: 3,
    title: "Someone Like You",
    artist: "Adele",
    bpm: 67,
    key: "A",
    chords: ["A", "E", "F#m", "D"],
    guitar: {
      capo: 0,
      strumming: "D-D-D-D"
    },
    piano: {
      arpeggio: "Broken chords (Root-3rd-5th-8th)"
    }
  },
  {
    id: 4,
    title: "Hotel California",
    artist: "Eagles",
    bpm: 74,
    key: "Bm",
    chords: ["Bm", "F#", "A", "E", "G", "D", "Em"],
    guitar: {
      capo: 7, // Sometimes played with capo 7 for standard Em shapes
      strumming: "D-DU-UD-DU"
    },
    piano: {
      arpeggio: "Syncopated Latin-rock arpeggios"
    }
  }
];

window.CHORD_LIBRARY = {
  // We can just define a few or dynamically generate. 
  // Let's create a dynamic layout in app.js, so we don't need a massive JSON here.
};

// Music Theory Helpers
window.NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
window.NOTES_FLAT = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

const parseChord = (chordStr) => {
  const match = chordStr.match(/^([A-G][b#]?)(.*)$/);
  if (!match) return { root: chordStr, suffix: "" };
  return { root: match[1], suffix: match[2] };
};

window.transposeChord = (chordStr, steps) => {
  const { root, suffix } = parseChord(chordStr);
  
  let rootIndex = window.NOTES.indexOf(root);
  if (rootIndex === -1) {
    // try flat
    rootIndex = window.NOTES_FLAT.indexOf(root);
  }
  
  if (rootIndex === -1) return chordStr; // could not parse, return original
  
  let newIndex = (rootIndex + steps) % 12;
  if (newIndex < 0) newIndex += 12; // Handle negative numbers
  
  return window.NOTES[newIndex] + suffix;
};
