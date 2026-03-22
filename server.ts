import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { google } from "googleapis";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// Google OAuth setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/auth/google/callback`
);

app.get("/api/auth/google/url", (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.readonly"],
    prompt: "consent",
  });
  res.json({ url });
});

app.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    // In a real app, store these tokens securely (e.g., in a database linked to a session)
    // For this demo, we'll set them in a cookie (not secure for production, but works for the preview)
    res.cookie("google_tokens", JSON.stringify(tokens), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Error getting tokens:", error);
    res.status(500).send("Authentication failed");
  }
});

app.get("/api/calendar/events", async (req, res) => {
  const tokensStr = req.cookies.google_tokens;
  if (!tokensStr) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const tokens = JSON.parse(tokensStr);
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startOfWeek.toISOString(),
      timeMax: endOfWeek.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    res.json(response.data.items);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
