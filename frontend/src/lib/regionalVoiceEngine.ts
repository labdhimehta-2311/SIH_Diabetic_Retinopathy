/**
 * Regional Voice Synthesis Engine
 * --------------------------------
 * Robust sentence-queued audio synthesis for English, Hindi, and Gujarati.
 * 
 * Invariants:
 * 1. Concurrency-guarded: strictly only ONE active loop can ever run via session token.
 * 2. Pauses and resumes at the exact sentence where stopped.
 * 3. Never loops or repeats: reads sequentially from first to last sentence and stops.
 * 4. Punctuation sanitization: transforms numeric ranges (e.g. "1-2") to "1 થી 2" in GU,
 *    "1 से 2" in HI, and "1 to 2" in EN so TTS never speaks "minus".
 * 5. Garbage-collection immune: retains active SpeechSynthesisUtterance references.
 * 6. Multi-subscriber listener support for synchronized UI control states.
 */

export type VoiceStatus = 'idle' | 'playing' | 'paused';

type StateChangeCallback = (status: VoiceStatus, currentSentence: number, totalSentences: number) => void;

class RegionalVoiceEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private queue: string[] = [];
  private currentQueueIndex: number = 0;
  private currentLang: 'en' | 'hi' | 'gu' = 'en';
  private status: VoiceStatus = 'idle';
  private playbackSessionId: number = 0;
  private listeners: Set<StateChangeCallback> = new Set();

  public setOnStateChange(cb: StateChangeCallback): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notifyListeners(status: VoiceStatus) {
    this.status = status;
    const current = Math.min(this.currentQueueIndex + 1, Math.max(this.queue.length, 1));
    const total = this.queue.length;
    this.listeners.forEach(cb => {
      try {
        cb(status, current, total);
      } catch (err) {
        console.error('Regional voice listener error:', err);
      }
    });
  }

  public getStatus(): VoiceStatus {
    return this.status;
  }

  public isCurrentlySpeaking(): boolean {
    return this.status === 'playing';
  }

  public isPaused(): boolean {
    return this.status === 'paused';
  }

  public sanitizePunctuation(text: string, lang: 'en' | 'hi' | 'gu'): string {
    let sanitized = text;

    if (lang === 'gu') {
      // Replace hyphen in ranges like "1-2" or "1 - 2" with "1 થી 2"
      sanitized = sanitized.replace(/(\d+)\s*[-–]\s*(\d+)/g, '$1 થી $2');
      sanitized = sanitized.replace(/[-–]/g, ' ');
    } else if (lang === 'hi') {
      // Replace hyphen in ranges like "1-2" or "1 - 2" with "1 से 2"
      sanitized = sanitized.replace(/(\d+)\s*[-–]\s*(\d+)/g, '$1 से $2');
      sanitized = sanitized.replace(/[-–]/g, ' ');
    } else {
      // Replace hyphen in ranges like "1-2" or "1 - 2" with "1 to 2"
      sanitized = sanitized.replace(/(\d+)\s*[-–]\s*(\d+)/g, '$1 to $2');
      sanitized = sanitized.replace(/[-–]/g, ' ');
    }

    return sanitized;
  }

  public gujaratiToDevanagari(text: string): string {
    return text.split('').map(char => {
      const code = char.charCodeAt(0);
      if (code >= 0x0A81 && code <= 0x0AEF) {
        return String.fromCharCode(code - 0x0180);
      }
      return char;
    }).join('');
  }

  private splitIntoSentences(text: string): string[] {
    const rawSentences = text.split(/([।\.!\?]+[\s\n]+)/);
    const result: string[] = [];
    let current = '';

    for (const part of rawSentences) {
      current += part;
      if (current.trim().length > 60 || /[।\.!\?]\s*$/.test(current)) {
        if (current.trim().length > 0) {
          result.push(current.trim());
        }
        current = '';
      }
    }
    if (current.trim().length > 0) {
      result.push(current.trim());
    }

    return result.length > 0 ? result : [text.trim()];
  }

  /**
   * Starts a brand new sequential readout from the very first sentence.
   */
  public async speak(text: string, lang: 'en' | 'hi' | 'gu'): Promise<void> {
    this.stop();
    if (!text || text.trim().length === 0) return;

    this.playbackSessionId++;
    const currentSession = this.playbackSessionId;

    this.currentLang = lang;
    const sanitized = this.sanitizePunctuation(text, lang);
    this.queue = this.splitIntoSentences(sanitized);
    this.currentQueueIndex = 0;
    this.notifyListeners('playing');

    await this.playQueueFromCurrent(currentSession);
  }

  private async playQueueFromCurrent(sessionId: number): Promise<void> {
    while (this.status === 'playing' && sessionId === this.playbackSessionId && this.currentQueueIndex < this.queue.length) {
      const sentence = this.queue[this.currentQueueIndex];
      this.notifyListeners('playing');

      if (this.currentLang === 'gu') {
        await this.speakGujaratiSentence(sentence, sessionId);
      } else if (this.currentLang === 'hi') {
        await this.speakHindiSentence(sentence, sessionId);
      } else {
        await this.speakEnglishSentence(sentence, sessionId);
      }

      // Check if paused, stopped, or session superseded during sentence playback
      if (sessionId !== this.playbackSessionId || this.status !== 'playing') {
        return;
      }

      this.currentQueueIndex++;
    }

    // Finished entire report once sequentially! Stop completely and reset. Never loop.
    if (sessionId === this.playbackSessionId && this.currentQueueIndex >= this.queue.length) {
      this.stop();
    }
  }

  public pause(): void {
    if (this.status !== 'playing') return;

    this.status = 'paused';
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    this.notifyListeners('paused');
  }

  public resume(): void {
    if (this.status !== 'paused') return;

    this.playbackSessionId++;
    const currentSession = this.playbackSessionId;
    this.status = 'playing';
    this.notifyListeners('playing');

    // Resume execution starting at the exact sentence index where stopped
    this.playQueueFromCurrent(currentSession);
  }

  public stop(): void {
    this.playbackSessionId++;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.queue = [];
    this.currentQueueIndex = 0;
    this.status = 'idle';
    this.notifyListeners('idle');
  }

  private speakGujaratiSentence(sentence: string, sessionId: number): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || sessionId !== this.playbackSessionId) {
        resolve();
        return;
      }

      const voices = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
      const nativeGuVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith('gu') || 
        v.name.toLowerCase().includes('gujarati')
      );

      if (nativeGuVoice && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sentence);
        this.activeUtterance = utterance;
        utterance.voice = nativeGuVoice;
        utterance.lang = 'gu-IN';
        utterance.rate = 0.95;
        utterance.onend = () => {
          this.activeUtterance = null;
          resolve();
        };
        utterance.onerror = () => {
          this.activeUtterance = null;
          this.streamGujaratiAudio(sentence, sessionId, resolve);
        };
        window.speechSynthesis.speak(utterance);
        return;
      }

      this.streamGujaratiAudio(sentence, sessionId, resolve);
    });
  }

  private streamGujaratiAudio(sentence: string, sessionId: number, resolve: () => void) {
    if (sessionId !== this.playbackSessionId) {
      resolve();
      return;
    }

    try {
      const sanitized = sentence.slice(0, 180);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=gu&client=tw-ob&q=${encodeURIComponent(sanitized)}`;
      const audio = new Audio(audioUrl);
      audio.loop = false; // Strictly non-looping
      this.currentAudio = audio;

      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        this.currentAudio = null;
        this.speakPhoneticGujarati(sentence, sessionId, resolve);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.speakPhoneticGujarati(sentence, sessionId, resolve);
        });
      }
    } catch {
      this.speakPhoneticGujarati(sentence, sessionId, resolve);
    }
  }

  private speakPhoneticGujarati(sentence: string, sessionId: number, resolve: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || sessionId !== this.playbackSessionId) {
      resolve();
      return;
    }

    const devanagariText = this.gujaratiToDevanagari(sentence);
    const utterance = new SpeechSynthesisUtterance(devanagariText);
    this.activeUtterance = utterance;
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN')) || voices[0];
    
    if (indVoice) utterance.voice = indVoice;
    utterance.lang = 'hi-IN';
    utterance.rate = 0.92;
    utterance.onend = () => {
      this.activeUtterance = null;
      resolve();
    };
    utterance.onerror = () => {
      this.activeUtterance = null;
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  }

  private speakHindiSentence(sentence: string, sessionId: number): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || sessionId !== this.playbackSessionId) {
        resolve();
        return;
      }

      if (!('speechSynthesis' in window)) {
        this.streamAudioFallback(sentence, 'hi', sessionId, resolve);
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      const hiVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi'));

      const utterance = new SpeechSynthesisUtterance(sentence);
      this.activeUtterance = utterance;
      if (hiVoice) utterance.voice = hiVoice;
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      utterance.onend = () => {
        this.activeUtterance = null;
        resolve();
      };
      utterance.onerror = () => {
        this.activeUtterance = null;
        this.streamAudioFallback(sentence, 'hi', sessionId, resolve);
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  private speakEnglishSentence(sentence: string, sessionId: number): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || sessionId !== this.playbackSessionId) {
        resolve();
        return;
      }

      if (!('speechSynthesis' in window)) {
        this.streamAudioFallback(sentence, 'en', sessionId, resolve);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence);
      this.activeUtterance = utterance;
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.onend = () => {
        this.activeUtterance = null;
        resolve();
      };
      utterance.onerror = () => {
        this.activeUtterance = null;
        this.streamAudioFallback(sentence, 'en', sessionId, resolve);
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  private streamAudioFallback(sentence: string, lang: string, sessionId: number, resolve: () => void) {
    if (sessionId !== this.playbackSessionId) {
      resolve();
      return;
    }

    try {
      const sanitized = sentence.slice(0, 180);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(sanitized)}`;
      const audio = new Audio(audioUrl);
      audio.loop = false; // Strictly non-looping
      this.currentAudio = audio;

      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        this.currentAudio = null;
        resolve();
      };

      audio.play().catch(() => resolve());
    } catch {
      resolve();
    }
  }
}

export const regionalVoice = new RegionalVoiceEngine();
