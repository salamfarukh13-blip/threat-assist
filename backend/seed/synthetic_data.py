"""
THREAT ASSIST — Synthetic Threat Actor Seed Data Generator
ACADEMIC SIH PROTOTYPE: ALL DATA IS 100% SYNTHETIC AND ARTIFICIALLY CONSTRUCTED.
Contains intentional overlaps for correlation testing:
- ACT-001 (ShadowFox) & ACT-002 (Shadow_Fox) share wallet, PGP, platform, alias similarity (High correlation)
- ACT-003 (DarkWolf) & ACT-004 (NightWolf) share partial infrastructure and forum overlaps (Medium/Weak correlation)
- ACT-005 (CryptoPhantom) & ACT-006 (PhantomGhost) share email pattern & Monero wallet prefix (Possible correlation)
"""

SYNTHETIC_ACTORS = [
    {
        "actor_id": "ACT-001",
        "primary_alias": "ShadowFox",
        "aliases": ["ShadowFox", "S_Fox", "shadow_89"],
        "emails": ["shadowfox_core@proton-mock.me", "s_fox@tutanota-demo.com"],
        "pgp_fingerprints": ["9B2A 78C1 4DF3 8810 EA42 9901 FEDC 1001", "33AA BB01 CC22 DD33"],
        "wallets": ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx001", "0x71C...DEMO_ETH_001"],
        "domains": ["shadowmarket-leak.onion", "foxleaks-demo.org"],
        "platforms": ["DreadForum", "BreachForums-Mock", "Telegram-Channel-Fox"],
        "language": "English / Russian",
        "timezone": "UTC+03:00",
        "first_seen": "2025-01-10",
        "last_seen": "2026-03-10",
        "risk_level": "critical",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Suspected broker of corporate ransomware leaks."
    },
    {
        "actor_id": "ACT-002",
        "primary_alias": "Shadow_Fox",
        "aliases": ["Shadow_Fox", "GhostFox", "shadowfox_alt"],
        "emails": ["shadow_backup@proton-mock.me"],
        "pgp_fingerprints": ["9B2A 78C1 4DF3 8810 EA42 9901 FEDC 1001"],
        "wallets": ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx001"],
        "domains": ["shadowmarket-leak.onion", "mirror-foxpay.onion"],
        "platforms": ["DreadForum", "Exploit-Mock", "Telegram-Channel-Fox"],
        "language": "English / Russian",
        "timezone": "UTC+03:00",
        "first_seen": "2025-03-15",
        "last_seen": "2026-03-12",
        "risk_level": "critical",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Shares identical BTC wallet and PGP key with ACT-001."
    },
    {
        "actor_id": "ACT-003",
        "primary_alias": "DarkWolf",
        "aliases": ["DarkWolf", "DW_Lupus", "LoneWolf_X"],
        "emails": ["darkwolf99@sec-demo.cc"],
        "pgp_fingerprints": ["FA81 2290 BC11 7723 DDEE 4512 8899 2003"],
        "wallets": ["bc1qwolf444987123aaabbbccc00000000002003"],
        "domains": ["wolfpack-escrow.onion"],
        "platforms": ["TorMarket-Mock", "DreadForum"],
        "language": "English / German",
        "timezone": "UTC+01:00",
        "first_seen": "2024-11-05",
        "last_seen": "2026-02-28",
        "risk_level": "high",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Specialized in carding escrow services."
    },
    {
        "actor_id": "ACT-004",
        "primary_alias": "NightWolf",
        "aliases": ["NightWolf", "N_Wolf", "WolfClaw"],
        "emails": ["nightwolf_ops@sec-demo.cc"],
        "pgp_fingerprints": ["77CD 1122 3344 5566 7788 99AA BBCC 2004"],
        "wallets": ["bc1qnight99988877766655544433322211102004"],
        "domains": ["wolfpack-escrow.onion"],
        "platforms": ["TorMarket-Mock", "XSS-Mock"],
        "language": "English",
        "timezone": "UTC+00:00",
        "first_seen": "2025-02-01",
        "last_seen": "2026-01-20",
        "risk_level": "medium",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Shares domain 'wolfpack-escrow.onion' with ACT-003."
    },
    {
        "actor_id": "ACT-005",
        "primary_alias": "CryptoPhantom",
        "aliases": ["CryptoPhantom", "C_Phantom", "PhantomCoiner"],
        "emails": ["phantom_fin@crypto-shield.fake"],
        "pgp_fingerprints": ["66AA 99FF 1100 2233 4455 6677 8899 2005"],
        "wallets": ["48demoXMRphantom77889900aabbccddeeffgghh05", "bc1qphantom99887766554433221100aa005"],
        "domains": ["phantom-mixer.onion"],
        "platforms": ["Bitcointalk-Mock", "DreadForum"],
        "language": "English",
        "timezone": "UTC-05:00",
        "first_seen": "2024-09-12",
        "last_seen": "2026-03-05",
        "risk_level": "high",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Operates high-volume crypto laundering syndicate."
    },
    {
        "actor_id": "ACT-006",
        "primary_alias": "PhantomGhost",
        "aliases": ["PhantomGhost", "Ghost_Phantom", "Ph4nt0m"],
        "emails": ["phantom_ops@crypto-shield.fake"],
        "pgp_fingerprints": ["66AA 99FF 1100 2233 4455 6677 8899 2005"],
        "wallets": ["48demoXMRphantom77889900aabbccddeeffgghh05"],
        "domains": ["phantom-mixer.onion", "ghost-cleaner.onion"],
        "platforms": ["DreadForum", "Telegram-LaunderSquad"],
        "language": "English",
        "timezone": "UTC-05:00",
        "first_seen": "2025-04-10",
        "last_seen": "2026-03-08",
        "risk_level": "critical",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Identical XMR address, PGP fingerprint and domain to ACT-005."
    },
    {
        "actor_id": "ACT-007",
        "primary_alias": "ByteSpecter",
        "aliases": ["ByteSpecter", "BSpecter", "0xSpecter"],
        "emails": ["specter@darkzero.xyz"],
        "pgp_fingerprints": ["1122 3344 5566 7788 9900 AABB CCDD 2007"],
        "wallets": ["0x991823...DEMO_ETH_007"],
        "domains": ["zeroday-auction.onion"],
        "platforms": ["Exploit-Mock", "XSS-Mock"],
        "language": "Russian / English",
        "timezone": "UTC+03:00",
        "first_seen": "2025-05-01",
        "last_seen": "2026-02-14",
        "risk_level": "high",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Zero-day exploit broker."
    },
    {
        "actor_id": "ACT-008",
        "primary_alias": "NeonGhost",
        "aliases": ["NeonGhost", "Neon_G", "Ghost_Neon"],
        "emails": ["neonghost@cipher-mail.cc"],
        "pgp_fingerprints": ["4455 6677 8899 0011 2233 4455 6677 2008"],
        "wallets": ["bc1qneon1234567890abcdef012345678902008"],
        "domains": ["neon-infostealer.onion"],
        "platforms": ["Telegram-Infostealers", "BreachForums-Mock"],
        "language": "English / Portuguese",
        "timezone": "UTC-03:00",
        "first_seen": "2025-06-20",
        "last_seen": "2026-03-01",
        "risk_level": "medium",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Distributes stealer logs."
    },
    {
        "actor_id": "ACT-009",
        "primary_alias": "ViperZero",
        "aliases": ["ViperZero", "Viper_0", "Vip3r"],
        "emails": ["viper0@torbox-demo.net"],
        "pgp_fingerprints": ["AABB CCDD EEFF 0011 2233 4455 6677 2009"],
        "wallets": ["bc1qviper998877665544332211009988772009"],
        "domains": ["viper-payloads.onion"],
        "platforms": ["Exploit-Mock"],
        "language": "English",
        "timezone": "UTC+05:30",
        "first_seen": "2025-01-15",
        "last_seen": "2026-02-20",
        "risk_level": "high",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Cobalt Strike and shellcode payload builder."
    },
    {
        "actor_id": "ACT-010",
        "primary_alias": "CipherKnot",
        "aliases": ["CipherKnot", "KnotSec", "C_Knot"],
        "emails": ["cipherknot@proton-mock.me"],
        "pgp_fingerprints": ["9988 7766 5544 3322 1100 AABB CCDD 2010"],
        "wallets": ["0xabc...DEMO_USDT_010"],
        "domains": ["knot-crypter.onion"],
        "platforms": ["RaidForums-Mock", "XSS-Mock"],
        "language": "Russian",
        "timezone": "UTC+03:00",
        "first_seen": "2024-10-10",
        "last_seen": "2026-01-30",
        "risk_level": "medium",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: FUD Crypter author."
    },
    {
        "actor_id": "ACT-011",
        "primary_alias": "KrakenDread",
        "aliases": ["KrakenDread", "Kraken_Admin", "TheKraken"],
        "emails": ["kraken_ops@darkmail.onion"],
        "pgp_fingerprints": ["DEAD BEEF 1010 2020 3030 4040 5050 2011"],
        "wallets": ["bc1qkraken00112233445566778899aabbcc2011"],
        "domains": ["kraken-market-main.onion", "kraken-escrow.onion"],
        "platforms": ["KrakenMarket", "DreadForum"],
        "language": "English / Russian",
        "timezone": "UTC+02:00",
        "first_seen": "2024-05-18",
        "last_seen": "2026-03-15",
        "risk_level": "critical",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Darknet market co-administrator."
    },
    {
        "actor_id": "ACT-012",
        "primary_alias": "TentacleOps",
        "aliases": ["TentacleOps", "Kraken_Support", "TentacleMod"],
        "emails": ["tentacle@darkmail.onion"],
        "pgp_fingerprints": ["DEAD BEEF 1010 2020 3030 4040 5050 2011"],
        "wallets": ["bc1qkraken00112233445566778899aabbcc2011"],
        "domains": ["kraken-market-main.onion"],
        "platforms": ["KrakenMarket", "DreadForum"],
        "language": "English / Russian",
        "timezone": "UTC+02:00",
        "first_seen": "2024-08-01",
        "last_seen": "2026-03-14",
        "risk_level": "critical",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Support staff sharing PGP key and deposit wallet with ACT-011."
    },
    {
        "actor_id": "ACT-013",
        "primary_alias": "ZeroEcho",
        "aliases": ["ZeroEcho", "EchoZero", "Z_Echo"],
        "emails": ["echo0@safe-mail-mock.cc"],
        "pgp_fingerprints": ["1029 3847 5610 2938 4756 1029 3847 2013"],
        "wallets": ["0xEcho...DEMO_ETH_013"],
        "domains": ["echodump.onion"],
        "platforms": ["BreachForums-Mock"],
        "language": "English",
        "timezone": "UTC-08:00",
        "first_seen": "2025-07-04",
        "last_seen": "2026-02-18",
        "risk_level": "medium",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: SQLi database dumps vendor."
    },
    {
        "actor_id": "ACT-014",
        "primary_alias": "CobaltReaper",
        "aliases": ["CobaltReaper", "C_Reaper", "ReaperStrike"],
        "emails": ["reaper@cobalt-shadow.su"],
        "pgp_fingerprints": ["5566 7788 9900 1122 3344 5566 7788 2014"],
        "wallets": ["bc1qreaper9876543210fedcba98765432102014"],
        "domains": ["reaper-c2.onion"],
        "platforms": ["Exploit-Mock", "Telegram-RedTeam"],
        "language": "Russian / English",
        "timezone": "UTC+03:00",
        "first_seen": "2024-12-01",
        "last_seen": "2026-03-09",
        "risk_level": "critical",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: C2 infrastructure operator."
    },
    {
        "actor_id": "ACT-015",
        "primary_alias": "IronSentry",
        "aliases": ["IronSentry", "Sentry_Iron", "Iron_Root"],
        "emails": ["ironsentry@tuta-shield.fake"],
        "pgp_fingerprints": ["7711 8822 9933 0044 1155 2266 3377 2015"],
        "wallets": ["0xIron...DEMO_USDC_015"],
        "domains": ["sentry-vpn.onion"],
        "platforms": ["DreadForum"],
        "language": "English",
        "timezone": "UTC+05:30",
        "first_seen": "2025-02-10",
        "last_seen": "2026-01-15",
        "risk_level": "low",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Bulletproof proxy seller."
    },
    {
        "actor_id": "ACT-016",
        "primary_alias": "MirageRansom",
        "aliases": ["MirageRansom", "Mirage_Locker", "MirageOperator"],
        "emails": ["negotiate@mirage-ransom.onion"],
        "pgp_fingerprints": ["BEEF CAFE 1234 5678 90AB CDEF 1122 2016"],
        "wallets": ["bc1qmirage0101010101010101010101010102016"],
        "domains": ["mirage-negotiation.onion", "mirage-blog.onion"],
        "platforms": ["Telegram-Mirage", "DreadForum"],
        "language": "English / Russian",
        "timezone": "UTC+03:00",
        "first_seen": "2025-03-01",
        "last_seen": "2026-03-18",
        "risk_level": "critical",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Ransomware-as-a-service affiliate."
    },
    {
        "actor_id": "ACT-017",
        "primary_alias": "Mirage_Affiliate",
        "aliases": ["Mirage_Affiliate", "SubMirage", "Mirage_Partner"],
        "emails": ["affiliate7@mirage-ransom.onion"],
        "pgp_fingerprints": ["BEEF CAFE 1234 5678 90AB CDEF 1122 2016"],
        "wallets": ["bc1qmirage0101010101010101010101010102016"],
        "domains": ["mirage-negotiation.onion"],
        "platforms": ["Telegram-Mirage", "XSS-Mock"],
        "language": "English",
        "timezone": "UTC+03:00",
        "first_seen": "2025-05-12",
        "last_seen": "2026-03-16",
        "risk_level": "critical",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Exact wallet and PGP key match with MirageRansom."
    },
    {
        "actor_id": "ACT-018",
        "primary_alias": "QuantumHex",
        "aliases": ["QuantumHex", "QHex", "0xQuantum"],
        "emails": ["qhex@quantsec.fake"],
        "pgp_fingerprints": ["1234 5678 9ABC DEF0 1234 5678 9ABC 2018"],
        "wallets": ["0xQuantum...DEMO_POLYGON_018"],
        "domains": ["quantum-hashcat.onion"],
        "platforms": ["Hashkiller-Mock", "BreachForums-Mock"],
        "language": "English",
        "timezone": "UTC+00:00",
        "first_seen": "2025-04-01",
        "last_seen": "2026-02-11",
        "risk_level": "low",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: NTLM hash cracking service."
    },
    {
        "actor_id": "ACT-019",
        "primary_alias": "AbyssWalker",
        "aliases": ["AbyssWalker", "Abyss_W", "WalkerInDark"],
        "emails": ["abysswalker@deepsea.fake"],
        "pgp_fingerprints": ["3344 5566 7788 9900 AABB CCDD EEFF 2019"],
        "wallets": ["bc1qabyss8887776665554443332221110002019"],
        "domains": ["abyss-documents.onion"],
        "platforms": ["TorMarket-Mock", "DreadForum"],
        "language": "French / English",
        "timezone": "UTC+01:00",
        "first_seen": "2024-07-22",
        "last_seen": "2026-01-19",
        "risk_level": "medium",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Synthetic identity document vendor."
    },
    {
        "actor_id": "ACT-020",
        "primary_alias": "SolarFlare99",
        "aliases": ["SolarFlare99", "Solar_Flare", "SF99"],
        "emails": ["solar99@flarenet.fake"],
        "pgp_fingerprints": ["9900 1122 3344 5566 7788 9900 AABB 2020"],
        "wallets": ["0xSolar...DEMO_SOL_020"],
        "domains": ["flare-ddos-stress.onion"],
        "platforms": ["HackForums-Mock"],
        "language": "English",
        "timezone": "UTC-04:00",
        "first_seen": "2025-08-01",
        "last_seen": "2026-02-25",
        "risk_level": "medium",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Booter / DDoS stresser provider."
    },
    {
        "actor_id": "ACT-021",
        "primary_alias": "FrostByte",
        "aliases": ["FrostByte", "Frost_B", "FrostyPayload"],
        "emails": ["frostbyte@nordic-dark.fake"],
        "pgp_fingerprints": ["8877 6655 4433 2211 00FF EEDD CCBB 2021"],
        "wallets": ["bc1qfrost11223344556677889900aabbccdd2021"],
        "domains": ["frost-rat.onion"],
        "platforms": ["Exploit-Mock"],
        "language": "English / Swedish",
        "timezone": "UTC+01:00",
        "first_seen": "2025-01-05",
        "last_seen": "2026-03-02",
        "risk_level": "high",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Remote access trojan author."
    },
    {
        "actor_id": "ACT-022",
        "primary_alias": "ObsidianCrow",
        "aliases": ["ObsidianCrow", "O_Crow", "DarkRaven"],
        "emails": ["crow@obsidian-network.fake"],
        "pgp_fingerprints": ["5544 3322 1100 FFEE DDCC BBAA 9988 2022"],
        "wallets": ["0xObsidian...DEMO_ETH_022"],
        "domains": ["crow-bulletproof.onion"],
        "platforms": ["DreadForum", "RaidForums-Mock"],
        "language": "English",
        "timezone": "UTC+00:00",
        "first_seen": "2024-10-18",
        "last_seen": "2026-02-17",
        "risk_level": "high",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Bulletproof VPS host administrator."
    },
    {
        "actor_id": "ACT-023",
        "primary_alias": "NebulaDrifter",
        "aliases": ["NebulaDrifter", "DrifterNebula", "N_Drift"],
        "emails": ["drifter@space-dark.fake"],
        "pgp_fingerprints": ["1100 2299 3388 4477 5566 AABB CCDD 2023"],
        "wallets": ["bc1qnebula99887766554433221100aabbcc2023"],
        "domains": ["nebula-simswap.onion"],
        "platforms": ["Telegram-Swappers", "BreachForums-Mock"],
        "language": "English",
        "timezone": "UTC-06:00",
        "first_seen": "2025-03-20",
        "last_seen": "2026-03-04",
        "risk_level": "medium",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: SIM swapping and OTP bypass seller."
    },
    {
        "actor_id": "ACT-024",
        "primary_alias": "VortexSiphon",
        "aliases": ["VortexSiphon", "V_Siphon", "VortexPump"],
        "emails": ["vortex@drainer-ops.fake"],
        "pgp_fingerprints": ["7766 5544 3322 1100 AABB CCDD EEFF 2024"],
        "wallets": ["0xVortex...DEMO_MULTI_024"],
        "domains": ["web3-claim-airdrop-drain.fake"],
        "platforms": ["Telegram-Drainers"],
        "language": "English",
        "timezone": "UTC+08:00",
        "first_seen": "2025-09-01",
        "last_seen": "2026-03-11",
        "risk_level": "high",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: Crypto wallet drainer script maintainer."
    },
    {
        "actor_id": "ACT-025",
        "primary_alias": "RogueKernel",
        "aliases": ["RogueKernel", "KernelRogue", "Ring0Root"],
        "emails": ["ring0@rootkit-lab.fake"],
        "pgp_fingerprints": ["0011 2233 4455 6677 8899 AABB CCDD 2025"],
        "wallets": ["bc1qkernel9998887776665554443332221112025"],
        "domains": ["ring0-driver-bypass.onion"],
        "platforms": ["Exploit-Mock", "XSS-Mock"],
        "language": "Russian / English",
        "timezone": "UTC+03:00",
        "first_seen": "2024-06-15",
        "last_seen": "2026-03-12",
        "risk_level": "critical",
        "notes": "SYNTHETIC / DEMONSTRATION DATA: BYOVD kernel driver rootkit developer."
    }
]

def generate_footprints_and_relationships(actors):
    footprints = []
    relationships = []
    fp_index = 1
    rel_index = 1

    for actor in actors:
        aid = actor["actor_id"]
        # Aliases
        for alias in actor.get("aliases", []):
            fpid = f"FP-{fp_index:04d}"
            fp_index += 1
            footprints.append({
                "footprint_id": fpid,
                "type": "alias",
                "value": alias,
                "associated_actors": [aid],
                "platform": actor.get("platforms", ["Unknown"])[0],
                "timestamp": actor["last_seen"],
                "metadata": {"risk": actor["risk_level"]}
            })
            relationships.append({
                "rel_id": f"REL-{rel_index:04d}",
                "source": aid,
                "target": alias,
                "relationship": "USES_ALIAS",
                "confidence": 0.98,
                "evidence": f"Alias observed in profile records for {aid}"
            })
            rel_index += 1

        # Wallets
        for wallet in actor.get("wallets", []):
            fpid = f"FP-{fp_index:04d}"
            fp_index += 1
            footprints.append({
                "footprint_id": fpid,
                "type": "wallet",
                "value": wallet,
                "associated_actors": [aid],
                "platform": "Blockchain Ledger",
                "timestamp": actor["last_seen"],
                "metadata": {"asset": "BTC/ETH/XMR"}
            })
            relationships.append({
                "rel_id": f"REL-{rel_index:04d}",
                "source": aid,
                "target": wallet,
                "relationship": "USES_WALLET",
                "confidence": 0.95,
                "evidence": f"Deposit address posted on forums by {aid}"
            })
            rel_index += 1

        # PGP
        for pgp in actor.get("pgp_fingerprints", []):
            fpid = f"FP-{fp_index:04d}"
            fp_index += 1
            footprints.append({
                "footprint_id": fpid,
                "type": "pgp",
                "value": pgp,
                "associated_actors": [aid],
                "platform": "PGP Keyserver Mock",
                "timestamp": actor["first_seen"],
                "metadata": {"fingerprint_length": len(pgp)}
            })
            relationships.append({
                "rel_id": f"REL-{rel_index:04d}",
                "source": aid,
                "target": pgp,
                "relationship": "USES_PGP",
                "confidence": 0.99,
                "evidence": f"Signed message verified on forum for {aid}"
            })
            rel_index += 1

        # Emails
        for email in actor.get("emails", []):
            fpid = f"FP-{fp_index:04d}"
            fp_index += 1
            footprints.append({
                "footprint_id": fpid,
                "type": "email",
                "value": email,
                "associated_actors": [aid],
                "platform": "Contact Info",
                "timestamp": actor["first_seen"],
                "metadata": {"domain": email.split("@")[-1] if "@" in email else ""}
            })
            relationships.append({
                "rel_id": f"REL-{rel_index:04d}",
                "source": aid,
                "target": email,
                "relationship": "USES_EMAIL",
                "confidence": 0.90,
                "evidence": f"Listed contact email in signature for {aid}"
            })
            rel_index += 1

        # Domains
        for domain in actor.get("domains", []):
            relationships.append({
                "rel_id": f"REL-{rel_index:04d}",
                "source": aid,
                "target": domain,
                "relationship": "OPERATES_DOMAIN",
                "confidence": 0.85,
                "evidence": f"Domain whois/hidden service beacon associated with {aid}"
            })
            rel_index += 1

        # Platforms
        for plat in actor.get("platforms", []):
            relationships.append({
                "rel_id": f"REL-{rel_index:04d}",
                "source": aid,
                "target": plat,
                "relationship": "ACTIVE_ON",
                "confidence": 0.92,
                "evidence": f"Active registration and posts on {plat}"
            })
            rel_index += 1

    # Add direct actor-to-actor relationship for known overlaps
    relationships.append({
        "rel_id": f"REL-{rel_index:04d}",
        "source": "ACT-001",
        "target": "ACT-002",
        "relationship": "SUSPECTED_SAME_ACTOR",
        "confidence": 0.94,
        "evidence": "Shared exact Bitcoin wallet bc1qxy2kgdy... and PGP key 9B2A 78C1..."
    })
    rel_index += 1

    relationships.append({
        "rel_id": f"REL-{rel_index:04d}",
        "source": "ACT-005",
        "target": "ACT-006",
        "relationship": "SUSPECTED_SAME_ACTOR",
        "confidence": 0.91,
        "evidence": "Shared Monero address 48demoXMR... and domain phantom-mixer.onion"
    })
    rel_index += 1

    relationships.append({
        "rel_id": f"REL-{rel_index:04d}",
        "source": "ACT-011",
        "target": "ACT-012",
        "relationship": "AFFILIATED_OPERATION",
        "confidence": 0.88,
        "evidence": "Co-located wallet and administrator PGP for KrakenMarket"
    })
    rel_index += 1

    return footprints, relationships
