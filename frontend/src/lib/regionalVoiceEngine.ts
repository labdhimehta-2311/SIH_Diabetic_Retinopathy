/**
 * Regional Voice Synthesis Engine
 * --------------------------------
 * Single-spoken, scroll-immune, zero-dot regional audio synthesis
 * supporting English, हिन्दी (Hindi), and ગુજરાતી (Gujarati).
 * 
 * Invariants:
 * 1. STRICTLY SINGLE-SPOKEN:
 *    - Each clause is queued and spoken exactly ONCE. Zero duplicate calls.
 * 2. ZERO "DOT" VERBALIZATION:
 *    - Decimal numbers (e.g. 95.90, 0.42, 4.7) phonetically verbalized with words:
 *      "પોઇન્ટ" in Gujarati, "दशमलव" in Hindi, "point" in English.
 *    - All periods and dandas are replaced with comma breath pauses.
 *    - Hyphen ranges (e.g. 1-2, 20-30) verbalized as "1 થી 2" (GU), "1 से 2" (HI), "1 to 2" (EN).
 *    - Blood pressure slashes (130/80) verbalized as "130 બાય 80" (GU), "130 बटा 80" (HI), "130 over 80" (EN).
 * 3. 100% SCROLL IMMUNITY:
 *    - Active SpeechSynthesisUtterance is anchored to the global window object
 *      to completely prevent Chromium V8 garbage collection mid-speech or during DOM scrolling.
 * 4. SEAMLESS PAUSE AND RESUME:
 *    - Pauses cleanly in-place; resumes exactly where stopped.
 * 5. SEQUENTIAL NON-LOOPING DELIVERY:
 *    - Progresses through the report clause-by-clause, then cleanly resets to idle.
 */

export type VoiceStatus = 'idle' | 'playing' | 'paused';

type StateChangeCallback = (status: VoiceStatus, currentSentence: number, totalSentences: number) => void;

class RegionalVoiceEngine {
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

  public isIdle(): boolean {
    return this.status === 'idle';
  }

  /**
   * Phonetizes and sanitizes all punctuation so the speech engine
   * never verbalizes "dot", "minus", or "slash".
   * Completely strips ASCII hyphens (-) so mobile TTS engines
   * never verbalize "minus minus".
   */
  public sanitizePunctuation(text: string, lang: 'en' | 'hi' | 'gu'): string {
    let sanitized = text;

    // 1. Replace multi-dots with clean comma pauses
    sanitized = sanitized.replace(/\.{2,}/g, ', ');
    sanitized = sanitized.replace(/\.\s*\./g, ', ');

    // 2. Expand ranges like "1-2" or "20-30" or "1–2" (en-dash, em-dash, hyphen)
    if (lang === 'gu') {
      sanitized = sanitized.replace(/(\d+)\s*[-–—]\s*(\d+)/g, '$1 થી $2');
    } else if (lang === 'hi') {
      sanitized = sanitized.replace(/(\d+)\s*[-–—]\s*(\d+)/g, '$1 से $2');
    } else {
      sanitized = sanitized.replace(/(\d+)\s*[-–—]\s*(\d+)/g, '$1 to $2');
    }

    // 3. Decimals (e.g. 95.90 -> 95 પોઇન્ટ 90, 0.42 -> 0 दशमलव 42)
    if (lang === 'gu') {
      sanitized = sanitized.replace(/(\d+)\.(\d+)/g, '$1 પોઇન્ટ $2');
    } else if (lang === 'hi') {
      sanitized = sanitized.replace(/(\d+)\.(\d+)/g, '$1 दशमलव $2');
    } else {
      sanitized = sanitized.replace(/(\d+)\.(\d+)/g, '$1 point $2');
    }

    // 4. Blood pressure or ratio slash (e.g. 130/80)
    if (lang === 'gu') {
      sanitized = sanitized.replace(/(\d+)\s*\/\s*(\d+)/g, '$1 બાય $2');
    } else if (lang === 'hi') {
      sanitized = sanitized.replace(/(\d+)\s*\/\s*(\d+)/g, '$1 बटा $2');
    } else {
      sanitized = sanitized.replace(/(\d+)\s*\/\s*(\d+)/g, '$1 over $2');
    }

    // 5. Explicit plus/minus with numbers (e.g. +4.7, +4, -3)
    if (lang === 'gu') {
      sanitized = sanitized.replace(/\+\s*(\d+)/g, 'પ્લસ $1');
      sanitized = sanitized.replace(/-\s*(\d+)/g, 'માઇનસ $1');
      sanitized = sanitized.replace(/%/g, ' ટકા');
    } else if (lang === 'hi') {
      sanitized = sanitized.replace(/\+\s*(\d+)/g, 'प्लस $1');
      sanitized = sanitized.replace(/-\s*(\d+)/g, 'माइनस $1');
      sanitized = sanitized.replace(/%/g, ' प्रतिशत');
    } else {
      sanitized = sanitized.replace(/\+\s*(\d+)/g, 'plus $1');
      sanitized = sanitized.replace(/-\s*(\d+)/g, 'minus $1');
      sanitized = sanitized.replace(/%/g, ' percent');
    }

    // 6. English medical expansions
    if (lang === 'en') {
      sanitized = sanitized.replace(/\bPDR\b/g, 'Proliferative Diabetic Retinopathy');
      sanitized = sanitized.replace(/\bNPDR\b/g, 'Non Proliferative Diabetic Retinopathy');
      sanitized = sanitized.replace(/\bDME\b/g, 'Diabetic Macular Edema');
      sanitized = sanitized.replace(/\bIOP\b/g, 'Intraocular Pressure');
      sanitized = sanitized.replace(/\bBCVA\b/g, 'Visual Acuity');
      sanitized = sanitized.replace(/\bapprox\.?\b/gi, 'approximately');
    }

    // 7. CRITICAL: Remove any hyphen or dash between words/letters (e.g. कप-टू-डिस्क -> कप टू डिस्क, tele-screening -> tele screening)
    // This eliminates the bug where mobile Android/iOS TTS engines verbalize hyphens as "minus minus"!
    sanitized = sanitized.replace(/([^\s\d])\s*[-–—]\s*([^\s\d])/g, '$1 $2');

    // 8. Strip ALL remaining hyphens, dashes, periods, colons, semicolons, bullets, brackets, hashes, asterisks
    sanitized = sanitized.replace(/[\-–—\.:;,_#*•|।\(\)\[\]\{\}\<\>\"\'\/\\~`^]/g, ', ');

    // 9. Clean up duplicate commas, spaces, and commas at boundaries
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
   * Asynchronously loads client synthesis voices if not yet populated.
   */
  public async getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return [];
    }

    const currentVoices = window.speechSynthesis.getVoices();
    if (currentVoices.length > 0) {
      return currentVoices;
    }

    return new Promise((resolve) => {
      let resolved = false;
      const onVoicesChanged = () => {
        if (resolved) return;
        resolved = true;
        window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
        resolve(window.speechSynthesis.getVoices());
      };

      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
          resolve(window.speechSynthesis.getVoices());
        }
      }, 300);
    });
  }

  /**
   * Splits narrative text into balanced clauses (max ~110 chars)
   * aligned with semantic pauses for smooth, natural phrasing.
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
   * If client machine has no Indic voice for Hindi or Gujarati, smoothly
   * falls back to clean phonetic Romanized script to prevent raw Unicode
   * codepoint numbers or screeching on English desktop voices.
   */
  public async speak(text: string, lang: 'en' | 'hi' | 'gu', romanizedFallback?: string): Promise<void> {
    this.stop();
    if (!text || text.trim().length === 0) return;

    this.playbackSessionId++;
    const currentSession = this.playbackSessionId;

    this.currentLang = lang;

    // Detect available voices asynchronously
    const voices = await this.getAvailableVoices();
    const hasHiVoice = voices.some(v => 
      v.lang.toLowerCase().startsWith('hi') || 
      v.name.toLowerCase().includes('hindi')
    );
    const hasGuVoice = voices.some(v => 
      v.lang.toLowerCase().startsWith('gu') || 
      v.name.toLowerCase().includes('gujarati')
    );

    // If Hindi requested but no Hindi voice, or Gujarati requested but neither Gujarati nor Hindi voice:
    // and romanizedFallback is provided, speak the clean phonetic Romanized script with an English/Indian-English voice!
    const shouldUseRoman = Boolean(
      romanizedFallback && (
        (lang === 'hi' && !hasHiVoice) ||
        (lang === 'gu' && !hasGuVoice && !hasHiVoice)
      )
    );

    const actualText = shouldUseRoman ? romanizedFallback! : text;
    const actualLang = shouldUseRoman ? 'en' : lang;

    const sanitized = this.sanitizePunctuation(actualText, actualLang);
    this.queue = this.splitIntoClauses(sanitized);
    this.currentQueueIndex = 0;
    this.status = 'playing';
    this.notifyListeners('playing');

    await this.playQueue(currentSession, shouldUseRoman);
  }

  /**
   * Sequential audio queue driver.
   * Completely immune to scrolling, window focus, or resize events.
   */
  private async playQueue(sessionId: number, isRomanized: boolean = false): Promise<void> {
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

      // Speak clause strictly ONCE via SpeechSynthesis
      await this.playUtteranceChunk(chunk, this.currentLang, sessionId, isRomanized);

      if (sessionId !== this.playbackSessionId || this.isIdle()) {
        return;
      }

      // If user paused during the chunk, do not advance index; wait for resume!
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
   * Plays a single clause using SpeechSynthesis with global GC anchoring.
   * Ensures the utterance is called strictly ONCE, and V8 GC cannot cancel it on scroll.
   */
  private playUtteranceChunk(
    chunk: string, 
    lang: 'en' | 'hi' | 'gu', 
    sessionId: number, 
    isRomanized: boolean = false
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || sessionId !== this.playbackSessionId) {
        resolve();
        return;
      }

      // Clear any stuck synthesis state and resume if paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(chunk);
      this.activeUtterance = utterance;

      // CRITICAL: Anchor to window to prevent Chrome V8 Garbage Collection mid-speech or during scrolling
      (window as any).__voiceUtteranceAnchor = utterance;

      const voices = window.speechSynthesis.getVoices();

      if (isRomanized) {
        // Phonetic Romanized Hindi/Gujarati: Use Indian English voice or best natural English voice
        const inVoice = voices.find(v => 
          v.lang.toLowerCase().includes('in') || 
          v.name.toLowerCase().includes('india') ||
          v.name.toLowerCase().includes('heera') ||
          v.name.toLowerCase().includes('neerja')
        );
        const naturalVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('en') && 
          (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural'))
        );
        const googleVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('en') && (v.name.includes('Google') || v.name.includes('WaveNet'))
        );
        const modernVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('en') && 
          (v.name.includes('Aria') || v.name.includes('Jenny') || v.name.includes('Zira') || v.name.includes('Samantha'))
        );
        const enVoice = inVoice || naturalVoice || googleVoice || modernVoice || voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0];
        if (enVoice) {
          utterance.voice = enVoice;
          utterance.lang = enVoice.lang || 'en-IN';
        } else {
          utterance.lang = 'en-IN';
        }
        utterance.rate = 0.92;
        utterance.pitch = 1.0;
      } else if (lang === 'gu') {
        const guVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('gu') || 
          v.name.toLowerCase().includes('gujarati')
        );
        if (guVoice) {
          utterance.voice = guVoice;
          utterance.lang = 'gu-IN';
          utterance.rate = 0.92;
        } else {
          // Fallback to Hindi voice for Gujarati text (via Devanagari transliteration)
          utterance.text = this.gujaratiToDevanagari(chunk);
          const hiVoice = voices.find(v => 
            v.lang.toLowerCase().startsWith('hi') || 
            v.name.toLowerCase().includes('hindi')
          );
          if (hiVoice) {
            utterance.voice = hiVoice;
            utterance.lang = 'hi-IN';
          }
          utterance.rate = 0.92;
        }
      } else if (lang === 'hi') {
        const hiVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('hi') || 
          v.name.toLowerCase().includes('hindi')
        );
        if (hiVoice) {
          utterance.voice = hiVoice;
          utterance.lang = 'hi-IN';
        }
        utterance.rate = 0.92;
      } else {
        // High-fidelity English Voice Selection
        const naturalVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('en') && 
          (v.name.includes('Natural') || v.name.includes('Online') || v.name.includes('Neural'))
        );
        const googleVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('en') && (v.name.includes('Google') || v.name.includes('WaveNet'))
        );
        const modernVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('en') && 
          (v.name.includes('Aria') || v.name.includes('Jenny') || v.name.includes('Zira') || v.name.includes('Samantha'))
        );
        const fallbackEnVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith('en') && !v.name.includes('David')
        ) || voices.find(v => v.lang.toLowerCase().startsWith('en')) || voices[0];

        const enVoice = naturalVoice || googleVoice || modernVoice || fallbackEnVoice;
        if (enVoice) {
          utterance.voice = enVoice;
          utterance.lang = enVoice.lang || 'en-US';
        } else {
          utterance.lang = 'en-US';
        }
        // Human conversational pacing: rate 0.93, pitch 1.0 (natural cadence)
        utterance.rate = 0.93;
        utterance.pitch = 1.0;
      }

      let isFinished = false;
      const finish = () => {
        if (isFinished) return;
        isFinished = true;
        this.activeUtterance = null;
        (window as any).__voiceUtteranceAnchor = null;
        resolve();
      };

      utterance.onend = () => {
        finish();
      };

      utterance.onerror = () => {
        finish();
      };

      // Speak clause strictly ONCE
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Pauses playback at the exact clause.
   */
  public pause(): void {
    if (this.status !== 'playing') return;

    this.status = 'paused';
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }
    this.notifyListeners('paused');
  }

  /**
   * Resumes playback seamlessly from the exact clause where paused.
   */
  public resume(): void {
    if (this.status !== 'paused') return;

    this.status = 'playing';
    this.notifyListeners('playing');

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

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    }
    (window as any).__voiceUtteranceAnchor = null;

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
