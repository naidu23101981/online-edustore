const twilio = require('twilio');
const { sendOtpEmail } = require('./mailer');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendOtpSms(phoneNumber, otp) {
  try {
    await client.messages.create({
      body: `Your Edustore OTP code is: ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    console.log(`SMS OTP sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    throw new Error('Failed to send SMS OTP');
  }
}

// Fallback SMS service using email-to-SMS gateways
async function sendOtpSmsFallback(phoneNumber, otp) {
  const carrierGateways = {
    'verizon': '@vtext.com',
    'att': '@txt.att.net',
    'tmobile': '@tmomail.net',
    'sprint': '@messaging.sprintpcs.com',
    'boost': '@myboostmobile.com',
    'cricket': '@sms.cricketwireless.net',
    'metro': '@mymetropcs.com',
    'uscellular': '@email.uscc.net'
  };

  // Try common carriers
  for (const [carrier, gateway] of Object.entries(carrierGateways)) {
    try {
      const emailAddress = phoneNumber.replace(/\D/g, '') + gateway;
      await sendOtpEmail(emailAddress, otp);
      console.log(`SMS OTP sent via ${carrier} gateway to ${phoneNumber}`);
      return true;
    } catch (error) {
      console.log(`Failed ${carrier} gateway for ${phoneNumber}`);
      continue;
    }
  }
  
  throw new Error('No SMS gateway available');
}

module.exports = { 
  sendOtpSms,
  sendOtpSmsFallback
};
