#!/bin/bash

echo "🚀 Deploying ThriftTech Email Backend to Fly.io..."
echo "================================================"

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed. Installing..."
    curl -L https://fly.io/install.sh | sh
    export PATH="$HOME/.fly/bin:$PATH"
fi

# Login to Fly.io (if not already logged in)
echo "🔑 Checking Fly.io authentication..."
flyctl auth whoami || flyctl auth login

# Create the app if it doesn't exist
echo "📝 Creating Fly.io app..."
flyctl apps create thrifttech-email-backend --generate-name || echo "App already exists"

# Set environment variables
echo "🔧 Setting environment variables..."
flyctl secrets set GMAIL_USER="victorythrifttech@gmail.com" --app thrifttech-email-backend
flyctl secrets set GMAIL_APP_PASSWORD="zpi bhbg neah xlax" --app thrifttech-email-backend
flyctl secrets set NODE_ENV="production" --app thrifttech-email-backend

# Deploy the application
echo "🚀 Deploying application..."
flyctl deploy --app thrifttech-email-backend

# Get the deployed URL
echo "✅ Deployment complete!"
echo "📧 Backend URL: https://thrifttech-email-backend.fly.dev"
echo "🌐 Health Check: https://thrifttech-email-backend.fly.dev/health"

echo ""
echo "🎯 Next Steps:"
echo "1. Update frontend .env with: VITE_BACKEND_URL=https://thrifttech-email-backend.fly.dev"
echo "2. Change VITE_EMAIL_SERVICE=backend-api"
echo "3. Restart frontend dev server"
echo ""
echo "✨ Real Gmail verification emails are now ready!"
