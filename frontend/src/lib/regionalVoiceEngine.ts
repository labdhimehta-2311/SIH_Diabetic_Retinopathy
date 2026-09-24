/**
 * Regional Voice Synthesis Engine
 * --------------------------------
 * High-fidelity, scroll-immune audio synthesis for English, Hindi, and Gujarati.
 * 
 * Core Invariants:
 * 1. ZERO "DOT" VERBALIZATION:
 *    - All decimals (e.g. 95.90, 0.42, 4.7) are phonetically converted into words:
 *      "પોઇન્ટ" in Gujarati, "दशमलव" in Hindi, and "point" in English.
 *    - All periods and dandas are replaced with natural comma breath pauses in Hindi and Gujarati.
 *    - Numeric ranges (e.g. 1-2, 20-30) are converted to "1 થી 2" in GU, "1 से 2" in HI, and "1 to 2" in EN.
 *    - Blood pressure slashes (e.g. 130/80) are converted to "130 બાય 80" in GU, "130 बटा 80" in HI, "130 over 80" in EN.
 * 
 * 2. 100% SCROLL IMMUNITY:
 *    - Primary playback runs entirely on HTML5 Audio (`new Audio()`) in the browser's media pipeline.
 *    - Completely isolated from DOM scrolling, viewport boundaries, Blink accessibility tree recalculations,
 *      and window resize events. Scrolling will NEVER interrupt, restart, or loop speech.
 * 
 * 3. SEAMLESS PAUSE AND RESUME:
 *    - Pausing calls `audio.pause()`, preserving the exact millisecond of playback.
 *    - Resuming calls `audio.play()`, continuing playback without sentence restarts.
 * 
 * 4. SEQUENTIAL NON-LOOPING DELIVERY:
 *    - Narrates once from clause 0 to clause N, then resets cleanly to idle.
 *    - Strictly guarded by session tokens (`playbackSessionId`) preventing concurrent audio loops.
 */

export type VoiceStatus = 'idle' | 'playing' | 'paused';

type StateChangeCallback = (status: VoiceStatus, currentSentence: number, totalSentences: number) => void;

class RegionalVoiceEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private preloadAudio: HTMLAudioElement | null = null;
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private queue: string[] = [];
  private currentQueueIndex: number = 0;
  private currentLang: 'en' | 'hi' | 'gu' = 'en';
  private status: VoiceStatus = 'idle';
  private playbackSessionId: number = 0;
  private resumePromiseResolve: (() => void) | null = null;
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

  /**
   * Sanitizes all punctuation and numerical patterns to guarantee clean,
   * natural pronunciation with zero "dot" or "minus" verbalization.
   */
  public sanitizePunctuation(text: string, lang: 'en' | 'hi' | 'gu'): string {
    let sanitized = text;

    // 1. Replace multi-dots / ellipses with clean pauses
    sanitized = sanitized.replace(/\.{2,}/g, ', ');
    sanitized = sanitized.replace(/\.\s*\./g, ', ');

    // 2. Language-specific number and symbol phonetization
    if (lang === 'gu') {
      // Decimals (e.g. 95.90 -> 95 પોઇન્ટ 90, 0.42 -> 0 પોઇન્ટ 42)
      sanitized = sanitized.replace(/(\d+)\.(\d+)/g, '$1 પોઇન્ટ $2');
      // Ranges (e.g. 1-2 -> 1 થી 2, 20-30 -> 20 થી 30)
      sanitized = sanitized.replace(/(\d+)\s*[-–]\s*(\d+)/g, '$1 થી $2');
      // Blood pressure or ratio slash (e.g. 130/80 -> 130 બાય 80)
      sanitized = sanitized.replace(/(\d+)\s*\/\s*(\d+)/g, '$1 બાય $2');
      // Strip all periods, colons, semicolons, and dashes — replace with natural breath pause
      sanitized = sanitized.replace(/[\.:;–—_#*•|।]/g, ', ');
    } else if (lang === 'hi') {
      // Decimals (e.g. 95.90 -> 95 दशमलव 90, 0.42 -> 0 दशमलव 42)
      sanitized = sanitized.replace(/(\d+)\.(\d+)/g, '$1 दशमलव $2');
      // Ranges (e.g. 1-2 -> 1 से 2, 20-30 -> 20 से 30)
      sanitized = sanitized.replace(/(\d+)\s*[-–]\s*(\d+)/g, '$1 से $2');
      // Blood pressure or ratio slash (e.g. 130/80 -> 130 बटा 80)
      sanitized = sanitized.replace(/(\d+)\s*\/\s*(\d+)/g, '$1 बटा $2');
      // Strip all periods, colons, semicolons, and danda — replace with natural breath pause
      sanitized = sanitized.replace(/[\.:;–—_#*•|।]/g, ', ');
    } else {
      // English: Decimals (e.g. 0.42 -> 0 point 42)
      sanitized = sanitized.replace(/(\d+)\.(\d+)/g, '$1 point $2');
      // Ranges (e.g. 1-2 -> 1 to 2, 20-30 -> 20 to 30)
      sanitized = sanitized.replace(/(\d+)\s*[-–]\s*(\d+)/g, '$1 to $2');
      // Slashes (e.g. 130/80 -> 130 over 80)
      sanitized = sanitized.replace(/(\d+)\s*\/\s*(\d+)/g, '$1 over $2');
      sanitized = sanitized.replace(/[:;–—_#*•]/g, ', ');
    }

    // 3. Clean up duplicate commas and whitespace
    sanitized = sanitized.replace(/,\s*,+/g, ', ');
    sanitized = sanitized.replace(/\s+/g, ' ').trim();
    sanitized = sanitized.replace(/^,\s*|\s*,\s*$/g, '');

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

  /**
   * Splits narrative text into balanced clauses (max ~110 chars)
   * aligned with semantic pauses and safe for TTS character limits.
   */
  public splitIntoClauses(text: string): string[] {
    const rawParts = text.split(/[,।\.!\?;\n]+/).map(p => p.trim()).filter(Boolean);
    const refinedParts: string[] = [];

    // Break any long clauses at word boundaries
    for (const part of rawParts) {
      if (part.length <= 110) {
        refinedParts.push(part);
      } else {
        const words = part.split(/\s+/);
        let sub = '';
        for (const w of words) {
          if (!sub) {
            sub = w;
          } else if ((sub + ' ' + w).length <= 100) {
            sub += ' ' + w;
          } else {
            refinedParts.push(sub);
            sub = w;
          }
        }
        if (sub) refinedParts.push(sub);
      }
    }

    // Combine adjacent short phrases into natural spoken chunks
    const clauses: string[] = [];
    let current = '';

    for (const p of refinedParts) {
      if (!current) {
        current = p;
      } else if ((current + ', ' + p).length <= 110) {
        current += ', ' + p;
      } else {
        clauses.push(current);
        current = p;
      }
    }
    if (current) clauses.push(current);

    return clauses.length > 0 ? clauses : [text.trim()];
  }

  /**
   * Starts a brand new sequential readout from the very first clause.
   */
  public async speak(text: string, lang: 'en' | 'hi' | 'gu'): Promise<void> {
    this.stop();
    if (!text || text.trim().length === 0) return;

    this.playbackSessionId++;
    const currentSession = this.playbackSessionId;

    this.currentLang = lang;
    const sanitized = this.sanitizePunctuation(text, lang);
    this.queue = this.splitIntoClauses(sanitized);
    this.currentQueueIndex = 0;
    this.status = 'playing';
    this.notifyListeners('playing');

    await this.playQueue(currentSession);
  }

  public isIdle(): boolean {
    return this.status === 'idle';
  }

  /**
   * Main sequential audio queue driver.
   * Completely immune to scrolling, window focus, or resize events.
   */
  private async playQueue(sessionId: number): Promise<void> {
    while (this.currentQueueIndex < this.queue.length && sessionId === this.playbackSessionId) {
      // If paused, wait until resumed or stopped
      if (this.isPaused()) {
        await new Promise<void>((resolve) => {
          this.resumePromiseResolve = resolve;
        });
        if (sessionId !== this.playbackSessionId || !this.isCurrentlySpeaking()) {
          return;
        }
      }

      if (!this.isCurrentlySpeaking()) return;

      const chunk = this.queue[this.currentQueueIndex];
      this.notifyListeners('playing');

      // Preload next audio chunk in background for gapless playback
      if (this.currentQueueIndex + 1 < this.queue.length) {
        const nextChunk = this.queue[this.currentQueueIndex + 1];
        const nextUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${this.currentLang}&client=tw-ob&q=${encodeURIComponent(nextChunk)}`;
        try {
          this.preloadAudio = new Audio(nextUrl);
          this.preloadAudio.preload = 'auto';
        } catch {
          this.preloadAudio = null;
        }
      }

      // Play current chunk via HTML5 Audio element
      await this.playChunkAudio(chunk, this.currentLang, sessionId);

      if (sessionId !== this.playbackSessionId || this.isIdle()) {
        return;
      }

      // Check if paused while chunk finished
      if (this.isPaused()) {
        continue;
      }

      this.currentQueueIndex++;
    }

    // Finished entire narrative once sequentially! Reset cleanly. Never loop.
    if (sessionId === this.playbackSessionId && this.currentQueueIndex >= this.queue.length) {
      this.stop();
    }
  }

  /**
   * Plays a single clause using HTML5 Audio (Media Pipeline).
   * Because it is in the media subsystem, DOM scrolling cannot interrupt it.
   */
  private playChunkAudio(chunk: string, lang: string, sessionId: number): Promise<void> {
    return new Promise((resolve) => {
      if (sessionId !== this.playbackSessionId) {
        resolve();
        return;
      }

      try {
        const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
        const audio = new Audio(audioUrl);
        audio.loop = false;
        this.currentAudio = audio;

        const cleanup = () => {
          audio.onended = null;
          audio.onerror = null;
          if (this.currentAudio === audio) {
            this.currentAudio = null;
          }
        };

        audio.onended = () => {
          cleanup();
          resolve();
        };

        audio.onerror = () => {
          cleanup();
          // Fallback to SpeechSynthesis only if network/streaming fails
          this.fallbackSpeechSynthesis(chunk, lang, sessionId).then(resolve);
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            // If user paused or stopped, do not trigger fallback error
            if (this.status !== 'playing' || sessionId !== this.playbackSessionId) {
              resolve();
              return;
            }
            cleanup();
            this.fallbackSpeechSynthesis(chunk, lang, sessionId).then(resolve);
          });
        }
      } catch {
        this.fallbackSpeechSynthesis(chunk, lang, sessionId).then(resolve);
      }
    });
  }

  /**
   * Safe offline fallback to browser SpeechSynthesis.
   * Crucially handles 'interrupted' errors gracefully so scrolling cannot cause loops.
   */
  private fallbackSpeechSynthesis(chunk: string, lang: string, sessionId: number): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || sessionId !== this.playbackSessionId) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      this.activeUtterance = utterance;

      if (lang === 'gu') {
        const voices = window.speechSynthesis.getVoices();
        const guVoice = voices.find(v => v.lang.toLowerCase().startsWith('gu') || v.name.toLowerCase().includes('gujarati'));
        if (guVoice) {
          utterance.voice = guVoice;
          utterance.lang = 'gu-IN';
        } else {
          utterance.text = this.gujaratiToDevanagari(chunk);
          utterance.lang = 'hi-IN';
        }
      } else if (lang === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-US';
      }

      utterance.onend = () => {
        this.activeUtterance = null;
        resolve();
      };

      utterance.onerror = () => {
        // Scroll boundary interruptions must resolve quietly without re-triggering or restarting
        this.activeUtterance = null;
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Pauses playback at the exact millisecond.
   */
  public pause(): void {
    if (this.status !== 'playing') return;

    this.status = 'paused';
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
    this.notifyListeners('paused');
  }

  /**
   * Resumes playback seamlessly from the exact millisecond where paused.
   */
  public resume(): void {
    if (this.status !== 'paused') return;

    this.status = 'playing';
    this.notifyListeners('playing');

    if (this.currentAudio && this.currentAudio.paused && this.currentAudio.currentTime > 0) {
      this.currentAudio.play().catch(console.error);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    if (this.resumePromiseResolve) {
      const res = this.resumePromiseResolve;
      this.resumePromiseResolve = null;
      res();
    }
  }

  /**
   * Stops playback completely and resets all state.
   */
  public stop(): void {
    this.playbackSessionId++;

    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this.preloadAudio) {
      this.preloadAudio.pause();
      this.preloadAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }
    if (this.resumePromiseResolve) {
      const res = this.resumePromiseResolve;
      this.resumePromiseResolve = null;
      res();
    }

    this.queue = [];
    this.currentQueueIndex = 0;
    this.status = 'idle';
    this.notifyListeners('idle');
  }
}

export const regionalVoice = new RegionalVoiceEngine();
