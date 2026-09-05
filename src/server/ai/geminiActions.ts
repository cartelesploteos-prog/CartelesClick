// 🔒 SERVER-ONLY GUARD
// Garantiza que este módulo NUNCA sea empaquetado o ejecutado en el cliente (navegador).
if (typeof window !== 'undefined') {
  throw new Error('FATAL SECURITY VIOLATION: src/server/ai/geminiActions.ts is server-only and cannot be executed in the browser.');
}

import { GoogleGenAI, Type } from '@google/genai';

/**
 * Helper lazy para inicializar el cliente oficial de Gemini en el servidor.
 * La API key solo vive en process.env.GEMINI_API_KEY y jamás viaja al frontend.
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'carteles-click-server',
      },
    },
  });
}

export interface PosterAssistantInput {
  promptTopic?: string;
  purpose?: string;
  targetAudience?: string;
  currentHeadline?: string;
}

export interface PosterAssistantOutput {
  headline: string;
  subheadline: string;
  bodyText: string;
  recommendedPalette: string;
  primaryColorHex?: string;
  accentColorHex?: string;
  fontHeadingRecommendation?: string;
  taglines: string[];
  compositionAdvice: string;
}

/**
 * Server Action: Generador Creativo para Carteles y Lonas Gran Formato
 */
export async function generatePosterDesignAction(input: PosterAssistantInput): Promise<PosterAssistantOutput> {
  const ai = getGeminiClient();

  // Fallback estructurado si no hay API key configurada en el servidor
  if (!ai) {
    return {
      headline: 'GRAN LIQUIDACIÓN DE TEMPORADA',
      subheadline: 'Hasta 50% OFF en todos los productos seleccionados',
      bodyText: 'Aprovechá ofertas imperdibles por tiempo limitado. Calidad garantizada y cuotas sin interés.',
      recommendedPalette: 'Vibrante Moderno (Azul Marino + Amarillo Alerta)',
      primaryColorHex: '#1E3A8A',
      accentColorHex: '#FBBF24',
      taglines: ['¡No te lo pierdas!', 'Stock limitado', 'Envíos a todo el país'],
      compositionAdvice: 'Ubicá el titular en el tercio superior con tipografía bold contrastada. Los datos de contacto al pie.',
      fontHeadingRecommendation: 'display',
    };
  }

  const systemInstruction = `Sos un Director Creativo experto en diseño gráfico y cartelería de vía pública en gran formato para Carteles.Click. 
Tu objetivo es generar copys de alto impacto, legibles a la distancia, concisos y estructurados, optimizados para carteles, lonas frontales o portabanners.
Respondé siempre en JSON estructurado.`;

  const promptText = `Generá una propuesta creativa de póster para:
- Rubro/Tema: ${input.promptTopic || 'Comercial / Promocional'}
- Propósito: ${input.purpose || 'Venta y atracción peatonal'}
- Público: ${input.targetAudience || 'Transeúntes y clientes locales'}
- Idea base del cliente: ${input.currentHeadline || 'Oferta especial'}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: promptText,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING, description: 'Titular principal corto e impactante (máx 6 palabras).' },
          subheadline: { type: Type.STRING, description: 'Bajada complementaria de beneficio (máx 12 palabras).' },
          bodyText: { type: Type.STRING, description: 'Cuerpo breve de 1 o 2 oraciones con llamada a la acción.' },
          recommendedPalette: { type: Type.STRING, description: 'Combinación cromática recomendada.' },
          primaryColorHex: { type: Type.STRING, description: 'Color primario de fondo o contraste en formato HEX.' },
          accentColorHex: { type: Type.STRING, description: 'Color secundario de acento en formato HEX.' },
          fontHeadingRecommendation: { type: Type.STRING, description: 'Recomendación: sans, serif, display, o mono.' },
          taglines: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: '3 frases cortas de gancho para el póster.' 
          },
          compositionAdvice: { type: Type.STRING, description: 'Consejo técnico de legibilidad en gran formato.' }
        },
        required: ['headline', 'subheadline', 'bodyText', 'recommendedPalette', 'taglines', 'compositionAdvice']
      }
    }
  });

  const jsonStr = response.text?.trim() || '{}';
  return JSON.parse(jsonStr);
}

export interface LiveChatSupportInput {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; text: string }>;
  currentView?: string;
  catalogSummary?: string;
}

export interface LiveChatSupportOutput {
  reply: string;
  agentName: string;
  suggestedAction?: {
    type: 'navigate';
    label: string;
    view: string;
    param?: string;
  } | null;
  detectedQuote?: {
    materialName: string;
    widthCm: number;
    heightCm: number;
    quantity: number;
    estimatedTotalARS: number;
  };
  timestamp: string;
}

/**
 * Server Action: Chatbot Sofi Asistente de Taller en Vivo con Gemini
 */
export async function liveChatSupportAction(input: LiveChatSupportInput): Promise<LiveChatSupportOutput> {
  const { message, history = [], currentView = 'home', catalogSummary = '' } = input;
  const ai = getGeminiClient();

  if (!ai) {
    const lowerMsg = message.toLowerCase();
    let replyText = '¡Hola! Soy Sofi, asesora de taller en **Carteles.Click**. ';
    let suggestedAction: any = null;

    if (lowerMsg.includes('lona') || lowerMsg.includes('front') || lowerMsg.includes('backlight')) {
      replyText += `Para lonas tenemos opciones desde **$15.000/m²** en Lona Front Standard 13oz hasta Lona Backlight con doble pasada a **$19.400/m²**. Todas con doblado y refuerzo opcional. ¿Qué medida necesitás cotizar?`;
      suggestedAction = { type: 'navigate', label: 'Ver Cotizador de Lonas', view: 'cotizador', param: 'lona_front' };
    } else if (lowerMsg.includes('vinilo') || lowerMsg.includes('ploteo') || lowerMsg.includes('microperforado')) {
      replyText += `Nuestros vinilos más pedidos son el **Vinilo Brillante/Mate a $15.000/m²** y el **Microperforado para vidrieras/autos a $16.600/m²**. También hacemos laminado protector UV para intemperie extrema.`;
      suggestedAction = { type: 'navigate', label: 'Cotizar Vinilos', view: 'cotizador', param: 'vinilo_comun' };
    } else if (lowerMsg.includes('dpi') || lowerMsg.includes('resolucion') || lowerMsg.includes('archivo') || lowerMsg.includes('pdf')) {
      replyText += `Para cartelería exterior en gran formato recomendemos trabajar a **150 DPI a tamaño real (escala 1:1)** o a **300 DPI a escala 1:2**. Espacio de color CMYK y textos convertidos a curvas/vector.`;
      suggestedAction = { type: 'navigate', label: 'Leer Guía de Pre-Prensa', view: 'diccionario' };
    } else if (lowerMsg.includes('envio') || lowerMsg.includes('despacho') || lowerMsg.includes('tiempo') || lowerMsg.includes('demora')) {
      replyText += `Los trabajos ingresados antes de las 13hs entran a cola de impresión el mismo día. La producción estándar demora **24/48hs hábiles**. Hacemos envíos a todo el país o retiro sin cargo por nuestro taller.`;
      suggestedAction = { type: 'navigate', label: 'Ver Mis Pedidos', view: 'pedidos' };
    } else {
      replyText += `Puedo ayudarte con **cotizaciones en vivo**, recomendación de materiales (lonas, vinilos, rígidos), tiempos de entrega o asistencia en diseño con IA. ¿En qué proyecto estás trabajando?`;
      suggestedAction = { type: 'navigate', label: 'Ir al Cotizador Vivo', view: 'cotizador' };
    }

    return {
      reply: replyText,
      agentName: 'Sofi (Asesora Taller)',
      suggestedAction,
      timestamp: new Date().toISOString()
    };
  }

  const systemInstruction = `Sos Sofi, la asesora técnica en vivo del taller de imprenta digital de gran formato Carteles.Click (Argentina).
Tu función es brindar atención al cliente rápida, cálida, experta y transparente a transeúntes, diseñadores, empresas y revendedores.

DIRECTRICES DE RESPUESTA:
1. Idioma: Español rioplatense (es-AR, voseo cordial y profesional).
2. Tono: Cercano, de taller experto pero moderno y directo. Sin rodeos innecesarios. Usá negritas para destacar precios, medidas y materiales.
3. Catálogo de productos actual de taller:
${catalogSummary}

4. Reglas de Negocio Clave:
- Lonas y Vinilos: Se cotizan por m² (superficie).
- Rígidos (PVC, Corrugado, PAI): Se comercializan por placa entera (122x244 cm o 100x200 cm).
- Tiempos de fabricación: 24/48 hs hábiles desde la aprobación del archivo en CMYK a 150 DPI.
- Envíos: Despacho exprés a todo el país o retiro por taller.

5. Formato de salida: Devolvé SIEMPRE un objeto JSON estructurado con:
- "reply": Tu respuesta completa formateada con markdown (listas, negrita, saltos de línea prolijos).
- "suggestedAction": Opcional { "type": "navigate", "label": "Texto Botón CTA", "view": "cotizador" | "poster" | "materiales" | "pedidos" | "diccionario" } si corresponde dirigir al usuario a una sección.
- "detectedQuote": Opcional objeto si el usuario pide cotizar un material concreto con medidas: { "materialName": string, "widthCm": number, "heightCm": number, "quantity": number, "estimatedTotalARS": number }.
`;

  const formattedHistory = Array.isArray(history) 
    ? history.slice(-6).map(h => `${h.role === 'user' ? 'Cliente' : 'Sofi'}: ${h.text}`).join('\n') 
    : '';

  const promptText = `
Historial reciente de la conversación:
${formattedHistory}

Vista actual del sitio donde está el cliente: ${currentView}
Mensaje actual del Cliente: "${message}"

Respondé según las directrices en formato JSON estricto.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: promptText,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          reply: { type: Type.STRING },
          suggestedAction: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              label: { type: Type.STRING },
              view: { type: Type.STRING },
              param: { type: Type.STRING }
            }
          },
          detectedQuote: {
            type: Type.OBJECT,
            properties: {
              materialName: { type: Type.STRING },
              widthCm: { type: Type.NUMBER },
              heightCm: { type: Type.NUMBER },
              quantity: { type: Type.NUMBER },
              estimatedTotalARS: { type: Type.NUMBER }
            }
          }
        },
        required: ['reply']
      }
    }
  });

  const parsed = JSON.parse(response.text?.trim() || '{}');
  return {
    reply: parsed.reply || 'Recibí tu consulta, ¿en qué más te puedo asesorar?',
    agentName: 'Sofi (Asesora Taller)',
    suggestedAction: parsed.suggestedAction || null,
    detectedQuote: parsed.detectedQuote,
    timestamp: new Date().toISOString()
  };
}

export interface BlogGeneratorInput {
  topic?: string;
  targetAudience?: string;
  tone?: string;
}

export interface BlogGeneratorOutput {
  title: string;
  excerpt: string;
  tag: string;
  readTime: string;
  content: string;
}

/**
 * Server Action: Generador de Artículos Técnicos para Blog
 */
export async function generateBlogArticleAction(input: BlogGeneratorInput): Promise<BlogGeneratorOutput> {
  const ai = getGeminiClient();
  const { topic, targetAudience, tone } = input;

  if (!ai) {
    return {
      title: `Guía Maestra: ${topic || 'Tendencias en Cartelería y Gran Formato 2026'}`,
      excerpt: 'Cómo optimizar la durabilidad, impacto visual y costo por metro cuadrado en aplicaciones comerciales.',
      tag: 'Producción Gráfica',
      readTime: '5 min de lectura',
      content: `## Claves Técnicas de ${topic || 'Impresión en Gran Formato'}\n\nEn este artículo repasamos las mejores prácticas para confección, tensado de lonas y laminados protectores UV para maximizar la vida útil en vía pública.\n\n### 1. Preparación de Archivos\n- Escala 1:1 a 150 DPI o 1:10 a 300 DPI.\n- Perfil de color FOGRA39 (CMYK).\n\n### 2. Elección de Sustrato\n- Seleccionar el material acorde al tiempo de exposición.\n- En zonas de alto viento, priorizar Lona Mesh o refuerzo perimetral con vaina termosellada.`
    };
  }

  const promptText = `Generá un artículo técnico profesional para el blog de Carteles.Click (imprenta gran formato).
Tema: ${topic || 'Consejos para cartelería exterior duradera'}
Audiencia: ${targetAudience || 'Diseñadores, agencias de publicidad y carteleros'}
Tono: ${tone || 'Técnico, práctico y claro'}
Respondé en formato JSON con title, excerpt, tag, readTime, y content en Markdown.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: promptText,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          excerpt: { type: Type.STRING },
          tag: { type: Type.STRING },
          readTime: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ['title', 'excerpt', 'tag', 'readTime', 'content']
      }
    }
  });

  return JSON.parse(response.text?.trim() || '{}');
}
