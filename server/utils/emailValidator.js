const dns = require('dns').promises;

/**
 * Standard Demo / Emergency Operations Command Center accounts.
 * These are exempt from public DNS & disposable domain checks.
 */
const DEMO_EMAILS = [
  'admin@cycloneops.gov',
  'officer@cycloneops.gov',
  'responder@cycloneops.gov',
  'coordinator@cycloneops.gov',
  'volunteer@cycloneops.gov',
  'citizen@cycloneops.gov'
];

/**
 * Known Disposable / Temporary / Burner Email Domains.
 */
const DISPOSABLE_DOMAINS = new Set([
  // Popular burner / temp email providers
  'mailinator.com', 'mailinator.net', 'mailinator.org', 'mailin8r.com',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.biz', 'guerrillamail.org', 'guerrillamailblock.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '10minutemailbox.com', '10minutemail.co.uk',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net', 'tempmail.plus', 'temp-mail.us',
  'yopmail.com', 'yopmail.fr', 'yopmail.net', 'cool.fr.nf', 'courriel.fr.nf',
  'trashmail.com', 'trashmail.net', 'trashmail.me', 'trashmail.org',
  'sharklasers.com', 'grr.la', 'pokemail.net', 'spam4.me',
  'dispostable.com', 'throwawaymail.com', 'getairmail.com', 'inboxkitten.com',
  'dropmail.me', 'fakemailgenerator.com', 'generator.email', 'crazymailing.com',
  'maildrop.cc', 'mohmal.com', 'nada.ltd', 'getnada.com', 'abcvg.com',
  'burnermail.io', 'emailondeck.com', 'privatemail.com', 'disposablemail.com',
  'fastmail.fm', 'harakirimail.com', 'jetable.org', 'mailcatch.com',
  'mailnesia.com', 'meltmail.com', 'mytempemail.com', 'spambox.us',
  'temporarymail.com', 'trashymail.com', 'zippymail.info', 'mytemp.email',
  'tempail.com', 'emailfake.com', 'inboxbear.com', 'crazymail.com',
  'fakeinbox.com', 'guerrillamail.info', 'deadaddress.com', 'discard.email',
  'dumpmail.de', 'emailsensei.com', 'filzmail.com', 'gettempmail.com',
  'incognitomail.org', 'kasmail.com', 'mail-temporaire.fr', 'mailcatch.com',
  'mailforspam.com', 'mailmoat.com', 'mailnull.com', 'mailscrap.com',
  'mailslurp.com', 'maildisposable.com', 'mintemail.com', 'mytrashmail.com',
  'no-spam.ws', 'noclickemail.com', 'nomail.xl.cx', 'nospam.ze.tc',
  'onewaymail.com', 'pookmail.com', 'quickinbox.com', 'safersignup.de',
  'spamavert.com', 'spambob.com', 'spambob.net', 'spambob.org',
  'spamevader.com', 'spamfree24.org', 'spamgourmet.com', 'spamhole.com',
  'spaml.com', 'spamspot.com', 'superstachel.de', 'suremail.info',
  'tempemail.co', 'tempemail.net', 'tempinbox.com', 'temporaryforwarding.com',
  'temporaryinbox.com', 'throwawayemailaddress.com', 'tmail.ws', 'trash-mail.at',
  'trash-mail.com', 'trash-me.com', 'trashbox.eu', 'tvn.hu',
  'wegwerfadresse.de', 'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org',
  'whyspam.me', 'willhackforfood.biz', 'wuzup.net', 'yep.it', 'zoemail.org'
]);

/**
 * Placeholder and dummy test email addresses.
 */
const BANNED_PATTERNS = [
  /^test@/i,
  /^asdf@/i,
  /^fake@/i,
  /^dummy@/i,
  /^admin@admin/i,
  /^root@root/i,
  /^nobody@/i,
  /^123@/i,
  /^123456@/i,
  /^abc@/i,
  /^xyz@/i,
  /^demo@demo/i,
  /^temp@/i,
  /^user@example/i
];

/**
 * Validates an email address against disposable providers, syntax, and live DNS MX records.
 * @param {string} email - Email address to validate
 * @returns {Promise<{ isValid: boolean, message?: string, isDemo?: boolean }>}
 */
async function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Please provide a valid email address.' };
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Exemption: 6 Official Demo Credentials & cycloneops.gov domains
  if (DEMO_EMAILS.includes(cleanEmail) || cleanEmail.endsWith('@cycloneops.gov')) {
    return { isValid: true, isDemo: true };
  }

  // 2. Syntax and format validation
  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: 'Invalid email address structure.' };
  }

  const [localPart, domain] = parts;

  // Local part and domain length checks
  if (localPart.length < 2 || localPart.length > 64) {
    return { isValid: false, message: 'Email username must be between 2 and 64 characters.' };
  }
  if (domain.length < 4 || domain.length > 255) {
    return { isValid: false, message: 'Email domain must be a valid registered domain.' };
  }

  // RFC standard syntax regex check
  const rfcRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!rfcRegex.test(cleanEmail)) {
    return { isValid: false, message: 'Email address contains invalid characters or structure.' };
  }

  // Check top-level domain (TLD)
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]+$/i.test(tld)) {
    return { isValid: false, message: 'Email has an invalid top-level domain.' };
  }

  // 3. Reject known placeholder / dummy test addresses
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(cleanEmail)) {
      return { 
        isValid: false, 
        message: 'Placeholder or mock email addresses are not permitted on this disaster management platform.' 
      };
    }
  }

  // 4. Check against disposable / temporary domain blocklist
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      message: `The domain '${domain}' is identified as a temporary/disposable email service. Please use a verified personal or organizational email address.`
    };
  }

  // Suspicious disposable pattern heuristics in domain name
  const suspiciousKeywords = ['tempmail', 'trashmail', 'disposable', 'throwaway', 'fakemail', '10minute', 'guerrillamail', 'burnermail', 'dropmail'];
  for (const keyword of suspiciousKeywords) {
    if (domain.includes(keyword)) {
      return {
        isValid: false,
        message: 'Temporary or disposable email domains are blocked to preserve emergency system integrity.'
      };
    }
  }

  // 5. Real-Time DNS MX (Mail Exchange) Record Resolution
  try {
    // Timeout promise after 2.5 seconds to prevent hanging on slow nameservers
    const mxLookup = dns.resolveMx(domain);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('DNS_TIMEOUT')), 2500));

    const records = await Promise.race([mxLookup, timeout]);
    if (!records || records.length === 0) {
      return {
        isValid: false,
        message: `The domain '${domain}' does not have active mail servers (MX records) configured and cannot receive emergency communications.`
      };
    }
  } catch (err) {
    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA' || err.code === 'EREFUSED') {
      return {
        isValid: false,
        message: `The email domain '${domain}' does not exist or has no active mail exchange servers on the internet.`
      };
    }
    // If DNS timeout or network transient error occurs, proceed safely without failing legitimate users
    if (err.message === 'DNS_TIMEOUT') {
      // Allow through if domain isn't on blocklist
    }
  }

  return { isValid: true, isDemo: false };
}

module.exports = {
  validateEmail,
  DEMO_EMAILS,
  DISPOSABLE_DOMAINS
};
