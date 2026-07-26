'use client';

import React, { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  Clock,
  CheckCircle2,
  BookOpen,
  Headphones,
} from 'lucide-react';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';
type Soundscape = 'none' | 'lofi' | 'whitenoise' | 'rain';

export default function FocusTimerPage() {
  const { enrolledSubjects } = useAuth();

  // Timer states
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // Audio soundscape state
  const [activeSoundscape, setActiveSoundscape] = useState<Soundscape>('none');
  const [volume, setVolume] = useState<number>(0.3);

  // Session stats
  const [completedSessions, setCompletedSessions] = useState<number>(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState<number>(0);

  // Audio Context Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodeRef = useRef<any>(null);

  // Initialize preset times
  const getPresetTime = (m: TimerMode) => {
    switch (m) {
      case 'pomodoro':
        return 25 * 60;
      case 'shortBreak':
        return 5 * 60;
      case 'longBreak':
        return 15 * 60;
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTimeLeft(getPresetTime(newMode));
  };

  // Timer interval countdown
  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play completion chime
      playChime();
      if (mode === 'pomodoro') {
        setCompletedSessions((prev) => prev + 1);
        setTotalFocusMinutes((prev) => prev + 25);
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode]);

  // Audio Synthesizer via Web Audio API for Lo-fi / White Noise / Rain
  const startSoundscape = (type: Soundscape) => {
    stopSoundscape();
    if (type === 'none') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (type === 'whitenoise' || type === 'rain') {
        // Buffer noise generator
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        if (type === 'rain') {
          // Low-pass filter for rain effect
          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, ctx.currentTime);
          whiteNoise.connect(filter);
          filter.connect(masterGain);
        } else {
          whiteNoise.connect(masterGain);
        }

        whiteNoise.start();
        soundNodeRef.current = whiteNoise;
      } else if (type === 'lofi') {
        // Lo-fi chord synth pad
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(220, ctx.currentTime); // A3
        osc2.frequency.setValueAtTime(277.18, ctx.currentTime); // C#4

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(masterGain);

        osc1.start();
        osc2.start();
        soundNodeRef.current = { stop: () => { osc1.stop(); osc2.stop(); } };
      }
    } catch (e) {
      console.error('Audio synth error:', e);
    }
  };

  const stopSoundscape = () => {
    if (soundNodeRef.current) {
      try {
        soundNodeRef.current.stop();
      } catch (e) {}
      soundNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch (e) {}
      audioCtxRef.current = null;
    }
  };

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
    } catch (e) {}
  };

  const handleSoundscapeToggle = (type: Soundscape) => {
    if (activeSoundscape === type) {
      setActiveSoundscape('none');
      stopSoundscape();
    } else {
      setActiveSoundscape(type);
      startSoundscape(type);
    }
  };

  // Format Time Helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-pink-600/20 text-pink-400 border border-pink-500/20">
              <Timer className="h-5 w-5" />
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-wide">
              Focus & Pomodoro Study Timer
            </h1>
          </div>
          <p className="text-slate-400 text-sm">
            HSC deep work countdown timer with ambient soundscapes and study session tracking.
          </p>
        </div>

        {/* Stats Summary Box */}
        <div className="flex items-center gap-5 bg-slate-900/30 border border-indigo-950/20 px-6 py-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Sessions Completed</span>
              <span className="text-xl font-bold text-slate-200 font-mono">{completedSessions}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-indigo-950/35" />
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-violet-400" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Focus Time</span>
              <span className="text-xl font-bold text-slate-200 font-mono">{totalFocusMinutes} mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* TIMER CARD */}
      <div className="max-w-2xl mx-auto space-y-8 mb-12">
        <div className="glass-card rounded-3xl p-8 border-indigo-950/30 text-center shadow-2xl relative overflow-hidden bg-slate-950/60">
          
          {/* Preset Buttons */}
          <div className="inline-flex p-1 bg-slate-900/60 border border-indigo-950/30 rounded-2xl mb-8">
            <button
              onClick={() => handleModeChange('pomodoro')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'pomodoro'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              25m Focus
            </button>
            <button
              onClick={() => handleModeChange('shortBreak')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'shortBreak'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              5m Short Break
            </button>
            <button
              onClick={() => handleModeChange('longBreak')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mode === 'longBreak'
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              15m Deep Break
            </button>
          </div>

          {/* Large Countdown Clock */}
          <div className="my-4">
            <span className="text-7xl sm:text-8xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-400 drop-shadow-lg">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Subject Tag Selector */}
          <div className="max-w-xs mx-auto mb-8">
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-indigo-950/30 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none focus:border-violet-500"
            >
              <option value="">Tag HSC Subject (Optional)...</option>
              {enrolledSubjects.map((sub) => (
                <option key={sub.id} value={sub.subject_id}>
                  {sub.subject?.name}
                </option>
              ))}
            </select>
          </div>

          {/* Controls: Play / Pause / Reset */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white transition-all transform active:scale-95 shadow-xl cursor-pointer ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                  : 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/20'
              }`}
            >
              {isRunning ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-1" />}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(getPresetTime(mode));
              }}
              className="w-12 h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-950/30 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all cursor-pointer"
              title="Reset timer"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>

        </div>

        {/* Ambient Soundscapes Selector Card */}
        <div className="glass-card rounded-3xl p-6 border-indigo-950/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Headphones className="h-4.5 w-4.5 text-pink-400" />
              <span>Ambient Soundscapes Generator</span>
            </h3>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Web Audio Synthesizer</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSoundscapeToggle('lofi')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                activeSoundscape === 'lofi'
                  ? 'bg-pink-600/15 border-pink-500/30 text-pink-300'
                  : 'bg-slate-900/30 border-indigo-950/20 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xs font-bold block">🎵 Lo-fi Pad</span>
              <span className="text-[10px] opacity-70">Warm synth chimes</span>
            </button>

            <button
              onClick={() => handleSoundscapeToggle('rain')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                activeSoundscape === 'rain'
                  ? 'bg-cyan-600/15 border-cyan-500/30 text-cyan-300'
                  : 'bg-slate-900/30 border-indigo-950/20 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xs font-bold block">🌧️ Gentle Rain</span>
              <span className="text-[10px] opacity-70">Low-pass white noise</span>
            </button>

            <button
              onClick={() => handleSoundscapeToggle('whitenoise')}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                activeSoundscape === 'whitenoise'
                  ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-300'
                  : 'bg-slate-900/30 border-indigo-950/20 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xs font-bold block">📡 White Noise</span>
              <span className="text-[10px] opacity-70">Pure focus static</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
