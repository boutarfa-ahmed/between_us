# Between Us ♥

A private couples memory sharing app where partners can upload photos with secret messages and guess each other's memories to earn points.

## 🛠️ Tech Stack

| Part | Technology |
|------|------------|
| Frontend | React 18 + Vite + React Router |
| Backend | Express.js + Prisma ORM |
| Database | PostgreSQL (Neon) |
| Storage | Cloudinary |
| Auth | JWT |

## 🚀 Quick Deploy

### Backend (Render)

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repo
4. Settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add Environment Variables:
   ```
   DATABASE_URL=your-neon-postgres-url
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=30d
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   CLIENT_URL=https://your-frontend-url.com
   ```

### Frontend (Vercel/Netlify)

1. Push your code to GitHub
2. Import project on Vercel/Netlify
3. Build settings:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output: `dist`
4. Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

## 🏃‍♂️ Local Development

### Backend
```bash
cd serveur
cp .env.example .env
# Edit .env with your credentials
npm install
npm run db:push
npm run dev
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## 📱 Features

- 📸 **Upload Memories** - Share photos with secret messages
- 🎯 **Guess Game** - Partner guesses the memory context
- ✨ **Points System** - Earn points based on difficulty (Easy: 30, Medium: 50, Hard: 80)
- 🔥 **Streaks** - Track daily activity
- 📅 **Timeline** - View all memories by date
- 👤 **Profile** - See stats and partner info

## 🎨 Design

- Glassmorphism UI
- Gradient background (pink → purple → violet)
- Bootstrap Icons
- Smooth animations

## 📄 License

Private - For personal use only