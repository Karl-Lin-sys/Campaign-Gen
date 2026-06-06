import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Loader2, Send, Lightbulb, Image as ImageIcon, Copy, CheckCircle2 } from 'lucide-react';
import type { CampaignData, BodyOption } from './types';

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [error, setError] = useState("");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const generateCampaign = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError("");
    setCampaign(null);
    try {
      const response = await fetch("/api/campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate campaign");
      }
      setCampaign(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-gray-900">Campaign Gen</h1>
              <p className="text-sm text-gray-500 font-medium">AI Email Marketing Creator</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-8 flex flex-col gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <label htmlFor="prompt" className="block text-sm font-semibold text-gray-900 mb-2">
            What is the campaign about?
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Announce our new summer collection of sustainable swimwear, highlighting the 20% early bird discount..."
              className="w-full resize-none bg-gray-50 border border-gray-200 text-gray-900 text-base rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-colors"
            />
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={generateCampaign}
              disabled={isGenerating || !prompt.trim()}
              className="bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 text-white font-medium py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Campaign
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}

        <AnimatePresence>
          {campaign && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6 pb-20"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col gap-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      <h2 className="text-lg font-semibold text-gray-900">Subject Lines</h2>
                    </div>
                    <ul className="flex flex-col gap-3">
                      {campaign.subjectLines.map((subject, idx) => (
                        <li key={idx} className="group relative bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-300 transition-colors">
                          <p className="text-gray-800 text-sm font-medium pr-8">{subject}</p>
                          <button
                            onClick={() => handleCopy(subject)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-gray-900"
                          >
                            {copiedText === subject ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="md:col-span-2 flex flex-col gap-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <h2 className="text-lg font-semibold text-gray-900">Body Copy Options</h2>
                    </div>
                    <div className="flex flex-col gap-6">
                      {campaign.bodyOptions.map((option: BodyOption, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                          <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">{option.tone} Tone</span>
                            <button
                              onClick={() => handleCopy(option.content)}
                              className="text-gray-400 hover:text-gray-900 transition-colors"
                            >
                              {copiedText === option.content ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <div className="p-4 text-gray-700 text-sm whitespace-pre-wrap leading-relaxed space-y-4">
                            {option.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {campaign.images && campaign.images.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-purple-500" />
                    <h2 className="text-lg font-semibold text-gray-900">Generated Visuals</h2>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {campaign.images.map((img, idx) => (
                      <div key={idx} className="flex flex-col gap-3 group">
                        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                          <img
                            src={img.url}
                            alt={img.prompt}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-mono">
                          {img.prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
