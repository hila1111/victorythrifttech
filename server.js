const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:8080",
      "http://localhost:3000",
      "https://a7700d48878d4930b07171996d76b9c5-b7927c4dd57a49c49f402030f.fly.dev",
      /\.fly\.dev$/,
    ],
    credentials: true,
  }),
);
app.use(express.json());

// Gmail SMTP Configuration
const createTransporter = () => {
  const gmailUser = process.env.GMAIL_USER || "victorythrifttech@gmail.com";
  const gmailPassword = process.env.GMAIL_APP_PASSWORD || "zpi bhbg neah xlax";

  console.log(
    `📧 Gmail SMTP Config: ${gmailUser} (${gmailPassword ? "password set" : "no password"})`,
  );

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });
};

// Email template function
const createVerificationEmail = (email, code, userName = "") => {
  return {
    from: "ThriftTech <victorythrifttech@gmail.com>",
    to: email,
    subject: "ThriftTech - Verify Your Email Address",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - ThriftTech</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; text-align: center; padding: 30px 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .code { background: #dc2626; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 25px; border-radius: 8px; letter-spacing: 10px; margin: 25px 0; font-family: monospace; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
          .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🛒 ThriftTech</h1>
            <h2 style="margin: 10px 0 0; font-weight: normal;">Email Verification</h2>
          </div>
          <div class="content">
            <h3>Hello${userName ? ` ${userName}` : ""}! 👋</h3>
            <p style="font-size: 16px;">Welcome to <strong>ThriftTech</strong>! To complete your account setup and start shopping, please verify your email address using the code below:</p>
            
            <div class="code">${code}</div>
            
            <div class="info-box">
              <p style="margin: 0; font-weight: bold;">⚠️ Important details:</p>
              <ul style="margin: 10px 0;">
                <li>This code will expire in <strong>10 minutes</strong></li>
                <li>You have <strong>3 attempts</strong> to enter the correct code</li>
                <li>This code is only valid for: <strong>${email}</strong></li>
                <li>Keep this code secure and don't share it with anyone</li>
              </ul>
            </div>
            
            <p style="font-size: 16px;">If you didn't create an account with ThriftTech, please ignore this email. Your email address will not be used for anything else.</p>
            
            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #0c4a6e;"><strong>🎯 What's Next?</strong></p>
              <p style="margin: 5px 0 0; color: #0c4a6e;">After verification, you'll have access to our amazing collection of thrift fashion and tech gadgets!</p>
            </div>
            
            <p style="font-size: 14px; color: #666;">Need help? Contact our support team at <a href="mailto:victorythrifttech@gmail.com" style="color: #dc2626;">victorythrifttech@gmail.com</a></p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 16px; color: #dc2626; font-weight: bold;">Happy shopping! 🛍️</p>
              <p style="font-weight: bold; color: #374151;">The ThriftTech Team</p>
            </div>
          </div>
          <div class="footer">
            <p>© 2024 ThriftTech. All rights reserved.</p>
            <p>This is an automated email. Please do not reply to this message.</p>
            <p style="font-size: 12px; color: #9ca3af;">Powered by ThriftTech Email Service</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
ThriftTech - Email Verification

Hello${userName ? ` ${userName}` : ""}!

Welcome to ThriftTech! To complete your account setup, please verify your email address using this code:

VERIFICATION CODE: ${code}

Important details:
- This code will expire in 10 minutes
- You have 3 attempts to enter the correct code
- This code is only valid for: ${email}
- Keep this code secure and don't share it with anyone

If you didn't create an account with ThriftTech, please ignore this email.

Need help? Contact our support team at victorythrifttech@gmail.com

Happy shopping!
The ThriftTech Team

© 2024 ThriftTech. All rights reserved.
    `,
  };
};

// API Routes

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "🚀 ThriftTech Email Backend is running!",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      sendEmail: "POST /send-verification",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "ThriftTech Email Backend is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Send verification email
app.post("/send-verification", async (req, res) => {
  try {
    const { email, code, userName } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: "Email and verification code are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format",
      });
    }

    console.log(`📧 Sending verification email to: ${email}`);
    console.log(`🔐 Verification code: ${code}`);
    console.log(`👤 User name: ${userName || "Not provided"}`);

    // Create transporter
    const transporter = createTransporter();

    // Verify connection
    console.log("🔗 Verifying Gmail SMTP connection...");
    await transporter.verify();
    console.log("✅ Gmail SMTP connection verified successfully");

    // Create email content
    const emailContent = createVerificationEmail(email, code, userName);

    // Send email
    console.log("📤 Sending email...");
    const info = await transporter.sendMail(emailContent);

    console.log(`✅ Email sent successfully!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📬 Response: ${info.response}`);

    res.json({
      success: true,
      messageId: info.messageId,
      message: "Verification email sent successfully",
      recipient: email,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Email sending error:", error);

    let errorMessage = "Failed to send verification email";
    let errorCode = 500;

    if (error.code === "EAUTH") {
      errorMessage = "Gmail authentication failed. Check email credentials.";
      errorCode = 401;
    } else if (error.code === "ENOTFOUND") {
      errorMessage = "Network error. Check internet connection.";
      errorCode = 503;
    } else if (error.message) {
      errorMessage = error.message;
    }

    res.status(errorCode).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
});

// Test email endpoint
app.post("/test-email", async (req, res) => {
  try {
    const testEmail = req.body.email || "test@example.com";
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();

    console.log(`🧪 Sending test email to: ${testEmail}`);

    const transporter = createTransporter();
    await transporter.verify();

    const emailContent = createVerificationEmail(
      testEmail,
      testCode,
      "Test User",
    );
    const info = await transporter.sendMail(emailContent);

    res.json({
      success: true,
      messageId: info.messageId,
      message: `Test email sent to ${testEmail}`,
      code: testCode,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test email error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      "/health",
      "POST /send-verification",
      "POST /test-email",
    ],
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 ThriftTech Email Backend Server Started!

📧 Gmail SMTP: ${process.env.GMAIL_USER || "victorythrifttech@gmail.com"}
🌐 Server: http://0.0.0.0:${PORT}
✅ Health Check: http://0.0.0.0:${PORT}/health
📮 Send Email: POST http://0.0.0.0:${PORT}/send-verification
🧪 Test Email: POST http://0.0.0.0:${PORT}/test-email

🎯 Ready to send REAL verification emails to users! 
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

module.exports = app;
