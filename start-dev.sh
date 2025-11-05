#!/bin/bash

# AI Guidance Development Startup Script
# This script starts both frontend and backend services

echo "================================================"
echo "  构属植物基因组数据库 - AI 引导功能开发启动脚本"
echo "================================================"
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo "✅ Backend dependencies installed"
    echo ""
fi

# Start backend server
echo "🚀 Starting backend server on port 3001..."
cd backend
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "✅ Backend server started (PID: $BACKEND_PID)"
echo "   Log file: backend.log"
echo ""

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Check if backend is running
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend is ready!"
else
    echo "⚠️  Backend health check failed, but continuing..."
fi
echo ""

# Start frontend
echo "🚀 Starting frontend server on port 3000..."
echo "   Frontend will open automatically in your browser"
echo ""
echo "================================================"
echo "  Services:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:3001"
echo "  - Health:   http://localhost:3001/api/health"
echo "================================================"
echo ""
echo "⚠️  Press Ctrl+C to stop all services"
echo ""

# Start frontend (this will run in foreground)
npm start

# Cleanup on exit
echo ""
echo "🛑 Stopping backend server..."
kill $BACKEND_PID 2>/dev/null
echo "✅ All services stopped"
