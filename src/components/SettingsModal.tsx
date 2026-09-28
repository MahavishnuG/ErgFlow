import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sliders, 
  Play, 
  Sparkles,
  Lock
} from 'lucide-react';
import { UserSettings } from '../types';
import { audioManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (newSettings: UserSettings) => void;
  initialTab?: 'intervals' | 'office' | 'goals' | 'sounds';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
  initialTab = 'intervals',
}) => {
  const [activeTab, setActiveTab] = useState<'intervals' | 'office' | 'goals' | 'sounds'>(initialTab);
  const [formData, setFormData] = useState<UserSettings>(settings);
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const testAudioTone = (tone: 'droplet' | 'zen' | 'chime' | 'ping') => {
    audioManager.playTone(tone, formData.sound.volume);
  };

  const requestNotificationPermission = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      setNotificationStatus(perm);
      if (perm === 'granted') {
        new Notification('ErgoFlow Active', {
          body: 'Office workday reminders enabled (9:00 AM - 6:00 PM).',
          icon: '/favicon.ico',
        });
      }
    }
  };

  const toggleWorkDay = (dayIndex: number) => {
    const current = [...formData.officeHours.workDays];
    const idx = current.indexOf(dayIndex);
    if (idx >= 0) {
      if (current.length > 1) {
        current.splice(idx, 1);
      }
    } else {
      current.push(dayIndex);
      current.sort();
    }
    setFormData({
      ...formData,
      officeHours: {
        ...formData.officeHours,
        workDays: current,
      },
    });
  };

  const daysLabels = [
    { index: 1, label: 'Mon' },
    { index: 2, label: 'Tue' },
    { index: 3, label: 'Wed' },
    { index: 4, label: 'Thu' },
    { index: 5, label: 'Fri' },
    { index: 6, label: 'Sat' },
    { index: 0, label: 'Sun' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-900 space-y-5 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              <span>Settings & Preferences</span>
            </h2>
            <p className="text-xs text-slate-500">
              Customize reminder frequencies, 9–6 office hours, goals & alert chimes
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs (Google Material / Stitch) */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('intervals')}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'intervals'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Intervals
          </button>
          <button
            onClick={() => setActiveTab('office')}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'office'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Office Hours
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'goals'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Goals & Streaks
          </button>
          <button
            onClick={() => setActiveTab('sounds')}
            className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sounds'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Alerts & Sounds
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          
          {/* TAB 1: INTERVALS */}
          {activeTab === 'intervals' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">💧 Water Intake Reminder</h4>
                    <p className="text-xs text-slate-500">Default: 45 minutes</p>
                  </div>
                  <span className="text-lg font-black text-blue-600">{formData.intervals.water} mins</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={formData.intervals.water}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      intervals: { ...formData.intervals, water: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>15m (Frequent)</span>
                  <span className="text-blue-600 font-bold">45m (Recommended)</span>
                  <span>90m (Slow)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">🚶 Stand & Walk Apart From Chair</h4>
                    <p className="text-xs text-slate-500">Default: 45 minutes</p>
                  </div>
                  <span className="text-lg font-black text-emerald-600">{formData.intervals.stand} mins</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="90"
                  step="5"
                  value={formData.intervals.stand}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      intervals: { ...formData.intervals, stand: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>15m (Active)</span>
                  <span className="text-emerald-600 font-bold">45m (Sedentary Limit)</span>
                  <span>90m (Max)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">👀 Move Away From Screen (20-20-20)</h4>
                    <p className="text-xs text-slate-500">Default: 20 minutes (Optometrist standard)</p>
                  </div>
                  <span className="text-lg font-black text-indigo-600">{formData.intervals.screen} mins</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="45"
                  step="5"
                  value={formData.intervals.screen}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      intervals: { ...formData.intervals, screen: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>10m</span>
                  <span className="text-indigo-600 font-bold">20m (Clinical Rule)</span>
                  <span>45m</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OFFICE HOURS */}
          {activeTab === 'office' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Workday Timing (Default: 9:00 AM – 6:00 PM)</h4>
                  <p className="text-xs text-slate-500">
                    Reminders run continuously during these hours and pause during off-hours.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-600 font-semibold block mb-1">Office Start Hour</label>
                    <select
                      value={formData.officeHours.startHour}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          officeHours: { ...formData.officeHours, startHour: parseInt(e.target.value) },
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 shadow-xs"
                    >
                      {[7, 8, 9, 10, 11].map((h) => (
                        <option key={h} value={h}>
                          {h}:00 AM
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 font-semibold block mb-1">Office End Hour</label>
                    <select
                      value={formData.officeHours.endHour}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          officeHours: { ...formData.officeHours, endHour: parseInt(e.target.value) },
                        })
                      }
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 shadow-xs"
                    >
                      {[16, 17, 18, 19, 20, 21].map((h) => (
                        <option key={h} value={h}>
                          {h > 12 ? `${h - 12}:00 PM` : `${h}:00 PM`} ({h}:00)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Work Days selection */}
                <div>
                  <label className="text-xs text-slate-600 font-semibold block mb-2">Active Work Days</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {daysLabels.map((d) => {
                      const selected = formData.officeHours.workDays.includes(d.index);
                      return (
                        <button
                          key={d.index}
                          type="button"
                          onClick={() => toggleWorkDay(d.index)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            selected
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Filter toggle */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Enforce strict 9–6 office timing
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Silence notifications outside workday hours
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.officeHours.activeOnlyDuringOfficeHours}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        officeHours: {
                          ...formData.officeHours,
                          activeOnlyDuringOfficeHours: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PERSONAL GOALS & STREAK SECURITY */}
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Personalized Health Targets</h4>
                  <p className="text-xs text-slate-500">
                    Adjust daily targets to keep motivation and productivity high
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Daily Water Intake</span>
                    <span className="text-blue-600 font-bold">{formData.goals.waterMl} ml ({Math.round(formData.goals.waterMl / 250)} glasses)</span>
                  </div>
                  <input
                    type="range"
                    min="1500"
                    max="4000"
                    step="250"
                    value={formData.goals.waterMl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        goals: { ...formData.goals, waterMl: parseInt(e.target.value) },
                      })
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Daily Stand & Walk Breaks</span>
                    <span className="text-emerald-600 font-bold">{formData.goals.standBreaks} breaks</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="16"
                    step="1"
                    value={formData.goals.standBreaks}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        goals: { ...formData.goals, standBreaks: parseInt(e.target.value) },
                      })
                    }
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Daily 20-20-20 Screen Rests</span>
                    <span className="text-indigo-600 font-bold">{formData.goals.screenRests} rests</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    step="2"
                    value={formData.goals.screenRests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        goals: { ...formData.goals, screenRests: parseInt(e.target.value) },
                      })
                    }
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium">Max Continuous Sitting Alert Threshold</span>
                    <span className="text-rose-600 font-bold">{formData.goals.maxContinuousSedentaryMins} minutes</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="60"
                    step="5"
                    value={formData.goals.maxContinuousSedentaryMins}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        goals: { ...formData.goals, maxContinuousSedentaryMins: parseInt(e.target.value) },
                      })
                    }
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* Streak Rules Card */}
                <div className="p-3.5 bg-orange-50/70 border border-orange-200/80 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-orange-900">
                    <Lock className="w-3.5 h-3.5 text-orange-600" />
                    <span>Streak Integrity Policy</span>
                  </div>
                  <p className="text-orange-800 text-[11px] leading-relaxed">
                    Streak begins at 0 and increments exclusively when you check in on consecutive workdays. Manual edits are permanently disabled to ensure authentic habit progression.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ALERTS & SOUNDS */}
          {activeTab === 'sounds' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Chime Sound Alert</h4>
                    <p className="text-xs text-slate-500">Synthesized audio chimes via Web Audio API</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.sound.soundEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sound: { ...formData.sound, soundEnabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {formData.sound.soundEnabled && (
                  <>
                    <div>
                      <label className="text-xs text-slate-700 font-semibold block mb-2">Chime Tone Style</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(['droplet', 'zen', 'chime', 'ping'] as const).map((tone) => (
                          <button
                            key={tone}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                sound: { ...formData.sound, chimeTone: tone },
                              });
                              testAudioTone(tone);
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold capitalize flex items-center justify-between transition-all ${
                              formData.sound.chimeTone === tone
                                ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{tone}</span>
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700 font-medium">Volume</span>
                        <span className="text-slate-500 font-bold">{Math.round(formData.sound.volume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={formData.sound.volume}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sound: { ...formData.sound, volume: parseFloat(e.target.value) },
                          })
                        }
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </>
                )}

                {/* Voice Reminder Option */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Spoken Voice Reminders
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Speaks: "Time to hydrate and stretch"
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.sound.voiceAlertEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sound: { ...formData.sound, voiceAlertEnabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* Browser Notification Permissions */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Desktop & Mobile Push Notifications
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Status: <strong className="capitalize">{notificationStatus}</strong>
                    </span>
                  </div>
                  {notificationStatus !== 'granted' ? (
                    <button
                      type="button"
                      onClick={requestNotificationPermission}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs"
                    >
                      Enable
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" /> Enabled
                    </span>
                  )}
                </div>

                {/* Mobile Haptics */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Haptic Vibration (Mobile)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Vibrates phone when a break timer triggers
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.sound.vibrationEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sound: { ...formData.sound, vibrationEnabled: e.target.checked },
                      })
                    }
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {/* User Name for reports */}
                <div className="pt-3 border-t border-slate-200/80">
                  <label className="text-xs text-slate-600 font-semibold block mb-1">
                    Your Name (Used on Weekly PDF Reports)
                  </label>
                  <input
                    type="text"
                    value={formData.userName}
                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 shadow-xs"
                    placeholder="e.g. Alex Rivers"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>

      </div>
    </div>
  );
};
