# WorkDoc360 Mobile App Integration Guide

## Overview

This guide explains how to integrate a mobile app (React Native, Flutter, or native iOS/Android) with your WorkDoc360 web platform.

## Authentication Architecture

### Web Platform
- **Session-based authentication** using Express sessions and Passport.js
- **Cookie-based** authentication for web browsers
- Routes: `/api/login`, `/api/register`, `/api/logout`, `/api/user`

### Mobile App
- **Token-based authentication** for mobile apps
- **Bearer token** authentication headers
- Routes: `/api/mobile/login`, `/api/mobile/register`, `/api/mobile/user`

## Mobile API Endpoints

### 1. Mobile Registration
```http
POST /api/mobile/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Smith"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Smith"
  },
  "token": "base64encodedtoken",
  "message": "Registration successful"
}
```

### 2. Mobile Login
```http
POST /api/mobile/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Smith"
  },
  "token": "base64encodedtoken",
  "message": "Login successful"
}
```

### 3. Get Current User
```http
GET /api/mobile/user
Authorization: Bearer base64encodedtoken
```

**Response:**
```json
{
  "id": "user123",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Smith"
}
```

## Shared API Endpoints

All other API endpoints work for both web and mobile:

### Companies
- `GET /api/companies` - Get user's companies
- `POST /api/companies` - Create new company
- `PUT /api/companies/:id` - Update company

### Documents
- `GET /api/documents/:companyId` - Get company documents
- `POST /api/documents` - Generate new document
- `GET /api/document-templates` - Get available templates

### Compliance
- `GET /api/cscs-cards/:companyId` - Get CSCS cards
- `POST /api/cscs-cards` - Add CSCS card
- `GET /api/risk-assessments/:companyId` - Get risk assessments

## Mobile App Implementation Examples

### React Native Example

```javascript
// auth.js
const API_BASE = 'https://workdoc360.com/api';

export const mobileAuth = {
  async login(email, password) {
    const response = await fetch(`${API_BASE}/mobile/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },

  async register(userData) {
    const response = await fetch(`${API_BASE}/mobile/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  },

  async getCurrentUser(token) {
    const response = await fetch(`${API_BASE}/mobile/user`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};

// api.js
export const apiRequest = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  return response.json();
};
```

### Flutter Example

```dart
// auth_service.dart
class AuthService {
  static const String baseUrl = 'https://workdoc360.com/api';
  
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mobile/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return jsonDecode(response.body);
  }
  
  static Future<Map<String, dynamic>> register(Map<String, String> userData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/mobile/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(userData),
    );
    return jsonDecode(response.body);
  }
  
  static Future<Map<String, dynamic>> getCurrentUser(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/mobile/user'),
      headers: {'Authorization': 'Bearer $token'},
    );
    return jsonDecode(response.body);
  }
}
```

## Security Considerations

### Current Implementation
- **Basic token system** for initial mobile app development
- **Base64 encoding** of user ID and timestamp
- **Same user database** shared between web and mobile

### Production Recommendations
1. **JWT Tokens**: Implement proper JWT with expiration and refresh tokens
2. **Token Encryption**: Use proper encryption for sensitive data
3. **Rate Limiting**: Add rate limiting for mobile endpoints
4. **Device Registration**: Track and manage registered devices
5. **Biometric Authentication**: Support fingerprint/face ID on mobile

## Data Synchronization

### Offline Support
- **Local Storage**: Cache essential data for offline access
- **Sync Queue**: Queue API calls when offline, sync when online
- **Conflict Resolution**: Handle data conflicts between offline/online states

### Real-time Updates
- **WebSocket Support**: Add WebSocket for real-time document collaboration
- **Push Notifications**: Implement for compliance alerts and document updates

## Mobile App Features

### Core Features
- ✅ User authentication (login/register)
- ✅ Company management
- ✅ Document viewing and generation
- ✅ CSCS card tracking
- ✅ Compliance monitoring

### Mobile-Specific Features
- 📱 **Camera Integration**: Scan CSCS cards and certificates
- 📱 **GPS Location**: Auto-location for site-specific documents
- 📱 **Push Notifications**: Compliance alerts and reminders
- 📱 **Offline Mode**: Access documents without internet
- 📱 **Photo Upload**: Capture site photos for risk assessments
- 📱 **QR Code Scanning**: Quick access to documents and forms

## Development Phases

### Phase 1: Basic App (2-4 weeks)
- Authentication screens
- Company selection
- Document library
- Basic compliance tracking

### Phase 2: Enhanced Features (4-6 weeks)
- Camera integration
- Offline support
- Push notifications
- Document generation

### Phase 3: Advanced Features (6-8 weeks)
- Real-time collaboration
- Advanced reporting
- Biometric authentication
- Multi-language support

## Testing Strategy

### API Testing
- All mobile endpoints return JSON responses
- Token validation works correctly
- Error handling for invalid tokens
- Rate limiting functions properly

### Mobile Testing
- Cross-platform compatibility (iOS/Android)
- Offline functionality
- Performance with large document libraries
- Security token storage

## Deployment

### App Store Requirements
- **Privacy Policy**: Update for mobile data collection
- **Terms of Service**: Include mobile app usage
- **App Icons**: Create iOS/Android app icons
- **Screenshots**: Professional app store screenshots
- **App Description**: Highlight construction industry focus

### Technical Requirements
- **API Versioning**: Maintain backwards compatibility
- **Monitoring**: Track mobile API usage and errors
- **Analytics**: Monitor user engagement and feature usage
- **Crash Reporting**: Implement crash reporting for mobile apps

## Next Steps

1. **Choose Platform**: React Native (cross-platform) or Native (iOS/Android)
2. **Set up Development Environment**: Install necessary tools and SDKs
3. **Design Mobile UI**: Create mobile-optimized designs for construction workers
4. **Implement Authentication**: Start with login/register screens
5. **Build Core Features**: Document viewing and compliance tracking
6. **Test Integration**: Ensure seamless data sync with web platform
7. **Deploy Beta Version**: Release to internal testing group
8. **App Store Submission**: Prepare for public release

## Support

For mobile app development support:
- API documentation available at `/api/docs` (when implemented)
- Test endpoints available in development environment
- Contact technical team for mobile-specific requirements

---

**WorkDoc360 Mobile App** - Bringing construction compliance to your pocket!