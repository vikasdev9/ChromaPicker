import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 100x100 Red PNG
const redPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAOElEQVR42u3RAQ0AAAgDoK9/6GvD6wMGsg2yDbINsg2yDbINsg2yDbINsg2yDbINsg2yDbINsg2yDbINqQ0P2Gv/m8kAAAAASUVORK5CYII=';
fs.writeFileSync(path.join(__dirname, 'valid-sample.png'), Buffer.from(redPngBase64, 'base64'));

// Corrupted image (broken header)
fs.writeFileSync(path.join(__dirname, 'corrupt-image.png'), Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x00, 0x00, 0x00, 0x00]));

console.log('Fixtures created successfully.');
