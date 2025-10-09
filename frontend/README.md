# 🎨 Order Manager - Login Component

Componente React per il login/registrazione con supporto OAuth (Google, GitHub).

## 🚀 Quick Start

### 1. Installa le dipendenze

```bash
cd frontend/components
npm install
```

### 2. Avvia il dev server

```bash
npm run dev
```

Il componente sarà disponibile su **http://localhost:3001**

## 📋 Features

✅ **Login** con email e password  
✅ **Registrazione** con validazione completa  
✅ **OAuth** Google e GitHub (da configurare)  
✅ **Remember me** per sessioni persistenti  
✅ **Validazione** in tempo reale  
✅ **Messaggi di errore/successo**  
✅ **Design responsive** con Tailwind CSS + DaisyUI  
✅ **Accessibility** completa (ARIA)  
✅ **TypeScript** strict mode  

## 🎯 Testing

### Sviluppo locale
```bash
npm run dev
```

### Build per produzione
```bash
npm run build
```

### Preview build
```bash
npm run preview
```

## 🔧 Configurazione

### Environment Variables

Crea un file `.env.local` con:

```env
REACT_APP_API_URL=http://localhost:4000
```

### Endpoints API richiesti

Il componente richiede i seguenti endpoint backend:

- `POST /auth/login` - Login con email/password
- `POST /auth/signup` - Registrazione nuovo utente
- `GET /auth/oauth/google` - Redirect OAuth Google
- `GET /auth/oauth/github` - Redirect OAuth GitHub

### Request/Response Format

**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "remember": true
}
```

**Signup Request:**
```json
{
  "name": "Mario Rossi",
  "email": "mario@example.com",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "token": "jwt.token.here",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "Mario Rossi"
  }
}
```

**Error Response:**
```json
{
  "message": "Invalid credentials",
  "error": "UNAUTHORIZED"
}
```

## 🎨 Themes

Il componente supporta i temi DaisyUI. Per cambiare tema:

```html
<html data-theme="light">  <!-- o "dark", "cupcake", ecc. -->
```

## 📦 Storybook

Per sviluppare il componente in isolamento:

```bash
npm run storybook
```

## 🧪 Testing

```bash
npm run test
```

## 📝 TODO Backend

Per integrare completamente il componente:

1. **Implementa gli endpoint** `/auth/login` e `/auth/signup`
2. **Configura JWT** con refresh token
3. **Setup OAuth** per Google e GitHub:
   - Crea app su [Google Cloud Console](https://console.cloud.google.com)
   - Crea OAuth app su [GitHub](https://github.com/settings/developers)
4. **Validazione password** lato server (min 8 char, complessità)
5. **Rate limiting** per prevenire brute force
6. **Email verification** per nuovi account

## 🔒 Security Checklist

- [ ] Password hashing con bcrypt (10+ rounds)
- [ ] JWT con expiry (1h access + 7d refresh)
- [ ] HTTPS in produzione
- [ ] CORS configurato correttamente
- [ ] Input sanitization
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] XSS prevention

## 🎯 Next Steps

1. ✅ Componente UI completato
2. ⏳ Backend NestJS con auth service
3. ⏳ JWT implementation
4. ⏳ OAuth providers setup
5. ⏳ E2E tests
6. ⏳ Storybook stories

---

**Tech Stack:**
- React 18.3
- TypeScript 5.5
- Tailwind CSS 3.4
- DaisyUI 4.12
- Vite 5.4
