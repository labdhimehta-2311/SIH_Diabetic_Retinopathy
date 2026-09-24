/**
 * Regional Voice Synthesis Engine
 * --------------------------------
 * Robust sentence-queued audio synthesis for English, Hindi, and Gujarati.
 * 
 * Features:
 * 1. Queue-based sentence-by-sentence playback ensuring long reports are spoken
 *    fluently without browser timeout or silence.
 * 2. Stops automatically after reading the full report once. Never loops.
 * 3. Supports Play, Pause, Resume, and Stop controls with live state events.
 * 4. Multi-tier Gujarati fallback: Native speech voice -> Google Translate TTS audio -> Devanagari phonetic.
 * 5. Replaces hyphens in numeric ranges (e.g., "1-2") with natural words ("1 થી 2" in GU, "1 से 2" in HI, "1 to 2" in EN)
 *    to prevent the TTS engine from pronouncing "minus".
 */

export type VoiceStatus = 'idle' | 'playing' | 'paused';

class RegionalVoiceEngine {
  private currentAudio: HTMLAudioElement | null = null;
  private queue: string[] = [];
  private currentQueueIndex: number = 0;
  private currentLang: 'en' | 'hi' | 'gu' = 'en';
  private status: VoiceStatus = 'idle';
  private onStateChangeCallback: ((status: VoiceStatus, currentSentence: number, totalSentences: number) => void) | null = null;

  public setOnStateChange(cb: (status: VoiceStatus, currentSentence: number, totalSentences: number) => void) {
    this.onStateChangeCallback = cb;
  }

  private updateStatus(status: VoiceStatus) {
    this.status = status;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(status, this.currentQueueIndex + 1, this.queue.length);
    }
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
   * Sanitizes text to prevent TTS from reading hyphens as subtraction ("minus").
   */
  public sanitizePunctuation(text: string, lang: 'en' | 'hi' | 'gu'): string {
    let sanitized = text;

    if (lang === 'gu') {
      // Replace "1-2" or "1 - 2" with "1 થી 2"
      sanitized = sanitized.replace(/(\d+)\s*[-–]\s*(\d+)/g, '$1 થી $2');
      sanitized = sanitized.replace(/[-–]/g, ' ');
    } else if (lang === 'hi') {
      // Replace "1-2" with "1 से 2"
      sanitized = sanitized.replace(/(\d+)\s*[-–]\s*(\d+)/g, '$1 से $2');
      sanitized = sanitized.replace(/[-–]/g, ' ');
    } else {
      // Replace "1-2" with "1 to 2"
      sanitized = sanitized.replace(/(\d+)\s*[-–]\s*(\d+)/g, '$1 to $2');
      sanitized = sanitized.replace(/[-–]/g, ' ');
    }

    return sanitized;
  }

  /**
   * Transliterates Gujarati unicode glyphs to Devanagari glyphs for offline TTS fallback.
   */
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
   * Splits a long text into clean sentences for chunked playback.
   */
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
   * Starts reading the given text once from start to finish.
   */
  public async speak(text: string, lang: 'en' | 'hi' | 'gu'): Promise<void> {
    this.stop();
    if (!text || text.trim().length === 0) return;

    this.currentLang = lang;
    const sanitized = this.sanitizePunctuation(text, lang);
    this.queue = this.splitIntoSentences(sanitized);
    this.currentQueueIndex = 0;
    this.updateStatus('playing');

    await this.playNextQueueItem();
  }

  private async playNextQueueItem(): Promise<void> {
    if (this.status !== 'playing') return;

    if (this.currentQueueIndex >= this.queue.length) {
      // Completed full text once!
      this.stop();
      return;
    }

    const sentence = this.queue[this.currentQueueIndex];
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback('playing', this.currentQueueIndex + 1, this.queue.length);
    }

    if (this.currentLang === 'gu') {
      await this.speakGujaratiSentence(sentence);
    } else if (this.currentLang === 'hi') {
      await this.speakHindiSentence(sentence);
    } else {
      await this.speakEnglishSentence(sentence);
    }

    if (this.status === 'playing') {
      this.currentQueueIndex++;
      await this.playNextQueueItem();
    }
  }

  public pause(): void {
    if (this.status !== 'playing') return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    this.updateStatus('paused');
  }

  public resume(): void {
    if (this.status !== 'paused') return;

    this.updateStatus('playing');

    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(() => {
        this.playNextQueueItem();
      });
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      return;
    }

    this.playNextQueueItem();
  }

  public stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.queue = [];
    this.currentQueueIndex = 0;
    this.updateStatus('idle');
  }

  private speakGujaratiSentence(sentence: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve();
        return;
      }

      // Check native voice first
      const voices = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
      const nativeGuVoice = voices.find(v => 
        v.lang.toLowerCase().startsWith('gu') || 
        v.name.toLowerCase().includes('gujarati')
      );

      if (nativeGuVoice && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.voice = nativeGuVoice;
        utterance.lang = 'gu-IN';
        utterance.rate = 0.95;
        utterance.onend = () => resolve();
        utterance.onerror = () => this.streamGujaratiAudio(sentence, resolve);
        window.speechSynthesis.speak(utterance);
        return;
      }

      // Stream via audio
      this.streamGujaratiAudio(sentence, resolve);
    });
  }

  private streamGujaratiAudio(sentence: string, resolve: () => void) {
    try {
      const sanitized = sentence.slice(0, 180);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=gu&client=tw-ob&q=${encodeURIComponent(sanitized)}`;
      const audio = new Audio(audioUrl);
      audio.loop = false; // NEVER LOOP
      this.currentAudio = audio;

      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        this.currentAudio = null;
        this.speakPhoneticGujarati(sentence, resolve);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.speakPhoneticGujarati(sentence, resolve);
        });
      }
    } catch {
      this.speakPhoneticGujarati(sentence, resolve);
    }
  }

  private speakPhoneticGujarati(sentence: string, resolve: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    const devanagariText = this.gujaratiToDevanagari(sentence);
    const utterance = new SpeechSynthesisUtterance(devanagariText);
    const voices = window.speechSynthesis.getVoices();
    const indVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN')) || voices[0];
    
    if (indVoice) utterance.voice = indVoice;
    utterance.lang = 'hi-IN';
    utterance.rate = 0.92;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  }

  private speakHindiSentence(sentence: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        this.streamAudioFallback(sentence, 'hi', resolve);
        return;
      }

      const voices = window.speechSynthesis.getVoices();
      const hiVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi'));

      const utterance = new SpeechSynthesisUtterance(sentence);
      if (hiVoice) utterance.voice = hiVoice;
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      utterance.onend = () => resolve();
      utterance.onerror = () => this.streamAudioFallback(sentence, 'hi', resolve);

      window.speechSynthesis.speak(utterance);
    });
  }

  private speakEnglishSentence(sentence: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        this.streamAudioFallback(sentence, 'en', resolve);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = () => this.streamAudioFallback(sentence, 'en', resolve);

      window.speechSynthesis.speak(utterance);
    });
  }

  private streamAudioFallback(sentence: string, lang: string, resolve: () => void) {
    try {
      const sanitized = sentence.slice(0, 180);
      const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(sanitized)}`;
      const audio = new Audio(audioUrl);
      audio.loop = false; // NEVER LOOP
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
