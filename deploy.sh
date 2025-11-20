#!/bin/bash

# Build the project
echo "Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful!"
    
    # Deploy to Vercel
    echo "Deploying to Vercel..."
    vercel --prod --yes
    
    if [ $? -eq 0 ]; then
        echo "Deployment successful!"
    else
        echo "Deployment failed!"
        exit 1
    fi
else
    echo "Build failed!"
    exit 1
fi