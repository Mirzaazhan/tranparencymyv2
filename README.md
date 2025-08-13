# TransparensiMY 🇲🇾

A blockchain-based government spending transparency web application for Malaysia, built with React, Node.js, and smart contracts on the Polygon network.

## Features

### Frontend (React + TypeScript)
- 📊 **Real-time Dashboard** - Interactive spending visualization with charts
- 🔍 **Advanced Search & Filtering** - Find projects by department, location, type, and amount
- 🌐 **Multi-language Support** - English and Bahasa Malaysia
- 📱 **Mobile Responsive** - Malaysian color scheme (Red, Blue, Yellow)
- 📋 **Project Details** - Individual pages showing budget vs actual spending
- 💬 **Citizen Feedback System** - Rate and comment on projects
- 🛠️ **Admin Interface** - Government officials can add spending records

### Backend & Blockchain
- ⛓️ **Smart Contracts** - Immutable transaction records on Polygon
- 🏛️ **Government Departments** - Pre-configured Malaysian ministries
- 📈 **API Endpoints** - RESTful API for data access and manipulation
- 🔒 **Secure & Transparent** - Blockchain-based verification
- 📊 **Real-time Analytics** - Spending statistics and trends

### Key Government Departments
- Ministry of Health (Kementerian Kesihatan)
- Ministry of Education (Kementerian Pendidikan)
- Ministry of Transport (Kementerian Pengangkutan)
- Ministry of Finance (Kementerian Kewangan)
- Ministry of Defence (Kementerian Pertahanan)
- Ministry of Home Affairs (Kementerian Dalam Negeri)
- Ministry of Science, Technology and Innovation (Kementerian Sains, Teknologi dan Inovasi)
- Ministry of Tourism, Arts and Culture (Kementerian Pelancongan, Seni dan Budaya)

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Recharts, React Router
- **Backend**: Node.js, Express, TypeScript
- **Blockchain**: Solidity, Hardhat, Ethers.js, Polygon Network
- **Styling**: Tailwind CSS with Malaysian flag colors
- **Internationalization**: react-i18next for English/Bahasa Malaysia support

## Project Structure

```
tranparencymy/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions and API
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── routes/          # API route handlers
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   └── utils/           # Utility functions
│   ├── contracts/           # Solidity smart contracts
│   ├── scripts/             # Deployment scripts
│   ├── test/               # Contract tests
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git
- MetaMask browser extension
- Polygon wallet with MATIC tokens (for mainnet deployment only)
- 4 terminal windows for full local development

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd tranparencymy
npm run install:all
```

### 2. Environment Setup

Create `.env` files in the backend directory:

```bash
# backend/.env
PORT=3001
NODE_ENV=development

# Blockchain Configuration  
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
# For local development, private key is optional (uses hardhat accounts)
PRIVATE_KEY=your_private_key_here

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Optional: For contract verification on Polygonscan
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

### 3. Start Local Blockchain (Recommended for Development)

```bash
# Terminal 1 - Start Hardhat local blockchain
cd backend
npx hardhat node
```

This will start a local blockchain on `http://127.0.0.1:8545` with 20 pre-funded accounts.

### 4. Deploy Smart Contracts

```bash
# Terminal 2 - Deploy contracts to local network
cd backend
npm run compile
npx hardhat run scripts/deploy.js --network localhost
```

For testnet/mainnet deployment:
```bash
npm run deploy:mumbai  # For Mumbai testnet
# or
npm run deploy:polygon # For Polygon mainnet
```

### 5. Start Development Servers

```bash
# From root directory
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### 6. Access the Application

Open http://localhost:3000 in your browser to see the TransparensiMY dashboard.

### 7. Setup MetaMask for Local Development

1. **Add Localhost Network to MetaMask:**
   - Network Name: `Localhost 8545`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

2. **Import Test Account:**
   - Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This account has admin permissions and 10,000 ETH for testing

3. **Test Blockchain Functionality:**
   ```bash
   cd backend
   node scripts/test-blockchain.js
   ```

### 8. Demo Credentials

**Admin/Government Access:**
- Email: `admin@malaysia.gov.my`
- Password: `admin123`
- Permissions: Submit spending records, view admin dashboard

**Citizen Access:**
- Email: `citizen@example.com`
- Password: `citizen123`
- Permissions: View projects, submit feedback, rate transparency

## API Endpoints

### Transactions
- `GET /api/transactions` - List all transactions with pagination
- `GET /api/transactions/:id` - Get specific transaction
- `GET /api/transactions/search/:query` - Search transactions
- `GET /api/transactions/stats/summary` - Get spending statistics
- `GET /api/transactions/stats/by-department` - Department spending breakdown

### Departments
- `GET /api/departments` - List all departments
- `GET /api/departments/:id/spending` - Department spending details
- `GET /api/departments/:id/transactions` - Transactions by department

### Feedback
- `POST /api/feedback` - Submit citizen feedback
- `GET /api/feedback/transaction/:id` - Get feedback for transaction
- `GET /api/feedback/rating/:id` - Get rating summary

### Admin
- `POST /api/admin/transaction` - Create new transaction (authorized only)
- `GET /api/admin/dashboard` - Admin dashboard statistics

## Smart Contracts

### GovernmentSpending.sol
Main contract for recording government transactions with features:
- Transaction recording and updating
- Department management
- Spending analytics
- Access control for authorized officials

### CitizenFeedback.sol
Contract for citizen feedback system with features:
- Feedback submission with ratings (1-5)
- Comment moderation
- Rating aggregation
- User management (ban/unban)

## Development

### Local Development Setup (Complete)

1. **Terminal 1 - Blockchain Node:**
   ```bash
   cd backend
   npx hardhat node
   ```

2. **Terminal 2 - Deploy Contracts:**
   ```bash
   cd backend
   npx hardhat run scripts/deploy.js --network localhost
   ```

3. **Terminal 3 - Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```

4. **Terminal 4 - Frontend Server:**
   ```bash
   cd frontend
   npm start
   ```

### Smart Contract Development
```bash
cd backend
npm run compile      # Compile contracts
npm run test         # Run tests
node scripts/test-blockchain.js  # Test blockchain functionality
npx hardhat run scripts/deploy.js --network localhost  # Deploy to local
```

### Code Style
- TypeScript strict mode enabled
- Tailwind CSS for styling
- ESLint and Prettier configured
- Malaysian color scheme and design principles

## Deployment

### Frontend Deployment
Build the React app:
```bash
cd frontend
npm run build
```

### Backend Deployment
Build the Node.js app:
```bash
cd backend
npm run build
npm start
```

### Smart Contract Deployment
Deploy to Polygon mainnet or Mumbai testnet:
```bash
cd backend
npx hardhat run scripts/deploy.js --network polygon
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## Security

- Smart contracts audited for common vulnerabilities
- Input validation on all API endpoints
- Rate limiting and CORS protection
- Environment variables for sensitive data
- Multi-signature wallet support for contract administration

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Malaysian government for transparency initiatives
- Polygon network for scalable blockchain infrastructure
- React and Node.js communities for excellent tooling
- Open source contributors and maintainers

---

**TransparensiMY** - Building trust through transparency in government spending. 🏛️✨