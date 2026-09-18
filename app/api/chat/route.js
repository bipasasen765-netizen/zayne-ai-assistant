import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_GREEN_URL = (process.env.GREEN_API_URL || '').replace(/\/+$/, '');
const DEFAULT_GREEN_ID = process.env.GREEN_API_ID_INSTANCE || '';
const DEFAULT_GREEN_TOKEN = process.env.GREEN_API_TOKEN || '';

const apiKeys = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',')
  .map((k) => k.trim())
  .filter(Boolean);

let currentWorkingKeyIndex = 0;
const MODEL_CANDIDATES = ['gemini-3.7-flash', 'gemini-3.6-flash'];

function formatToWhatsAppChatId(rawPhone) {
  let cleaned = (rawPhone || '').replace(/[^0-9]/g, '');
  cleaned = cleaned.replace(/^0+/, '');
  if (cleaned.length === 10) cleaned = `91${cleaned}`;
  return `${cleaned}@c.us`;
}

function extractCleanTopic(rawQuery) {
  let q = (rawQuery || '').toLowerCase().trim();
  q = q.replace(/^(can you\s+)?(please\s+)?(tell me about|tell me|explain to me|explain|what is|what are|who is|who was|details on|kya hai|ke baare mein batao|batao|kya hota hai)\s+/i, '');
  q = q.replace(/\s+(kya hai|batao|ke baare mein|kise kehte hain)\s*$/i, '');
  q = q.replace(/[?.,!]+$/g, '').trim();
  return q || rawQuery.trim();
}

async function fetchFreeSearchSummary(topic) {
  const cleanTopic = extractCleanTopic(topic);
  const encoded = encodeURIComponent(cleanTopic);

  // ১. উইকিপিডিয়া সার্চ (৩ সেকেন্ড ফাস্ট টাইম-আউট)
  try {
    const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encoded}&utf8=&format=json`;
    const searchRes = await fetch(wikiSearchUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0' }, 
      signal: AbortSignal.timeout(3000) 
    });
    
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      const firstTitle = searchData?.query?.search?.[0]?.title;

      if (firstTitle) {
        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(firstTitle)}`;
        const summaryRes = await fetch(summaryUrl, { 
          headers: { 'User-Agent': 'Mozilla/5.0' }, 
          signal: AbortSignal.timeout(3000) 
        });
        
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          if (summaryData.extract && summaryData.extract.trim().length > 20) {
            return summaryData.extract.trim();
          }
        }
      }
    }
  } catch (err) {}

  // ২. ডাকডাকগো ইনস্ট্যান্ট অ্যান্সার ফলব্যাক (২.৫ সেকেন্ড টাইম-আউট)
  try {
    const ddgUrl = `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`;
    const ddgRes = await fetch(ddgUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0' }, 
      signal: AbortSignal.timeout(2500) 
    });

    if (ddgRes.ok) {
      const ddgData = await ddgRes.json();
      if (ddgData.AbstractText && ddgData.AbstractText.trim()) {
        return ddgData.AbstractText.trim();
      }
      if (ddgData.Answer && ddgData.Answer.trim()) {
        return ddgData.Answer.trim();
      }
    }
  } catch (err) {}

  return null;
}

async function fetchYouTubeVideoId(query) {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(3000),
    });
    const html = await res.text();
    const match = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function findContactInSupabase(cleanRecipient) {
  const keyword = cleanRecipient
    .replace(/^(my|the|dear|boss)\s+/i, '')
    .replace(/('s|\s+number|\s+contact|\s+ko|\s+ka|\s+ki)$/i, '')
    .trim()
    .toLowerCase();

  try {
    const { data } = await supabase
      .from('user_contacts')
      .select('phone_number')
      .ilike('contact_name', `%${keyword}%`)
      .limit(1)
      .maybeSingle();

    if (data?.phone_number) return data.phone_number;
  } catch (err) {}
  return null;
}

async function executeWhatsAppSend({ recipient, text, customGreenApi, isHindiUser }) {
  const cleanRecipient = (recipient || '').toLowerCase().trim();
  let targetPhone = cleanRecipient.replace(/[^0-9]/g, '');

  if (cleanRecipient === 'sister' || cleanRecipient === 'sis') {
    targetPhone = '8967769599';
  } else if (!targetPhone || targetPhone.length < 8) {
    targetPhone = await findContactInSupabase(cleanRecipient);
  }

  if (!targetPhone) {
    return {
      reply: isHindiUser
        ? `बॉस, डेटाबेस में ${recipient} का कोई नंबर नहीं मिला।`
        : `Boss, no contact number found for ${recipient}.`,
    };
  }

  const chatId = formatToWhatsAppChatId(targetPhone);
  const activeUrl = (customGreenApi?.apiUrl || DEFAULT_GREEN_URL).replace(/\/+$/, '');
  const activeId = customGreenApi?.idInstance || DEFAULT_GREEN_ID;
  const activeToken = customGreenApi?.apiToken || DEFAULT_GREEN_TOKEN;

  if (activeUrl && activeId && activeToken) {
    fetch(`${activeUrl}/waInstance${activeId}/sendMessage/${activeToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message: text }),
    }).catch(() => {});
  }

  return {
    reply: isHindiUser
      ? "बॉस, मैं आपका संदेश तुरंत भेज रहा हूँ। आपका अगला आदेश क्या है?"
      : "I'm dispatching your message right now, Boss. It might take just a moment. What is your next task?",
    action: 'whatsapp_auto_sent',
  };
}

export async function POST(req) {
  try {
    let body = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ reply: 'Invalid request body, Boss.' }, { status: 400 });
    }

    const { message, history = [], customGreenApi } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ reply: 'I did not receive any input, Boss.' });
    }

    if (apiKeys.length === 0) {
      return NextResponse.json({ reply: 'API key not configured in environment, Boss.' });
    }

    const isHindiUser = /[\u0900-\u097F]/.test(message);
    const cleanMsg = message.trim().toLowerCase();

    // ১. ইউটিউব ডিরেক্ট কমান্ড (জিরো লেটেন্সি)
    const isVideoRequest = /\b(video|fullscreen|full screen|open youtube)\b/i.test(cleanMsg);
    const isMusicRequest = /\b(play|song|music|gana|chalao|bajao)\b/i.test(cleanMsg);

    if (isMusicRequest || isVideoRequest) {
      const extractedQuery = cleanMsg
        .replace(/^(please\s+)?(can\s+you\s+)?(play\s+the\s+video|play\s+video|play\s+song|play|open\s+youtube|open|watch)\s+/i, '')
        .replace(/\s+(on\s+youtube|in\s+youtube|video|song)$/i, '')
        .trim() || message;

      const videoId = await fetchYouTubeVideoId(extractedQuery);

      if (isVideoRequest) {
        return NextResponse.json({
          reply: isHindiUser ? `यूट्यूब पर "${extractedQuery}" वीडियो खोल रहा हूँ, बॉस।` : `Opening "${extractedQuery}" on YouTube for you, Boss.`,
          action: 'youtube_redirect',
          url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(extractedQuery)}`,
        });
      } else {
        return NextResponse.json({
          reply: isHindiUser ? `यूट्यूब पर "${extractedQuery}" चला रहा हूँ, बॉस।` : `Playing "${extractedQuery}" right now, Boss.`,
          action: 'youtube_play_inline',
          query: extractedQuery,
          videoId: videoId || null,
        });
      }
    }

    // ২. হোয়াটসঅ্যাপ ডিরেক্ট কমান্ড (জিরো লেটেন্সি)
    const isWhatsAppIntent = /\b(send\s+whatsapp|whatsapp|send\s+message|karo\s+whatsapp|message\s+bhejo)\b/i.test(cleanMsg);
    if (isWhatsAppIntent) {
      let recipient = 'sister';
      let text = 'Hi';

      const splitByColon = message.split(/[:：]\s*(.+)/s);
      const splitByThat = message.split(/\b(?:that|saying|bolna|likho|likhe)\b\s*(.+)/i);

      if (splitByColon[1]) text = splitByColon[1].trim();
      else if (splitByThat[1]) text = splitByThat[1].trim();

      if (!/\b(sis|sister)\b/i.test(cleanMsg)) {
        const matchName = cleanMsg.match(/(?:to|message|whatsapp)\s+([a-zA-Z0-9_\u0900-\u097F]+)/i);
        if (matchName && !['send', 'karo', 'mujhe', 'message', 'whatsapp'].includes(matchName[1].toLowerCase())) {
          recipient = matchName[1].trim();
        }
      }

      text = text.replace(/^[.\s,:;!?]+|[.\s,:;!?]+$/g, '').trim() || 'Hi';
      const result = await executeWhatsAppSend({ recipient, text, customGreenApi, isHindiUser });
      return NextResponse.json(result);
    }

    // ৩. সিস্টেম প্রম্পট (অপ্টিমাইজড ও ফাস্ট)
    const systemInstruction = `
You are Zayne, an executive Employee and personal companion.
- Address user respectfully as "Boss". In Hindi use "आप".
- Language: Reply strictly in English or formal Hindi based on input.
- Keep replies concise, snappy, and under 2 sentences.
`;

    const rawHistory = Array.isArray(history) ? history : [];
    const cleanedContents = [];
    for (const item of rawHistory.slice(-3)) {
      const text = item.text?.trim() || '';
      if (!text || text.includes('Online and ready') || text.includes('Standing by, Boss')) continue;
      const role = item.role === 'assistant' ? 'model' : 'user';
      if (cleanedContents.length > 0 && cleanedContents[cleanedContents.length - 1].role === role) continue;
      cleanedContents.push({ role, parts: [{ text }] });
    }

    while (cleanedContents.length > 0 && cleanedContents[0].role !== 'user') cleanedContents.shift();
    if (cleanedContents.length > 0 && cleanedContents[cleanedContents.length - 1].role === 'user') {
      cleanedContents[cleanedContents.length - 1] = { role: 'user', parts: [{ text: message }] };
    } else {
      cleanedContents.push({ role: 'user', parts: [{ text: message }] });
    }

    let response = null;
    let isQuotaExhausted = false;
    const totalKeys = apiKeys.length;

    keyLoop: for (let attempts = 0; attempts < totalKeys; attempts++) {
      const activeIndex = (currentWorkingKeyIndex + attempts) % totalKeys;
      const activeKey = apiKeys[activeIndex];
      const ai = new GoogleGenAI({ apiKey: activeKey });

      for (const targetModel of MODEL_CANDIDATES) {
        try {
          response = await ai.models.generateContent({
            model: targetModel,
            contents: cleanedContents,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingBudget: 0 }, // ইনস্ট্যান্ট রেসপন্স
              maxOutputTokens: 250,
              temperature: 0.6,
            },
          });

          if (response) {
            currentWorkingKeyIndex = activeIndex;
            isQuotaExhausted = false;
            break keyLoop;
          }
        } catch (err) {
          const errMsg = err?.message || '';
          const status = err?.status || 0;
          if (status === 429 || errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')) {
            isQuotaExhausted = true;
            continue;
          }
        }
      }
    }

    // ৪. কোটা শেষ হলে নিখুঁত ফ্রি সার্চ আর্কিটেকচার
    if (!response && isQuotaExhausted) {
      const cleanTopic = extractCleanTopic(message);
      const isDirectQuestion = /\b(tell me|what is|how to|who is|explain|kya|batao)\b/i.test(message);

      // ইউজার যদি সংক্ষিপ্ত টপিক বলে, তবে সরাসরি ফ্রি সার্চ রেজাল্ট দেওয়া হবে
      if (!isDirectQuestion && cleanTopic.split(/\s+/).length <= 4) {
        const searchResult = await fetchFreeSearchSummary(cleanTopic);
        if (searchResult) {
          const webReply = isHindiUser
            ? `बॉस, आपके विषय "${cleanTopic}" की जानकारी यह रही:\n\n${searchResult}`
            : `Boss, here is the summary on "${cleanTopic}":\n\n${searchResult}`;
          return NextResponse.json({ reply: webReply });
        }
      }

      // বড় প্রশ্ন বা নির্দেশিকা চাইলে
      const quotaGuidanceReply = isHindiUser
        ? 'बॉस, आज के लिए मेरा कोटा समाप्त हो गया है। कल मिलते हैं। लेकिन अगर आप मुझे केवल विषय (Topic) का नाम बताएंगे, तो मैं अब भी उत्तर दे सकता हूँ।'
        : 'My quota limit is finished today, Boss. See you next day. But you can still get answers if you tell me only the topic.';

      return NextResponse.json({ reply: quotaGuidanceReply });
    }

    let rawReply = '';
    if (typeof response?.text === 'function') {
      try { rawReply = response.text(); } catch (e) {}
    } else if (typeof response?.text === 'string') {
      rawReply = response.text;
    }

    if (!rawReply && response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) rawReply += part.text;
      }
    }

    return NextResponse.json({ 
      reply: rawReply?.trim() || (isHindiUser ? 'आज्ञा दीजिए, बॉस।' : 'Standing by, Boss. What is your command?') 
    });

  } catch (error) {
    return NextResponse.json({ reply: 'Standing by, Boss. What is your command?' });
  }
}