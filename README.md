# SpotSync - Supabase Authentication

A React Native app with Supabase authentication including social logins (Google, Apple, GitHub) and location-based weather information.

## Features

- ✅ Email/Password authentication
- ✅ Social login (Google, Apple, GitHub)
- ✅ Password reset functionality
- ✅ User profile management
- ✅ Location-based weather information
- ✅ Secure environment variable handling
- ✅ TypeScript support
- ✅ Modern UI with Expo Router

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Social Login Providers (Optional)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_APPLE_CLIENT_ID=your_apple_client_id
EXPO_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# Weather API
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweathermap_api_key

# App Configuration
EXPO_PUBLIC_APP_NAME=SpotSync
EXPO_PUBLIC_APP_SCHEME=spotsync
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Enable the authentication providers you want to use in Authentication > Providers

### 3. Weather API Setup

1. Sign up for a free account at [OpenWeatherMap](https://openweathermap.org/)
2. Get your API key from your account dashboard
3. Add the API key to your `.env` file as `EXPO_PUBLIC_OPENWEATHER_API_KEY`

### 4. Social Login Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your app's redirect URI: `https://your-project.supabase.co/auth/v1/callback`
6. Copy the Client ID to your `.env` file

#### Apple OAuth
1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Create a new App ID
3. Enable Sign In with Apple
4. Create a Services ID
5. Configure the redirect URI in Supabase
6. Copy the Client ID to your `.env` file

#### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set the Authorization callback URL to: `https://your-project.supabase.co/auth/v1/callback`
4. Copy the Client ID to your `.env` file

### 5. Database Schema

Create the following table in your Supabase database:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## Project Structure

```
SpotSync/
├── app/
│   ├── (tabs)/           # Authenticated user screens
│   │   ├── index.tsx     # Home screen with weather
│   │   ├── profile.tsx   # Profile screen
│   │   └── _layout.tsx   # Tab navigation
│   ├── (auth)/           # Authentication screens
│   │   ├── sign-in.tsx   # Sign in screen
│   │   ├── sign-up.tsx   # Sign up screen
│   │   └── forgot-password.tsx # Password reset
│   ├── _layout.tsx       # Root layout with auth provider
│   └── loading.tsx       # Loading screen
├── contexts/
│   ├── AuthContext.tsx   # Authentication context
│   └── WeatherContext.tsx # Weather context
├── lib/
│   ├── supabase.ts       # Supabase client configuration
│   ├── weather.ts        # Weather service
│   └── location.ts       # Location service
├── env.example           # Environment variables template
└── README.md            # This file
```

## Weather Features

### Location Services
- Automatic location detection
- Permission handling for location access
- Reverse geocoding for city names
- Error handling for location services

### Weather Information
- Current temperature
- Weather description
- Humidity percentage
- Wind speed
- Weather icons mapped to Ionicons
- Refresh functionality

### User Experience
- Loading states for weather data
- Error handling for API failures
- Graceful fallbacks when location is unavailable
- Real-time weather updates

## Security Best Practices

1. **Environment Variables**: All sensitive data is stored in environment variables
2. **Row Level Security**: Database tables have RLS enabled
3. **Input Validation**: All user inputs are validated
4. **Error Handling**: Comprehensive error handling throughout the app
5. **Type Safety**: Full TypeScript support for better development experience
6. **Location Permissions**: Proper permission handling for location services

## Features Overview

### Authentication Flow
- Users can sign up with email/password or social providers
- Email verification is required for new accounts
- Password reset functionality
- Automatic session management
- Secure token storage

### Weather Integration
- Location-based weather information
- OpenWeatherMap API integration
- Real-time weather data
- Beautiful weather display in header
- Refresh functionality

### User Interface
- Modern, clean design
- Responsive layout
- Loading states and error handling
- Accessibility considerations
- Cross-platform compatibility

### Social Login
- Google OAuth integration
- Apple Sign In (iOS)
- GitHub OAuth
- Automatic profile creation
- Seamless user experience

## Troubleshooting

### Common Issues

1. **Environment variables not loading**
   - Make sure your `.env` file is in the root directory
   - Restart the development server after adding environment variables

2. **Social login not working**
   - Verify your OAuth credentials are correct
   - Check that redirect URIs are properly configured
   - Ensure the provider is enabled in Supabase

3. **Database connection issues**
   - Verify your Supabase URL and anon key
   - Check that RLS policies are properly configured
   - Ensure the database schema is created

4. **Weather not loading**
   - Check that your OpenWeatherMap API key is correct
   - Ensure location permissions are granted
   - Verify internet connectivity

5. **Location permission issues**
   - Check that location permissions are enabled in device settings
   - Ensure the app has proper location permissions in app.json
   - Test on a physical device (location may not work in simulator)

### Getting Help

If you encounter any issues:
1. Check the Supabase documentation
2. Review the environment variable configuration
3. Verify your OAuth provider settings
4. Check the browser console for error messages
5. Ensure all API keys are properly configured

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
