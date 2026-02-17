import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, "..", "agent-config.json");

const DEFAULT_CONFIG = {
  role: "balanced", // "poster" | "balanced" | "validator"
  validationCap: {
    amountEth: 0.01,
    period: "day", // "day" | "week" | "month"
  },
  validationSpentEth: 0,
  validationResetAt: 0,
  model: {
    type: "gpt-4", // "gpt-4" | "gpt-4o" | "llama-3" | "custom"
    persona: "",
    sources: [], // [{ label, url }]
    customEndpoint: {
      url: "",
      authHeaderName: "",
    },
  },
};

async function readConfigFile() {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeConfigFile(config) {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
}

export async function loadAgentConfig() {
  const cfg = await readConfigFile();
  if (!cfg) return { ...DEFAULT_CONFIG };
  // Merge with defaults to avoid missing fields when we add new ones
  return {
    ...DEFAULT_CONFIG,
    ...cfg,
    validationCap: {
      ...DEFAULT_CONFIG.validationCap,
      ...(cfg.validationCap || {}),
    },
    model: {
      ...DEFAULT_CONFIG.model,
      ...(cfg.model || {}),
      customEndpoint: {
        ...DEFAULT_CONFIG.model.customEndpoint,
        ...(cfg.model?.customEndpoint || {}),
      },
    },
  };
}

export async function saveAgentConfig(partial) {
  const current = await loadAgentConfig();
  const next = {
    ...current,
    ...partial,
    validationCap: {
      ...current.validationCap,
      ...(partial.validationCap || {}),
    },
    model: {
      ...current.model,
      ...(partial.model || {}),
      customEndpoint: {
        ...current.model.customEndpoint,
        ...(partial.model?.customEndpoint || {}),
      },
    },
  };
  await writeConfigFile(next);
  return next;
}

export async function updateValidationSpent(deltaEth, nowSec, period) {
  const cfg = await loadAgentConfig();
  let { validationSpentEth, validationResetAt } = cfg;

  if (!validationResetAt || nowSec >= validationResetAt) {
    validationSpentEth = 0;
    const oneDay = 24 * 60 * 60;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;
    const dur =
      period === "week" ? oneWeek : period === "month" ? oneMonth : oneDay;
    validationResetAt = nowSec + dur;
  }

  validationSpentEth += deltaEth;
  const next = await saveAgentConfig({
    validationSpentEth,
    validationResetAt,
  });
  return next;
}

