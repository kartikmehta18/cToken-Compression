# Solana Pay Compressed Token (cToken)

A Next.js application that enables the creation, management, and transfer of compressed tokens using Solana's state compression technology and Neon EVM. This project combines the efficiency of Solana's state compression with the flexibility of EVM compatibility.

## 🌟 Features

- **Token Compression**: Create and manage compressed tokens using Solana's state compression technology
- **QR Code Generation**: Generate QR codes for easy token sharing and claiming
- **Wallet Integration**: Seamless integration with MetaMask and Solana wallets
- **Cross-Chain Compatibility**: Support for both Solana and Neon EVM networks
- **Real-time Updates**: Instant updates for token transfers and claims
- **User-friendly Interface**: Modern UI with responsive design
- **Secure Authentication**: Wallet-based authentication system
- **Transaction Tracking**: Monitor token transfers and claims in real-time

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Blockchain**: Solana, Neon EVM
- **Database**: Supabase
- **Authentication**: Wallet-based (MetaMask, Solana)
- **State Management**: React Hooks
- **Development**: TypeScript, ESLint, Prettier

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- MetaMask or Solana wallet
- Supabase account
- Neon EVM Devnet access

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/kartikmehta18/cToken-Compression.git
   cd cToken-Compression
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `supabase/schema.sql` in your Supabase SQL editor
   - Enable Row Level Security (RLS) for all tables

5. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

## 📱 Features in Detail

### Token Creation
- Create compressed tokens with custom names, symbols, and supply
- Automatic merkle tree generation for state compression
- Transaction tracking and verification

### QR Code Generation
- Generate QR codes for token sharing
- Customizable amount and receiver address
- Expiration time support
- One-time use validation

### Token Claims
- Scan QR codes to claim tokens
- Support for both Solana Pay and Ethereum URLs
- Real-time claim status updates
- Transaction verification

### Token Management
- View all your compressed tokens
- Track token transfers and claims
- Detailed token information and statistics

## 🔒 Security Features

- Wallet-based authentication
- Row Level Security (RLS) in Supabase
- Transaction verification
- One-time use QR codes
- Secure token transfer validation

## 🌐 Network Support

- **Solana Devnet**: For compressed token operations
- **Neon EVM Devnet**: For cross-chain compatibility
- Support for both Solana Pay and Ethereum transaction formats

## 📦 Project Structure

```
solana-pay-ctoken/
├── app/                    # Next.js app directory
│   ├── claim/             # Token claiming functionality
│   ├── generate-qr/       # QR code generation
│   ├── mint/              # Token minting
│   ├── my-tokens/         # Token management
│   └── token/             # Token details
├── components/            # React components
│   ├── ui/               # UI components
│   └── ...               # Feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/              # Static assets
├── styles/              # Global styles
├── supabase/            # Supabase configuration
└── types/               # TypeScript type definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Solana Foundation for state compression technology
- Neon EVM for cross-chain compatibility
- Supabase for database and authentication
- shadcn/ui for the component library

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## 🔄 Updates

Stay tuned for updates and new features. Follow the repository to get notified of new releases. 