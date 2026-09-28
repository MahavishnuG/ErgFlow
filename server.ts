import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API endpoint for AI Wellness Coach
  app.post('/api/ai-wellness-coach', async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not configured.' });
      }

      const { activityLogs, currentGoals, currentStats } = req.body;

      const prompt = `You are the ErgoFlow AI Occupational Wellness & Ergonomics Coach.
Analyze the user's workday activity logs and metrics for their 9:00 AM - 6:00 PM desk schedule, and suggest personalized, achievable micro-adjustments to their daily targets and break intervals.

Current Settings & Goals:
- Water Target: ${currentGoals?.waterMl || 2500} ml
- Stand Breaks Target: ${currentGoals?.standBreaks || 10} breaks
- Screen Rests Target: ${currentGoals?.screenRests || 18} rests
- Max Continuous Sedentary Limit: ${currentGoals?.maxContinuousSedentaryMins || 45} mins

Today's Performance Metrics:
- Water consumed: ${currentStats?.todayWaterMl || 0} ml
- Stand breaks completed: ${currentStats?.todayStandBreaks || 0} breaks
- Active walking minutes: ${currentStats?.todayActiveMins || 0} mins
- Screen rests completed: ${currentStats?.todayScreenRests || 0} rests
- Total desk sitting time today: ${currentStats?.totalSittingMins || 0} mins
- Continuous sitting right now: ${currentStats?.continuousSittingMins || 0} mins
- Current health index: ${currentStats?.healthScore || 80}/100
- Workday streak: ${currentStats?.currentStreak || 0} days

Recent Activity Logs:
${JSON.stringify((activityLogs || []).slice(0, 15), null, 2)}

Provide evidence-based occupational ergonomics recommendations:
1. Provide a personalized evaluation headline and 2-3 specific behavioral observations.
2. Suggest realistic micro-adjustments for their goals (e.g. increase or decrease water by 250ml, adjust stand breaks by +1/-1, tune continuous sitting cutoff).
3. Suggest tuned timer intervals (in minutes) for water, stand breaks, and screen rests.
4. Give a practical posture/ergonomics tip for today.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an empathetic, clinical occupational wellness & ergonomics coach specializing in desk workers, sedentary reduction, ocular strain prevention, and sustainable habit formation. Always return valid structured JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coachTitle: {
                type: Type.STRING,
                description: 'Brief encouraging assessment headline, e.g. "Steady Hydration, Time to Unstick Your Spine"',
              },
              overallEvaluation: {
                type: Type.STRING,
                description: '2-3 sentence empathetic summary of the user workday posture and habits.',
              },
              ergonomicObservations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-3 specific observations based on their logged activities.',
              },
              suggestedAdjustments: {
                type: Type.OBJECT,
                properties: {
                  recommendedWaterMl: { type: Type.INTEGER },
                  waterReason: { type: Type.STRING },
                  recommendedStandBreaks: { type: Type.INTEGER },
                  standReason: { type: Type.STRING },
                  recommendedScreenRests: { type: Type.INTEGER },
                  screenReason: { type: Type.STRING },
                  recommendedMaxContinuousSedentaryMins: { type: Type.INTEGER },
                  sedentaryReason: { type: Type.STRING },
                },
                required: [
                  'recommendedWaterMl',
                  'waterReason',
                  'recommendedStandBreaks',
                  'standReason',
                  'recommendedScreenRests',
                  'screenReason',
                  'recommendedMaxContinuousSedentaryMins',
                  'sedentaryReason',
                ],
              },
              recommendedBreakIntervals: {
                type: Type.OBJECT,
                properties: {
                  waterMinutes: { type: Type.INTEGER, description: 'Recommended interval in minutes (e.g. 40 or 45)' },
                  standMinutes: { type: Type.INTEGER, description: 'Recommended interval in minutes (e.g. 40 or 45)' },
                  screenMinutes: { type: Type.INTEGER, description: 'Recommended interval in minutes (e.g. 20)' },
                },
                required: ['waterMinutes', 'standMinutes', 'screenMinutes'],
              },
              motivationalTip: {
                type: Type.STRING,
                description: '1 concise, actionable ergonomic tip for today.',
              },
            },
            required: [
              'coachTitle',
              'overallEvaluation',
              'ergonomicObservations',
              'suggestedAdjustments',
              'recommendedBreakIntervals',
              'motivationalTip',
            ],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('No response from Gemini API');
      }

      const result = JSON.parse(text);
      res.json(result);
    } catch (err: any) {
      console.error('AI Wellness Coach Error:', err);
      res.status(500).json({ error: err.message || 'Failed to generate wellness coaching.' });
    }
  });

  // Vite integration
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`ErgoFlow Server running on port ${port}`);
  });
}

startServer();
