import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Environment Variables Test ===\n');
console.log('Current directory:', __dirname);

// Check if .env file exists
const envPath = resolve(__dirname, '.env');
console.log('\nLooking for .env at:', envPath);
console.log('File exists:', existsSync(envPath) ? 'YES ✅' : 'NO ❌');

if (existsSync(envPath)) {
  console.log('\n📄 .env file contents:');
  const content = readFileSync(envPath, 'utf-8');
  console.log(content.replace(/GEMINI_API_KEY=.*/, 'GEMINI_API_KEY=***HIDDEN***'));
}

// Try loading
dotenv.config({ path: envPath });

console.log('\n🔍 Environment Variables Loaded:');
console.log('PORT:', process.env.PORT || 'NOT FOUND');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'FOUND' : 'NOT FOUND');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'FOUND (starts with: ' + process.env.GEMINI_API_KEY.substring(0, 10) + '...)' : 'NOT FOUND ❌');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT FOUND');

if (!process.env.GEMINI_API_KEY) {
  console.log('\n❌ PROBLEM: GEMINI_API_KEY is not being loaded!');
  console.log('\nPossible solutions:');
  console.log('1. Make sure .env file is in the backend directory');
  console.log('2. Make sure there are no spaces around the = sign');
  console.log('3. Make sure the API key doesn\'t have quotes around it');
  console.log('4. Try creating the file with: notepad .env');
  console.log('5. Add this exact line (without quotes):');
  console.log('   GEMINI_API_KEY=AIzaSyYourActualKeyHere');
}