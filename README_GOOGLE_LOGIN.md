

### ✅ Frontend (New)
```
frontend/
├── src/
│   ├── services/
│   │   └── authService.ts          ← NEW: API service
│   ├── pages/
│   │   └── auth/
│   │       └── Callback.tsx        ← NEW: OAuth callback
│   └── components/
│       └── login-form.tsx          ← UPDATED: Google button
└── .env.local                       ← NEW: Environment variables
```

### ✅ Backend (Updated)
```
backend/
├── routes/
│   └── user_routes.py              ← UPDATED: /api/auth/google endpoint
├── main.py                          ← UPDATED: Router configuration
└── GOOGLE_LOGIN_SETUP.py           ← NEW: Setup guide
```

---

## 🎯 Quy Trình Tổng Quan

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  1. User nhấn "Login with Google"                       │
│     ↓                                                   │
│  2. Frontend redirect tới Google OAuth                  │
│     ↓                                                   │
│  3. User authorize app trên Google                      │
│     ↓                                                   │
│  4. Google redirect về /auth/callback với token        │
│     ↓                                                   │
│  5. Frontend gửi token tới backend /api/auth/google    │
│     ↓                                                   │
│  6. Backend verify token + tạo/tìm user                │
│     ↓                                                   │
│  7. Backend trả JWT token                              │
│     ↓                                                   │
│  8. Frontend save token, redirect dashboard            │
│     ↓                                                   │
│  9. User đăng nhập thành công! ✅                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Bắt Đầu Nhanh (5 Phút)

### Step 1: Cài Đặt Dependencies
```bash
cd frontend
pnpm install react-router-dom
```

### Step 2: Tạo `.env.local`
```env
VITE_GOOGLE_CLIENT_ID=548744740027-ve2hiofj92i0vmivr2fvtkqk60eiep89.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_API_BASE_URL=http://localhost:8000
```

### Step 3: Cập Nhật Routes
Thêm vào `frontend/src/routes/AppRoutes.jsx`:
```tsx
import GoogleCallback from '@/pages/auth/Callback'

<Route path="/auth/callback" element={<GoogleCallback />} />
```

### Step 4: Backend Dependencies
```bash
cd backend
pip install google-auth==2.26.0 google-auth-oauthlib==1.2.0
```

### Step 5: Kiểm Tra
```bash
# Terminal 1
cd backend && python main.py

# Terminal 2
cd frontend && pnpm dev

# Truy cập: http://localhost:5173/login
```

---

## 📱 Components & Services

### `authService.ts`
```typescript
// Đăng nhập email/password
loginWithCredentials(email, password)

// Đăng nhập Google
loginWithGoogle(googleToken)

// Lưu token
saveToken(token)

// Lấy token
getToken()

// Authorization header
getAuthHeader()

// Đăng xuất
logout()
```

### `login-form.tsx`
```typescript
// State: email, password, isLoading, error

// Email/password login
handleEmailPasswordLogin(e)

// Google OAuth
handleGoogleLogin()
```

### `Callback.tsx`
```typescript
// 1. Lấy token từ URL
// 2. Gọi loginWithGoogle()
// 3. Lưu token
// 4. Redirect tới dashboard
```

---

## 🔗 API Endpoints

### Login Email/Password
```
POST /api/login
{
  "identifier": "user@example.com",
  "password": "password123"
}
→ { access_token, user }
```

### Login Google
```
POST /api/auth/google
{
  "token": "eyJhbGciOiJSUzI1NiIs..."
}
→ { access_token, user }
```

### Protected Endpoint
```
GET /api/protected
Authorization: Bearer <token>
→ { message, user }
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Google Cloud Console Setup:**
   - Vào https://console.cloud.google.com/
   - Tạo OAuth 2.0 credentials
   - Thêm redirect URI: `http://localhost:5173/auth/callback`

2. **Environment Variables:**
   - `.env.local` cho frontend (không commit)
   - `.env` cho backend (không commit)
   - Sử dụng `.env.example` để document

3. **Token Security:**
   - Lưu token an toàn (httpOnly cookies trong production)
   - Không log token ra console
   - Implement token refresh mechanism

4. **Error Handling:**
   - Xử lý timeout
   - Xử lý network errors
   - Xử lý invalid tokens

5. **Testing:**
   - Test email/password trước
   - Sau đó test Google OAuth
   - Kiểm tra localStorage
   - Verify protected endpoints

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid Client ID" | Kiểm tra GOOGLE_CLIENT_ID trong .env |
| "Redirect URI mismatch" | Verify redirect URI exact match |
| CORS error | Đảm bảo backend allow origins |
| Token không save | Check localStorage không disabled |
| "Cannot find module" | Chạy `pnpm install` |
| Backend connection refused | Khởi động backend trước |

Xem chi tiết tại **GOOGLE_LOGIN_GUIDE.md**

---

## ✅ Checklist Triển Khai

### Frontend
- [ ] Install dependencies
- [ ] Tạo `.env.local`
- [ ] Add callback route
- [ ] Test email/password login
- [ ] Test Google OAuth flow
- [ ] Check token saving
- [ ] Verify dashboard access

### Backend
- [ ] Install dependencies
- [ ] Verify `.env` config
- [ ] Check CORS settings
- [ ] Test `/api/login` endpoint
- [ ] Test `/api/auth/google` endpoint
- [ ] Test protected endpoint
- [ ] Verify JWT verification

### Google Cloud Console
- [ ] Create project
- [ ] Setup OAuth consent
- [ ] Create OAuth credentials
- [ ] Add redirect URI
- [ ] Copy credentials to .env

### Security
- [ ] Kiểm tra token không exposed
- [ ] Verify HTTPS cho production
- [ ] Setup rate limiting
- [ ] Implement logging
- [ ] Test error cases

---

## 📚 Học Thêm

- **OAuth 2.0:** https://developers.google.com/identity/protocols/oauth2
- **JWT:** https://jwt.io/
- **React Router:** https://reactrouter.com/
- **FastAPI:** https://fastapi.tiangolo.com/
- **Google Cloud Console:** https://console.cloud.google.com/

---

## 🎓 Khái Niệm Chính

### OAuth 2.0
- User authorize app truy cập Google account
- App nhận token từ Google
- Token chứa user information
- An toàn vì không cần lưu password

### JWT (JSON Web Tokens)
- Được ký bằng secret key
- Không thể thay đổi mà không có key
- Chứa user info đã encode
- Stateless authentication

### Frontend ↔ Backend Flow
```
Frontend                          Backend
   ↓                                ↓
Login page                       Accept request
   ↓                                ↓
Send credentials ────POST────→ Verify & generate JWT
   ↓                                ↓
Receive & save JWT ←────────── Send JWT + user info
   ↓                                ↓
Access dashboard               User authenticated
   ↓                                ↓
Include JWT in header ─────────→ Verify token
   ↓                                ↓
Receive data ←────────────────── Return data
```

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:

1. **Kiểm tra logs:**
   - Frontend console: F12 → Console tab
   - Backend console: Terminal output

2. **Thường xuyên commit:**
   - Track changes qua git
   - Dễ debug khi có lỗi

3. **Xem debug info:**
   - `localStorage.getItem('access_token')`
   - Network tab → check requests
   - Backend logs

4. **Đọc error messages:**
   - Backend error details
   - Frontend console errors
   - Network response status

---

## 🎉 Kết Luận

Bạn đã có tất cả các tài liệu và code cần thiết để:
- ✅ Tích hợp Google OAuth login
- ✅ Xử lý JWT authentication
- ✅ Bảo vệ protected endpoints
- ✅ Auto-create user via Google
- ✅ Handle errors & edge cases

**Bước tiếp theo:**
1. Đọc QUICK_REFERENCE.md (5 phút)
2. Follow 5-minute quick setup
3. Test email/password login
4. Test Google OAuth
5. Deploy tới production

Chúc bạn thành công! 🚀
