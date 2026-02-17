/**
 * Consensus Agent Server: Express + Cron jobs for Poster, Verifier, Decision Maker.
 * Requires .env with RPC_URL, AGENT_PRIVATE_KEY, and contract addresses.
 */
import "dotenv/config";
import express from "express";
import cron from "node-cron";
import {
  CRON_POST_EVERY,
  CRON_VERIFY_EVERY,
  CRON_DECISION_EVERY,
  AGENT_PRIVATE_KEY,
  STAKING_GAME_ADDRESS,
} from "./config.js";
import { runPoster } from "./cron/poster.js";
import { runVerifier } from "./cron/verifier.js";
import { runDecisionMaker } from "./cron/decisionMaker.js";
import { loadAgentConfig, saveAgentConfig } from "./lib/agentConfigStore.js";

const app = express();
app.use(express.json());

app.get("/", (_, res) => {
  res.send("LLM Social Agent Server is operational. This is the API backend. Visit the frontend application to interact.");
});

app.get("/health", (_, res) => res.json({ status: "ok", service: "consensus-agent-server" }));

// Agent configuration endpoints
app.get("/config/agent", async (_req, res) => {
  try {
    const cfg = await loadAgentConfig();
    res.json({ ok: true, config: cfg });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/config/agent", async (req, res) => {
  try {
    const partial = req.body || {};
    const cfg = await saveAgentConfig(partial);
    res.json({ ok: true, config: cfg });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/cron/post", async (_, res) => {
  try {
    await runPoster();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/cron/verify", async (_, res) => {
  try {
    await runVerifier();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post("/cron/decision", async (_, res) => {
  try {
    await runDecisionMaker();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = parseInt(process.env.PORT, 10) || 4000;

if (!AGENT_PRIVATE_KEY) {
  console.warn("AGENT_PRIVATE_KEY not set; cron jobs will fail until .env is configured.");
}
if (!STAKING_GAME_ADDRESS) {
  console.warn("STAKING_GAME_ADDRESS not set; cron jobs will fail until contracts are deployed and .env is set.");
}

function tryListen(port, maxTries = 5) {
  if (maxTries <= 0) {
    console.error("Could not bind to any port. Stop the other process or set PORT=4001");
    process.exit(1);
  }
  const server = app.listen(port, () => {
    console.log(`Agent server listening on http://localhost:${port}`);
    console.log("Endpoints: GET /health, GET/POST /config/agent, POST /cron/post, POST /cron/verify, POST /cron/decision");
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${port} in use, trying ${port + 1}...`);
      server.close(() => {
        tryListen(port + 1, maxTries - 1);
      });
    } else {
      console.error(`Server error on port ${port}:`, err.message);
      server.close(() => {
        process.exit(1);
      });
    }
  });
}

tryListen(PORT);

// Schedule cron jobs
cron.schedule(CRON_POST_EVERY, async () => {
  try {
    await runPoster();
  } catch (e) {
    console.error("[Cron Poster]", e.message);
  }
});
cron.schedule(CRON_VERIFY_EVERY, async () => {
  try {
    await runVerifier();
  } catch (e) {
    console.error("[Cron Verifier]", e.message);
  }
});
cron.schedule(CRON_DECISION_EVERY, async () => {
  try {
    await runDecisionMaker();
  } catch (e) {
    console.error("[Cron Decision]", e.message);
  }
});
