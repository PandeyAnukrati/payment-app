#!/bin/bash

# Payment Dashboard Setup Script
echo "🚀 Setting up Payment Dashboard Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if MongoDB is running
check_mongodb() {
    if command -v mongod &> /dev/null; then
        print_success "MongoDB is installed"
    else
        print_warning "MongoDB is not installed locally. You can:"
        echo "  1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/"
        echo "  2. Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas"
        echo "  3. Use Docker: docker run -d -p 27017:27017 mongo:7.0"
    fi
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd server || exit 1
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cat > .env << EOL
MONGODB_URI=mongodb://localhost:27017/payment-dashboard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
PORT=3000
EOL
        print_success ".env file created"
    else
        print_warning ".env file already exists"
    fi
    
    cd ..
    print_success "Backend setup completed"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd client || exit 1
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Check if Expo CLI is installed
    if ! command -v expo &> /dev/null; then
        print_warning "Expo CLI is not installed globally"
        print_status "Installing Expo CLI..."
        npm install -g @expo/cli
    fi
    
    cd ..
    print_success "Frontend setup completed"
}

# Create placeholder assets
create_assets() {
    print_status "Creating placeholder assets..."
    
    mkdir -p client/assets
    
    # Create placeholder files (you should replace these with actual assets)
    touch client/assets/icon.png
    touch client/assets/splash.png
    touch client/assets/adaptive-icon.png
    touch client/assets/favicon.png
    
    print_success "Placeholder assets created"
}

# Main setup function
main() {
    echo "=================================================="
    echo "🏦 Payment Dashboard Setup"
    echo "=================================================="
    
    check_node
    check_mongodb
    
    setup_backend
    setup_frontend
    create_assets
    
    echo ""
    echo "=================================================="
    print_success "Setup completed successfully! 🎉"
    echo "=================================================="
    echo ""
    echo "📋 Next steps:"
    echo "1. Start MongoDB (if using local installation)"
    echo "2. Start the backend server:"
    echo "   cd server && npm run start:dev"
    echo ""
    echo "3. In a new terminal, start the frontend:"
    echo "   cd client && npm start"
    echo ""
    echo "4. Use these credentials to login:"
    echo "   Admin: admin / admin123"
    echo "   Viewer: viewer / viewer123"
    echo ""
    echo "📚 Documentation:"
    echo "   - Main README: ./README.md"
    echo "   - Backend README: ./server/README.md"
    echo "   - Frontend README: ./client/README.md"
    echo ""
    echo "🐳 Docker alternative:"
    echo "   docker-compose up -d"
    echo ""
    print_success "Happy coding! 🚀"
}

# Run main function
main