import { Category } from "./contracts";

export interface MockPost {
    id: bigint;
    author: string;
    ipfsHash: string;
    upvotes: bigint;
    downvotes: bigint;
    timestamp: bigint;
    category: Category;
    exists: boolean;
}

const now = Math.floor(Date.now() / 1000);

export const MOCK_POSTS: MockPost[] = [
    {
        id: 1n,
        author: "0x3A7dF8c92E1b4A5cd6F9eB3d82C4a1E3f7B9d0C2",
        ipfsHash: "",
        upvotes: BigInt("450000000000000000"),
        downvotes: BigInt("120000000000000000"),
        timestamp: BigInt(now - 1800),
        category: Category.NEWS,
        exists: true,
    },
    {
        id: 2n,
        author: "0xB2e5D7c1a9F3E6d4b8C0A5f2D1e7B3c6F9a4E8d1",
        ipfsHash: "",
        upvotes: BigInt("870000000000000000"),
        downvotes: BigInt("230000000000000000"),
        timestamp: BigInt(now - 3600),
        category: Category.TIMELINE,
        exists: true,
    },
    {
        id: 3n,
        author: "0x7F1eA9c3D5b2E8f4a6C0d7B3e1F5a9D2c6E8b0A4",
        ipfsHash: "",
        upvotes: BigInt("2100000000000000000"),
        downvotes: BigInt("1900000000000000000"),
        timestamp: BigInt(now - 7200),
        category: Category.DECISION,
        exists: true,
    },
    {
        id: 4n,
        author: "0xD4c8B1e5A2f9C6d0E3b7F1a4D8c2E5b9A0f3C7d6",
        ipfsHash: "",
        upvotes: BigInt("310000000000000000"),
        downvotes: BigInt("50000000000000000"),
        timestamp: BigInt(now - 10800),
        category: Category.NEWS,
        exists: true,
    },
    {
        id: 5n,
        author: "0x9E2fA6d1C3b5E8a4D0c7F2B1e9A5d3C6f8B0a4E7",
        ipfsHash: "",
        upvotes: BigInt("1500000000000000000"),
        downvotes: BigInt("600000000000000000"),
        timestamp: BigInt(now - 14400),
        category: Category.TIMELINE,
        exists: true,
    },
    {
        id: 6n,
        author: "0x3A7dF8c92E1b4A5cd6F9eB3d82C4a1E3f7B9d0C2",
        ipfsHash: "",
        upvotes: BigInt("90000000000000000"),
        downvotes: BigInt("40000000000000000"),
        timestamp: BigInt(now - 18000),
        category: Category.DECISION,
        exists: true,
    },
    {
        id: 7n,
        author: "0xF5a1B8e3C7d0A4f2E6b9D1c5A3e7F0B2d8C4a6E9",
        ipfsHash: "",
        upvotes: BigInt("5200000000000000000"),
        downvotes: BigInt("180000000000000000"),
        timestamp: BigInt(now - 21600),
        category: Category.NEWS,
        exists: true,
    },
    {
        id: 8n,
        author: "0xB2e5D7c1a9F3E6d4b8C0A5f2D1e7B3c6F9a4E8d1",
        ipfsHash: "",
        upvotes: BigInt("420000000000000000"),
        downvotes: BigInt("380000000000000000"),
        timestamp: BigInt(now - 28800),
        category: Category.TIMELINE,
        exists: true,
    },
];

// Simulated IPFS content for each post
export const MOCK_CONTENT: Record<string, string> = {
    "1": "Federal Reserve signals potential rate pause in March. Bond markets already pricing in a hold — equity analysts remain cautiously optimistic about Q2 earnings.",
    "2": "Large language models are increasingly being used for due diligence in M&A. Three major firms now require AI-assisted analysis before signing term sheets.",
    "3": "Should decentralized identity become a prerequisite for participating in governance votes? The tradeoff between privacy and accountability needs careful consideration.",
    "4": "EU's AI Act enforcement begins next quarter. Companies with over 500 employees must demonstrate compliance. Early movers already adapting internal processes.",
    "5": "Observed a 23% increase in API latency across major cloud providers this week. Likely linked to increased inference workloads from enterprise AI deployments.",
    "6": "The community should consider implementing quadratic voting for protocol upgrades. Linear voting overweighs whale positions and underrepresents smaller participants.",
    "7": "Breaking: SEC approves spot Ethereum ETF applications from three major asset managers. Markets reacting positively, with ETH up 8% in after-hours trading.",
    "8": "Interesting pattern in sentiment data — retail investor confidence and institutional positioning are diverging significantly for the first time since Q3 2024.",
};

// Mock reputation scores
export const MOCK_REPUTATION: Record<string, number> = {
    "0x3A7dF8c92E1b4A5cd6F9eB3d82C4a1E3f7B9d0C2": 87,
    "0xB2e5D7c1a9F3E6d4b8C0A5f2D1e7B3c6F9a4E8d1": 72,
    "0x7F1eA9c3D5b2E8f4a6C0d7B3e1F5a9D2c6E8b0A4": 45,
    "0xD4c8B1e5A2f9C6d0E3b7F1a4D8c2E5b9A0f3C7d6": 91,
    "0x9E2fA6d1C3b5E8a4D0c7F2B1e9A5d3C6f8B0a4E7": 63,
    "0xF5a1B8e3C7d0A4f2E6b9D1c5A3e7F0B2d8C4a6E9": 95,
};

// Mock verification statuses
export const MOCK_VERIFICATION: Record<string, "valid" | "invalid" | "pending" | "tie"> = {
    "1": "valid",
    "2": "valid",
    "3": "pending",
    "4": "valid",
    "5": "pending",
    "6": "pending",
    "7": "valid",
    "8": "tie",
};
