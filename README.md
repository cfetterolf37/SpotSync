# SpotSync

A modern React Native app with Supabase authentication, social logins, and location-based weather information.

## 🏗️ **Project Structure & Best Practices**

This project follows modern React Native and Expo best practices with a well-organized structure:

### **Directory Structure**
```
SpotSync/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/             # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Loading.tsx
│   ├── ErrorBoundary.tsx
│   └── index.ts
├── contexts/              # React Context providers
│   ├── AuthContext.tsx
│   └── WeatherContext.tsx
├── hooks/                 # Custom React hooks
│   ├── useForm.ts
│   ├── useAsyncStorage.ts
│   ├── usePerformance.ts
│   └── index.ts
├── lib/                   # Business logic & services
│   ├── supabase.ts
│   ├── weather.ts
│   └── location.ts
├── types/                 # TypeScript type definitions
│   └── index.ts
├── utils/                 # Utility functions
│   └── index.ts
├── constants/             # App constants & configuration
│   └── index.ts
├── __tests__/            # Test files
│   ├── components/
│   └── utils/
└── assets/               # Images, fonts, etc.
```

### **Best Practices Implemented**

#### **1. Type Safety**
- ✅ Full TypeScript implementation
- ✅ Centralized type definitions in `types/`
- ✅ Proper interface definitions for all components
- ✅ Type-safe API responses and form handling

#### **2. Component Architecture**
- ✅ Reusable components in `components/`
- ✅ Consistent styling with design system
- ✅ Proper prop interfaces and default values
- ✅ Error boundaries for better error handling

#### **3. State Management**
- ✅ React Context for global state
- ✅ Custom hooks for local state
- ✅ AsyncStorage integration for persistence
- ✅ Performance monitoring hooks

#### **4. Code Organization**
- ✅ Separation of concerns (UI, logic, types)
- ✅ Utility functions for common operations
- ✅ Constants for configuration and styling
- ✅ Service layer for API calls

#### **5. Testing**
- ✅ Jest configuration for unit testing
- ✅ React Native Testing Library
- ✅ Sample tests for utilities
- ✅ Coverage reporting

#### **6. Form Handling**
- ✅ Custom form validation
- ✅ React Hook Form integration
- ✅ Yup schema validation
- ✅ Error state management

#### **7. Performance**
- ✅ Performance monitoring hooks
- ✅ API call timing
- ✅ Component render tracking
- ✅ Development-only logging

#### **8. Error Handling**
- ✅ Error boundaries at app level
- ✅ Graceful error recovery
- ✅ User-friendly error messages
- ✅ Network error detection

#### **9. Security**
- ✅ Environment variables for sensitive data
- ✅ Proper API key management
- ✅ Input validation and sanitization
- ✅ Secure storage practices

#### **10. Development Experience**
- ✅ ESLint configuration
- ✅ TypeScript strict mode
- ✅ Consistent code formatting
- ✅ Comprehensive documentation

## 🚀 **Features**

- **Venue Discovery**: Location-based venue search using Geoapify Places API
- **Weather Integration**: Global weather display to help with venue decisions
- **Modern UI**: Glassmorphism design with smooth animations and responsive layout
- **Category Filtering**: Filter venues by restaurants, bars, cafes, entertainment, etc.
- **Radius Search**: Adjustable search radius (0.5mi to 10mi)
- **Real-time Updates**: Pull-to-refresh and background data updates
- **Authentication**: Email/password and social login (Google, Apple, GitHub)
- **Type Safety**: Full TypeScript implementation
- **Testing**: Jest setup with sample tests
- **Performance**: Monitoring and optimization
- **Error Handling**: Comprehensive error boundaries and recovery

## 📱 **Screenshots**

[Add screenshots here]

## 🛠️ **Tech Stack**

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Backend**: Supabase (Auth, Database)
- **State Management**: React Context + Custom Hooks
- **Styling**: StyleSheet + LinearGradient
- **Testing**: Jest + React Native Testing Library
- **Forms**: React Hook Form + Yup
- **Type Safety**: TypeScript
- **Performance**: Custom monitoring hooks

## 📋 **Project Documentation**

### **Planning & Design**
- [App Plan & Architecture](./docs/React%20Native%20Venue%20Discovery%20App%20Development%20Prompt.pdf) - Comprehensive planning document for SpotSync
- [Feature Roadmap](./docs/roadmap.md) - Planned features and development timeline
- [Design System](./docs/design-system.md) - UI/UX guidelines and component specifications

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js (v18 or higher)
- Expo CLI
- Supabase account
- OpenWeatherMap API key

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SpotSync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Fill in your API keys in `.env`

4. **Start the development server**
   ```bash
   npm start
   ```

### **Running Tests**
```bash
npm test              # Run tests once
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

## 🔧 **Configuration**

### **Environment Variables**
Create a `.env` file with the following variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Social Login Providers
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id
EXPO_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# App Configuration
EXPO_PUBLIC_APP_NAME=SpotSync
EXPO_PUBLIC_APP_SCHEME=spotsync

# Weather API
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key

# Venue Discovery API
EXPO_PUBLIC_GEOAPIFY_API_KEY=your_geoapify_api_key
```

## 📚 **API Documentation**

### **Authentication**
- Email/password sign up and sign in
- Social login with Google, Apple, and GitHub
- Password reset functionality
- Session management

### **Weather API**
- Current weather by location
- Temperature in Fahrenheit and Celsius
- Humidity and wind speed
- Weather condition icons

### **Venue Discovery API**
- Location-based venue search using Geoapify Places API
- Category filtering (restaurants, bars, cafes, entertainment, etc.)
- Radius-based search (0.5mi to 10mi)
- Venue details including ratings, price ranges, and contact info
- Distance calculation from user location

## 🧪 **Testing**

The project includes comprehensive testing setup:

### **Unit Tests**
- Utility functions
- Form validation
- API helpers

### **Component Tests**
- Button component
- Input component
- Loading states

### **Integration Tests**
- Authentication flow
- Weather data fetching
- Navigation

## 🔍 **Performance Monitoring**

The app includes performance monitoring hooks:

- Component render timing
- API call duration
- Memory usage tracking
- Development-only logging

## 🛡️ **Security**

- Environment variables for sensitive data
- Input validation and sanitization
- Secure storage practices
- Error boundary protection

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 **License**

This project is licensed under the MIT License.

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **TypeScript errors**
   ```bash
   npx tsc --noEmit
   ```

3. **Test failures**
   ```bash
   npm run test -- --verbose
   ```

### **Getting Help**

- Check the [Expo documentation](https://docs.expo.dev/)
- Review the [Supabase documentation](https://supabase.com/docs)
- Open an issue in this repository

---

**Built with ❤️ using React Native, Expo, and Supabase**
