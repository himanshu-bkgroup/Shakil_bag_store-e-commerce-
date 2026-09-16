import { GoogleGenAI } from '@google/genai';
import { db } from './db';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export function getCleanGeminiModel(customModel?: string): string {
  const raw = (customModel || process.env.GEMINI_MODEL || '').trim();
  if (!raw) {
    return 'gemini-3.8-flash';
  }

  // Lowercase and strip any leading "models/"
  let normalized = raw.toLowerCase().replace(/^models\//, '');

  // Handle common display names or environment aliases like "Gemini 3.8 Flash"
  if (normalized.includes('3.8') && normalized.includes('flash')) {
    return 'gemini-3.8-flash';
  }
  if (normalized.includes('3.1') && normalized.includes('pro')) {
    return 'gemini-3.1-pro-preview';
  }
  if (normalized.includes('3.1') && (normalized.includes('flash-lite') || normalized.includes('lite'))) {
    return 'gemini-3.1-flash-lite';
  }
  if (normalized.includes('flash-latest') || normalized === 'gemini flash' || normalized === 'gemini-flash') {
    return 'gemini-flash-latest';
  }

  // Convert any spaces or underscores to hyphens
  normalized = normalized.replace(/[\s_]+/g, '-');

  // Prevent prohibited / deprecated legacy model strings
  if (
    normalized.startsWith('gemini-1.5') ||
    normalized.startsWith('gemini-2.0') ||
    normalized.startsWith('gemini-2.5') ||
    normalized === 'gemini-pro'
  ) {
    return 'gemini-3.8-flash';
  }

  // Validate format (alphanumeric, dots, and hyphens only)
  if (/^[a-z0-9][a-z0-9.-]+$/.test(normalized)) {
    return normalized;
  }

  return 'gemini-3.8-flash';
}

export async function askGeminiShoppingAssistant(
  userQuery: string,
  chatHistory: Array<{ role: 'user' | 'model'; text: string }> = []
): Promise<{ text: string; leadData?: any; source: 'gemini' | 'fallback' }> {
  const products = await db.getProducts((p) => p.status === 'ACTIVE');
  const categories = await db.getCategories();
  const settings = await db.getSettings();

  // Create a strictly factual catalog summary
  const catalogSummary = products.map((p) => ({
    name: p.name,
    sku: p.sku,
    category: p.category,
    price: `₹${p.salePrice || p.price}`,
    originalPrice: p.salePrice ? `₹${p.price}` : undefined,
    stockQuantity: p.stockQuantity,
    inStock: p.stockQuantity > 0,
    size: p.size,
    material: p.material,
    color: p.color.join(', '),
    capacity: p.capacity ? `${p.capacity.value} ${p.capacity.unit}` : undefined,
    weight: `${p.weight.value} ${p.weight.unit}`,
    warranty: p.warranty,
    shortDescription: p.shortDescription,
    features: p.features.slice(0, 3).join('; ')
  }));

  const systemInstruction = `You are the AI Shopping Concierge for "SHAKIL BAG STORE", a luxury international travel luggage and leather goods brand founded by Mohammad Shakil.
Store Phone/WhatsApp: ${settings.phone || '+91-7217876220'}
Email: ${settings.email || 'himanshu.bkgroup@gmail.com'}
Free Shipping: Orders above ₹${settings.freeShippingThreshold || 999}
Return & Exchange Policy: 7 days hassle-free returns for unused bags with original tags.
Warranty: Original manufacturer & brand warranty ranging from 1 to 7 years.

Available Product Categories:
${categories.map((c) => c.name).join(', ')}

CURRENT APPROVED REAL-TIME CATALOG DATA:
${JSON.stringify(catalogSummary, null, 2)}

STRICT OPERATIONAL RULES:
1. NEVER invent, assume, or hallucinate product prices, stock counts, discounts, delivery dates, or technical specifications that are not explicitly present in the catalog data above.
2. If the customer asks for a product or category not in stock or not listed, politely respond: "I don't have that information in our current catalog. Please contact our team at ${settings.phone} or on WhatsApp, and we will gladly arrange a bespoke check."
3. Speak in an elegant, sophisticated, and helpful tone fitting a premier travel lifestyle house.
4. When recommending bags, prioritize actual customer use-cases (e.g. cabin size guidelines 55cm, international check-in 78cm, business commuting, college, waterproof duffels).
5. If the customer expresses clear buying interest or asks for pricing/quotation for bulk or specific luggage, politely invite them to share their phone or connect directly on WhatsApp (+91-7217876220).`;

  const ai = getAIClient();

  if (!ai || !settings.aiEnabled) {
    // Elegant fallback if GEMINI_API_KEY is not configured yet
    const lower = userQuery.toLowerCase();
    let fallbackAnswer = `Welcome to SHAKIL BAG STORE! We offer handcrafted luxury luggage, IATA cabin trolleys, full-grain leather laptop backpacks, and travel accessories.`;

    if (lower.includes('trolley') || lower.includes('luggage') || lower.includes('cabin')) {
      const trolley = products.find((p) => p.category.toLowerCase().includes('trolley'));
      if (trolley) {
        fallbackAnswer = `Our premier trolley is the **${trolley.name}** (₹${trolley.salePrice || trolley.price}), crafted from ${trolley.material} with silent 360° spinner wheels and recessed TSA locks. In stock: ${trolley.stockQuantity} units.`;
      }
    } else if (lower.includes('backpack') || lower.includes('laptop') || lower.includes('college')) {
      const bpk = products.find((p) => p.category.toLowerCase().includes('backpack') || p.category.toLowerCase().includes('laptop'));
      if (bpk) {
        fallbackAnswer = `For daily carry and business tech, we recommend the **${bpk.name}** (₹${bpk.salePrice || bpk.price}), built with ${bpk.material} and suspended velvet laptop protection.`;
      }
    } else if (lower.includes('return') || lower.includes('policy')) {
      fallbackAnswer = `We offer a 7-day hassle-free return and exchange policy on all unused products with original tags intact.`;
    } else if (lower.includes('contact') || lower.includes('whatsapp') || lower.includes('phone')) {
      fallbackAnswer = `You can reach Mohammad Shakil directly via WhatsApp or phone at +91-7217876220 or email himanshu.bkgroup@gmail.com.`;
    }

    return { text: fallbackAnswer, source: 'fallback' };
  }

  try {
    const primaryModel = getCleanGeminiModel();
    const fallbackModel = 'gemini-3.1-flash-lite';

    // Format chat history context cleanly
    let finalPrompt = userQuery;
    if (chatHistory && chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-6);
      const conversationSummary = recentHistory
        .map((h) => `${h.role === 'model' ? 'AI Concierge' : 'Customer'}: ${h.text}`)
        .join('\n');
      finalPrompt = `Conversation History:\n${conversationSummary}\n\nCurrent Customer Question: ${userQuery}`;
    }

    const executeCall = async (modelToUse: string, timeoutMs = 8000) => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout')), timeoutMs)
      );

      const callPromise = ai.models.generateContent({
        model: modelToUse,
        contents: finalPrompt,
        config: {
          systemInstruction,
          temperature: 0.2
        }
      });

      return (await Promise.race([callPromise, timeoutPromise])) as any;
    };

    let response: any;
    try {
      // Allow 4.5s for primary model (handles rapid 503 or busy spikes without blocking)
      response = await executeCall(primaryModel, primaryModel === fallbackModel ? 8000 : 4500);
    } catch (primaryErr: any) {
      if (primaryModel !== fallbackModel) {
        console.warn(`Primary model ${primaryModel} unavailable (${primaryErr?.message || primaryErr}), switching to ${fallbackModel}...`);
        response = await executeCall(fallbackModel, 8000);
      } else {
        throw primaryErr;
      }
    }

    const outputText = response.text || "I am glad to assist you with Shakil Bag Store's luxury collection. How may I guide your travel choice?";
    return { text: outputText, source: 'gemini' };
  } catch (error) {
    console.error('Gemini shopping assistant call error:', error);
    return {
      text: "Welcome to Shakil Bag Store! For business trips, we recommend our AeroShield Elite Cabin Hard Trolley (55cm) with Japanese Hinomoto silent spinner wheels, TSA lock, and laptop compartment. For custom sizing or quotes, feel free to call or WhatsApp Mohammad Shakil directly at +91-7217876220.",
      source: 'fallback'
    };
  }
}

export async function qualifyBuyerIntent(message: string): Promise<{
  intent: 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
  budget?: string;
  extractedNeeds?: string;
}> {
  const ai = getAIClient();
  if (!ai) {
    const isHigh = /buy|order|price|cost|urgent|discount|wholesale|bulk|under ₹|under \d+/i.test(message);
    return {
      intent: isHigh ? 'HIGH' : 'MEDIUM',
      extractedNeeds: message
    };
  }

  try {
    const primaryModel = getCleanGeminiModel();
    const fallbackModel = 'gemini-3.1-flash-lite';
    const prompt = `Analyze this customer inquiry for a luxury luggage & bag store:
"${message}"

Extract JSON only with keys:
- "intent": "HIGH" | "MEDIUM" | "LOW"
- "category": name of bag or accessory type if mentioned, or null
- "budget": extracted budget or null
- "extractedNeeds": short one-line summary of requirement`;

    const executeCall = async (modelToUse: string) => {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI qualify timeout')), 8000)
      );

      const callPromise = ai.models.generateContent({
        model: modelToUse,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      return (await Promise.race([callPromise, timeoutPromise])) as any;
    };

    let response: any;
    try {
      response = await executeCall(primaryModel);
    } catch (primaryErr) {
      if (primaryModel !== fallbackModel) {
        response = await executeCall(fallbackModel);
      } else {
        throw primaryErr;
      }
    }

    const parsed = JSON.parse(response.text || '{}');
    return {
      intent: parsed.intent || 'MEDIUM',
      category: parsed.category,
      budget: parsed.budget,
      extractedNeeds: parsed.extractedNeeds || message
    };
  } catch (e) {
    return { intent: 'MEDIUM', extractedNeeds: message };
  }
}

export async function generatePersonalizedRecoveryCopy(
  stage: '60m' | '3h' | '6h' | '12h' | '24h',
  customerName: string,
  productSummary: string,
  cartTotal: number,
  checkoutLink: string
): Promise<string> {
  const ai = getAIClient();

  // Baseline verified templates
  const staticTemplates = {
    '60m': `Hi ${customerName}, you left a few items in your cart at Shakil Bag Store.\n\nYour cart is still waiting for you.\n\n${productSummary}\n\nCart Total: ₹${cartTotal.toLocaleString('en-IN')}\n\nComplete your order here:\n${checkoutLink}\n\nNeed help? Reply to this message.`,
    '3h': `Hi ${customerName}, just checking in about your cart at Shakil Bag Store.\n\nYou selected:\n${productSummary}\n\nYour cart total is ₹${cartTotal.toLocaleString('en-IN')}.\n\nIf you have any questions about size, material, availability or delivery, we're happy to help.\n\n${checkoutLink}`,
    '6h': `Hi ${customerName}, your selected items at Shakil Bag Store are still reserved for your review.\n\n${productSummary}\nTotal: ₹${cartTotal.toLocaleString('en-IN')}\n\nReturn to your checkout anytime:\n${checkoutLink}\n\nFeel free to ask any questions regarding airline cabin sizing or warranty!`,
    '12h': `Hi ${customerName}, your selected items are still in your Shakil Bag Store cart.\n\nIf you need help choosing the right size, bag type or trolley, our team can help.\n\nView your cart:\n${checkoutLink}\n\nReply here if you need assistance.`,
    '24h': `Hi ${customerName}, this is a final reminder about your Shakil Bag Store cart.\n\nYour selected items:\n${productSummary}\n\nYou can return to your cart here:\n${checkoutLink}\n\nIf you no longer want these items, you can simply ignore this message or reply STOP.`
  };

  if (!ai) {
    return staticTemplates[stage];
  }

  try {
    const primaryModel = getCleanGeminiModel();
    const fallbackModel = 'gemini-3.1-flash-lite';
    const prompt = `Write a polite, luxury-tone WhatsApp recovery message for Shakil Bag Store (Mohammad Shakil).
Stage: ${stage}
Customer Name: ${customerName}
Selected Products: ${productSummary}
Total Amount: ₹${cartTotal}
Checkout Link: ${checkoutLink}

MANDATORY RULES:
- Never invent discounts or fake urgency like "only 1 left" or "thousands buying".
- Must keep exact total ₹${cartTotal} and exact link ${checkoutLink}.
- Keep it concise, helpful, and under 100 words.
- For 24h stage, mention they can ignore or reply STOP to opt out.`;

    let response: any;
    try {
      response = await ai.models.generateContent({
        model: primaryModel,
        contents: prompt
      });
    } catch (err) {
      if (primaryModel !== fallbackModel) {
        response = await ai.models.generateContent({
          model: fallbackModel,
          contents: prompt
        });
      } else {
        throw err;
      }
    }

    const copy = response.text?.trim();
    return copy && copy.includes(checkoutLink) ? copy : staticTemplates[stage];
  } catch (e) {
    return staticTemplates[stage];
  }
}
