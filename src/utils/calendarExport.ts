import { UserSettings } from '../types';

/**
 * Generate standard .ics (iCalendar) file with recurring work breaks (9-6 office hours)
 */
export const generateIcsCalendar = (settings: UserSettings): string => {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const now = new Date();
  const dtStamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;

  const daysMap: { [key: number]: string } = {
    1: 'MO',
    2: 'TU',
    3: 'WE',
    4: 'TH',
    5: 'FR',
    6: 'SA',
    0: 'SU',
  };

  const byDays = settings.officeHours.workDays.map((d) => daysMap[d] || 'MO').join(',');

  const startH = pad(settings.officeHours.startHour);
  const startM = pad(settings.officeHours.startMinute);

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ErgoFlow//Sedentary & Health Tracker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ErgoFlow Workday Health Schedule',
    'X-WR-TIMEZONE:' + Intl.DateTimeFormat().resolvedOptions().timeZone,
  ];

  // Water breaks recurring event
  icsContent.push(
    'BEGIN:VEVENT',
    `UID:ergoflow-water-${Date.now()}@ergoflow.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=${Intl.DateTimeFormat().resolvedOptions().timeZone}:${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${startH}${startM}00`,
    `DURATION:PT5M`,
    `RRULE:FREQ=WEEKLY;BYDAY=${byDays || 'MO,TU,WE,TH,FR'}`,
    `SUMMARY:💧 ErgoFlow Hydration Break (${settings.intervals.water}m interval)`,
    `DESCRIPTION:Take a 250ml glass of water to maintain metabolic energy, focus, and prevent dehydration fatigue during office hours (9-6).`,
    'TRANSP:TRANSPARENT',
    'STATUS:CONFIRMED',
    'END:VEVENT'
  );

  // Stand and walk recurring event
  icsContent.push(
    'BEGIN:VEVENT',
    `UID:ergoflow-stand-${Date.now()}@ergoflow.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=${Intl.DateTimeFormat().resolvedOptions().timeZone}:${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${startH}${startM}00`,
    `DURATION:PT5M`,
    `RRULE:FREQ=WEEKLY;BYDAY=${byDays || 'MO,TU,WE,TH,FR'}`,
    `SUMMARY:🚶 ErgoFlow Stand & Walk Break (${settings.intervals.stand}m interval)`,
    `DESCRIPTION:Stand up from chair and take a 2-3 minute walking loop or calf raises to prevent deep vein thrombosis and reduce sedentary stiffness.`,
    'TRANSP:TRANSPARENT',
    'STATUS:CONFIRMED',
    'END:VEVENT'
  );

  // Screen rest recurring event
  icsContent.push(
    'BEGIN:VEVENT',
    `UID:ergoflow-screen-${Date.now()}@ergoflow.app`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART;TZID=${Intl.DateTimeFormat().resolvedOptions().timeZone}:${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${startH}${startM}00`,
    `DURATION:PT2M`,
    `RRULE:FREQ=WEEKLY;BYDAY=${byDays || 'MO,TU,WE,TH,FR'}`,
    `SUMMARY:👀 ErgoFlow 20-20-20 Screen Rest (${settings.intervals.screen}m interval)`,
    `DESCRIPTION:Look at an object 20 feet away for at least 20 seconds. Blink repeatedly to moisten your cornea and ease ocular strain.`,
    'TRANSP:TRANSPARENT',
    'STATUS:CONFIRMED',
    'END:VEVENT'
  );

  icsContent.push('END:VCALENDAR');

  return icsContent.join('\r\n');
};

export const downloadIcsFile = (settings: UserSettings) => {
  const content = generateIcsCalendar(settings);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'ergoflow-workday-reminders.ics');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
