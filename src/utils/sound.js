/**
 * Plays a bright, premium rising major 7 arpeggio chime resolving on the octave,
 * similar to Duolingo/premium apps, using the Web Audio API.
 */
export const playCorrectSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const playNote = (freq, delay, duration, volume) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      
      gainNode.gain.setValueAtTime(0, now + delay);
      // Quick attack
      gainNode.gain.linearRampToValueAtTime(volume, now + delay + 0.02);
      // Smooth decay
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start(now + delay);
      osc.stop(now + delay + duration);
    };

    // Beautiful rising C Major 7 arpeggio resolving to C6:
    // C5 -> E5 -> G5 -> B5 -> C6
    playNote(523.25, 0.00, 0.35, 0.08); // C5
    playNote(659.25, 0.05, 0.35, 0.08); // E5
    playNote(783.99, 0.10, 0.40, 0.08); // G5
    playNote(987.77, 0.15, 0.45, 0.09); // B5
    playNote(1046.50, 0.20, 0.50, 0.10); // C6
  } catch (error) {
    console.warn('Web Audio API is not supported or was blocked:', error);
  }
};

