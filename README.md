# Aarogyam: Rural Healthcare Assistant

**Aarogyam** is an AI-powered healthcare assistant designed specifically for early-stage disease screening and guidance in rural, low-resource environments. It prioritizes accessibility, safety, and explainability to bridge the gap between rural populations and medical guidance.

## 🎯 Objective
To provide simple, safe, and explainable health insights based on:
- **User Symptoms:** Input via text or voice.
- **Visual Scans:** Optional skin image input for common dermatological conditions.

*Note: Aarogyam is NOT a doctor and does not provide final diagnoses. It provides risk-based guidance and urgency alerts.*

## 🌍 Target Users
- Rural populations in India.
- **Multilingual Support:** English, Hindi, Marathi.
- **Accessibility:** Built for users with low medical literacy, supporting speech-to-text and mixed-language input (Hinglish/Marathi-English).

## 🧩 Core Capabilities
1. **Symptom Understanding (NLP):** Interprets complex symptom descriptions using state-of-the-art LLMs.
2. **Disease Screening:** Predicts 2–3 possible conditions with confidence scores.
3. **Image-Based Analysis:** Analyzes skin images to detect conditions like Acne, Eczema, or Psoriasis.
4. **Risk-Based Triage:**
   - 🟢 **Low Risk:** Home care, rest, and hydration.
   - 🟡 **Medium Risk:** Suggests visiting a doctor soon.
   - 🔴 **High Risk:** Urgent care alerts for critical symptoms (chest pain, breathing difficulty).

## 🛠️ Technical Stack
- **Frontend:** React 19 + Vite
- **AI Engine:** Google Gemini (via `@google/genai` SDK)
- **Styling:** Tailwind CSS (Custom Aarogyam Teal & Mint Palette)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Language Support:** Custom translation engine for Indian languages.

## 🚀 Local Development
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file with your Google Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📜 Disclaimer
Aarogyam is designed for guidance and screening purposes only. It is not a replacement for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified health provider with any questions you may have regarding a medical condition.
