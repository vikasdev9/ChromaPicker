/**
 * OCR Service for Image Typography Analysis
 * 
 * Lazily imports and manages Tesseract.js worker instances to extract text
 * and line/word-level bounding box coordinates from uploaded images without
 * inflating the initial web bundle.
 */

let cachedWorker = null;
let currentWorkerLang = null;

/**
 * Normalizes a raw OCR bounding box into a standard coordinate object.
 */
export function normalizeBbox(box) {
  if (!box) {
    return { x0: 0, y0: 0, x1: 0, y1: 0, width: 0, height: 0 };
  }
  const x0 = Math.max(0, Math.round(box.x0 ?? box.left ?? 0));
  const y0 = Math.max(0, Math.round(box.y0 ?? box.top ?? 0));
  const x1 = Math.max(x0 + 1, Math.round(box.x1 ?? (box.left + (box.width || 0))));
  const y1 = Math.max(y0 + 1, Math.round(box.y1 ?? (box.top + (box.height || 0))));

  return {
    x0,
    y0,
    x1,
    y1,
    width: Math.max(1, x1 - x0),
    height: Math.max(1, y1 - y0)
  };
}

/**
 * Transforms raw OCR recognition data into structured text regions.
 */
export function transformOcrResultToRegions(ocrResult) {
  if (!ocrResult || !ocrResult.data) {
    return { text: '', confidence: 0, regions: [] };
  }

  const { text = '', confidence = 0, lines = [], words = [], blocks = [] } = ocrResult.data;
  const cleanFullText = (text || '').trim();

  const regions = [];
  let regionCounter = 1;

  // Prefer paragraph/line level regions if available to capture full typographic phrases
  if (Array.isArray(lines) && lines.length > 0) {
    lines.forEach((line) => {
      const lineText = (line.text || '').trim();
      if (!lineText) return;

      const bbox = normalizeBbox(line.bbox);
      if (bbox.width < 10 || bbox.height < 6) return;

      regions.push({
        id: `region-${regionCounter++}`,
        type: 'line',
        text: lineText,
        confidence: Math.round(line.confidence ?? confidence),
        bbox,
        words: Array.isArray(line.words)
          ? line.words.map(w => ({
              text: (w.text || '').trim(),
              confidence: Math.round(w.confidence || 0),
              bbox: normalizeBbox(w.bbox)
            })).filter(w => w.text.length > 0)
          : []
      });
    });
  } else if (Array.isArray(words) && words.length > 0) {
    // Fallback to words if lines are not structured
    words.forEach((word) => {
      const wordText = (word.text || '').trim();
      if (!wordText) return;

      const bbox = normalizeBbox(word.bbox);
      regions.push({
        id: `region-${regionCounter++}`,
        type: 'word',
        text: wordText,
        confidence: Math.round(word.confidence ?? confidence),
        bbox,
        words: []
      });
    });
  }

  // If text was recognized but no sub-regions found, create a whole-block region
  if (regions.length === 0 && cleanFullText.length > 0 && Array.isArray(blocks) && blocks.length > 0) {
    blocks.forEach((block) => {
      const blockText = (block.text || '').trim();
      if (!blockText) return;
      regions.push({
        id: `region-${regionCounter++}`,
        type: 'block',
        text: blockText,
        confidence: Math.round(block.confidence ?? confidence),
        bbox: normalizeBbox(block.bbox),
        words: []
      });
    });
  }

  return {
    text: cleanFullText,
    confidence: Math.round(confidence),
    regions
  };
}

/**
 * Creates or retrieves the singleton Tesseract.js worker with progress reporting.
 */
export async function getOcrWorker(lang = 'eng', onProgress = null) {
  if (cachedWorker && currentWorkerLang === lang) {
    return cachedWorker;
  }

  // Lazy-load tesseract.js dynamically
  const { createWorker } = await import('tesseract.js');

  const worker = await createWorker(lang, 1, {
    logger: (m) => {
      if (onProgress && m && typeof m.progress === 'number') {
        onProgress({
          status: m.status || 'processing',
          progress: Math.min(100, Math.round(m.progress * 100))
        });
      }
    }
  });

  cachedWorker = worker;
  currentWorkerLang = lang;
  return worker;
}

/**
 * Terminate cached worker to free resources
 */
export async function terminateOcrWorker() {
  if (cachedWorker) {
    try {
      await cachedWorker.terminate();
    } catch {
      // Ignored
    }
    cachedWorker = null;
    currentWorkerLang = null;
  }
}

/**
 * Runs OCR analysis on an image source (URL, File, Blob, or Canvas).
 */
export async function performImageOcr(imageSource, options = {}) {
  const { lang = 'eng', onProgress = null } = options;

  if (!imageSource) {
    throw new Error('Image source is required for OCR analysis');
  }

  try {
    const worker = await getOcrWorker(lang, onProgress);
    const result = await worker.recognize(imageSource);
    return transformOcrResultToRegions(result);
  } catch (err) {
    console.error('Tesseract OCR error:', err);
    throw new Error(`Failed to extract text from image: ${err.message || 'Unknown OCR error'}`);
  }
}
