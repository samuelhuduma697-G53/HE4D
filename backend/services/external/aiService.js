const axios = require('axios');
const logger = require('../../config/logger');

class AIService {
  constructor() {
    this.baseURL = process.env.AI_ENGINE_URL || 'http://localhost:5001';
    this.timeout = 15000;
  }

  async classifyCrisis(text, language = null) {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${this.baseURL}/classify`, {
        text,
        language,
        timestamp: new Date().toISOString()
      }, { timeout: this.timeout });

      const duration = Date.now() - startTime;
      logger.info('AI classification completed', { duration, acuityScore: response.data.acuityScore });

      return {
        acuityScore: response.data.acuityScore,
        severity: response.data.severity,
        categories: response.data.categories,
        keywords: response.data.keywords,
        requiresImmediate: response.data.requiresImmediate,
        recommendedAction: response.data.recommendedAction,
        confidence: response.data.confidence,
        language: response.data.language,
        detectedDialect: response.data.detectedDialect,
        processingTime: duration
      };
    } catch (error) {
      logger.warn('AI classification failed, using fallback:', error.message);
      return this.fallbackClassification(text);
    }
  }

  fallbackClassification(text) {
    const lowerText = text.toLowerCase();

    const emergencyKeywords = [
      'suicide', 'kill myself', 'die', 'emergency', 'danger',
      'hurt', 'bleeding', 'unconscious', 'attack', 'panic', 'help'
    ];

    const highKeywords = [
      'anxious', 'panic', 'scared', 'fear', 'abuse', 'violence',
      'threat', 'eviction', 'nowhere to go', 'homeless'
    ];

    let score = 3;
    let categories = ['other'];

    if (emergencyKeywords.some(k => lowerText.includes(k))) {
      score = 9;
      categories = ['suicide_risk', 'emergency'];
    } else if (highKeywords.some(k => lowerText.includes(k))) {
      score = 7;
      categories = ['mental_health', 'domestic_violence'];
    }

    return {
      acuityScore: score,
      severity: score >= 8 ? 'critical' : score >= 6 ? 'high' : score >= 4 ? 'moderate' : 'low',
      categories,
      keywords: [],
      requiresImmediate: score >= 8,
      recommendedAction: score >= 8 ? 'immediate_response' : 'standard_triage',
      confidence: 0.75,
      language: 'english',
      detectedDialect: 'coastal_swahili',
      processingTime: 0,
      fallback: true
    };
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, { timeout: 5000 });
      return { status: 'healthy', ...response.data };
    } catch (error) {
      return { status: 'healthy (fallback mode)', fallback: true };
    }
  }
}

// Export as singleton instance
const aiService = new AIService();
module.exports = aiService;
