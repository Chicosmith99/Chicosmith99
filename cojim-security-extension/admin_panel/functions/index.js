exports.sendDigest = functions.https.onCall(async (data, context) => {
  const { to, subject, text } = data;

  if (!to || !text) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing fields.');
  }

  // Skip real sending if credentials not yet added
  const EMAIL_USER = ''; // Leave empty for now
  const EMAIL_PASS = ''; // Leave empty for now

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("🟡 Email credentials not set yet. Skipping sendMail.");
    return { success: false, warning: "Email not sent. Credentials not configured." };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"COJIM Security" <${EMAIL_USER}>`,
    to: to.join(','),
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
