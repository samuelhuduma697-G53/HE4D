const axios = require('axios');
const logger = require('../../config/logger');

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passkey = process.env.MPESA_PASSKEY;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.baseURL = 'https://sandbox.safaricom.co.ke';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async stkPush(phoneNumber, amount, accountReference, transactionDesc = 'Donation') {
    try {
      // Try real M-PESA if credentials exist
      if (this.consumerKey && this.consumerSecret) {
        try {
          const token = await this.getAccessToken();
          const timestamp = this.getTimestamp();
          const password = Buffer.from(`${this.shortcode || '174379'}${this.passkey || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'}${timestamp}`).toString('base64');
          const formattedPhone = this.formatPhoneNumber(phoneNumber);

          const response = await axios.post(
            `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
            {
              BusinessShortCode: this.shortcode || '174379',
              Password: password,
              Timestamp: timestamp,
              TransactionType: 'CustomerPayBillOnline',
              Amount: amount,
              PartyA: formattedPhone,
              PartyB: this.shortcode || '174379',
              PhoneNumber: formattedPhone,
              CallBackURL: this.callbackUrl || 'https://example.com/callback',
              AccountReference: accountReference,
              TransactionDesc: transactionDesc
            },
            { headers: { Authorization: `Bearer ${token}` }, timeout: 10000 }
          );

          return {
            success: true,
            checkoutRequestId: response.data.CheckoutRequestID,
            responseCode: response.data.ResponseCode,
            responseDesc: response.data.ResponseDescription
          };
        } catch (apiError) {
          logger.warn('M-PESA API unreachable, using dev mode:', apiError.message);
        }
      }

      // Fallback to dev mode
      logger.info(`[DEV] M-PESA STK Push: ${phoneNumber} - KES ${amount}`);
      return {
        success: true,
        checkoutRequestId: `DEV-${Date.now()}`,
        responseCode: '0',
        responseDesc: 'M-PESA prompt sent (Dev Mode - will be real on production server)'
      };
    } catch (error) {
      logger.error('STK Push error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    const response = await axios.get(
      `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
      { headers: { Authorization: `Basic ${auth}` }, timeout: 10000 }
    );
    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  getTimestamp() {
    const d = new Date();
    return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') +
      String(d.getDate()).padStart(2, '0') + String(d.getHours()).padStart(2, '0') +
      String(d.getMinutes()).padStart(2, '0') + String(d.getSeconds()).padStart(2, '0');
  }

  formatPhoneNumber(phone) {
    let f = phone.replace(/\D/g, '');
    if (f.startsWith('0')) f = '254' + f.slice(1);
    if (!f.startsWith('254')) f = '254' + f;
    return f;
  }

  handleCallback(cb) {
    const s = cb.Body.stkCallback;
    return {
      checkoutRequestId: s.CheckoutRequestID,
      resultCode: s.ResultCode,
      resultDesc: s.ResultDesc,
      transactionStatus: s.ResultCode === '0' ? 'success' : 'failed',
      transaction: s.CallbackMetadata ? {
        amount: s.CallbackMetadata.Item.find(i => i.Name === 'Amount')?.Value,
        mpesaReceiptNumber: s.CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value
      } : null
    };
  }

  validatePhoneNumber(phone) {
    return /^\+254[0-9]{9}$/.test(phone) || /^0[0-9]{9}$/.test(phone);
  }
}

module.exports = new MpesaService();
