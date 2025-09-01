const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

// ✅ Config
const PORT = 5000;
const CLIENT_URL = "http://localhost:5173"; // React app
const GITHUB_CLIENT_ID = "";
const GITHUB_CLIENT_SECRET = "";
const repoOwner = "Neha-Shukla";
const repoName = "react-node";

// ✅ Session setup
app.use(
  session({
    secret: "your_secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(cors({ origin: CLIENT_URL, credentials: true }));

// ✅ Passport GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/github/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      profile.accessToken = accessToken;
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// ✅ Recursive function to collect .js files
async function getJsFilesFromRepo(repoOwner, repoName, path = "", token) {
  const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
    },
  });
  const items = await response.json();

  let results = [];

  for (const item of items) {
    if (item.type === "file" && item.name.endsWith(".js")) {
      results.push(path ? `${path}/${item.name}` : item.name);
    } else if (item.type === "dir") {
      // Recursively fetch files inside folder
      const nestedFiles = await getJsFilesFromRepo(
        repoOwner,
        repoName,
        item.path,
        token
      );
      results = results.concat(nestedFiles);
    }
  }

  return results;
}

// ✅ API to get all .js files (with relative paths)
app.get("/api/repo-files", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });


  try {
    const jsFiles = await getJsFilesFromRepo(
      repoOwner,
      repoName,
      "",
      req.user.accessToken
    );

    res.json(jsFiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ✅ Auth routes
app.get("/auth/github", passport.authenticate("github", { scope: ["repo"] }));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", {
    failureRedirect: CLIENT_URL,
    session: true,
  }),
  (req, res) => {
    res.redirect(`${CLIENT_URL}/dashboard`);
  }
);

app.get("/api/repo-files", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });
  try {
    const jsFiles = await getJsFilesFromRepo(
      repoOwner,
      repoName,
      "",
      req.user.accessToken
    );

    res.json(jsFiles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Logout
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect(CLIENT_URL);
  });
});

// ✅ Get single file content
app.get("/api/repo-file/:filename", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });

  const fileName = decodeURIComponent(req.params.filename);

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}`,
      {
        headers: {
          Authorization: `token ${req.user.accessToken}`,
        },
      }
    );
    const file = await response.json();

    if (file.content) {
      // GitHub returns base64 encoded content
      const content = Buffer.from(file.content, "base64").toString("utf8");
      res.json({ name: file.name, content });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    console.error("Error fetching file content:", error);
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
