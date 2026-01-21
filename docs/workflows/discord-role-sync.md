# Discord Role Sync

Synchronization of membership tiers to Discord roles.

## Auto-Sync on Profile Update

```mermaid
sequenceDiagram
    participant U as User
    participant P as Portal
    participant API as /api/update-profile
    participant AT as Airtable
    participant D as Discord API

    U->>P: Update profile
    U->>P: Enter Discord username
    P->>API: POST FormData

    API->>AT: Update Person record

    alt Discord configured
        API->>D: Search for member by username

        alt Member not found
            API-->>P: Profile saved, Discord sync failed
        else Member found
            API->>D: Get current roles
            API->>D: Remove old tier roles
            API->>D: Add new tier role
            API-->>P: Profile + Discord synced
        end
    else Discord not configured
        API-->>P: Profile saved (no Discord)
    end
```

## Bulk Sync (Staff Only)

```mermaid
flowchart TB
    A[Staff clicks Bulk Sync] --> B[Fetch all members from Airtable]
    B --> C{Has Discord username?}
    C -->|No| D[Skip]
    C -->|Yes| E{Status = Joined?}
    E -->|No| D
    E -->|Yes| F[Sync role to Discord]
    F --> G[Wait 1.5s]
    G --> H{More members?}
    H -->|Yes| C
    H -->|No| I[Show results summary]
```

## Role Mapping

```mermaid
flowchart LR
    subgraph Airtable["Airtable Tiers"]
        T1[Friend]
        T2[Member]
        T3[Resident]
        T4[Private Office]
        T5[Program]
        T6[Staff]
    end

    subgraph Discord["Discord Roles"]
        R1[Friend Role]
        R2[Member Role]
        R3[Resident Role]
        R4[Private Office Role]
        R5[Program Role]
        R6[Manual Only]
    end

    T1 --> R1
    T2 --> R2
    T3 --> R3
    T4 --> R4
    T5 --> R5
    T6 -.->|Not synced| R6
```

## Sync Logic

```mermaid
flowchart TB
    A[Get user tier and status] --> B{Status = Joined?}
    B -->|No| C[Remove all tier roles]
    B -->|Yes| D{Tier = Staff?}
    D -->|Yes| C
    D -->|No| E[Get role ID for tier]
    E --> F[Remove all other tier roles]
    F --> G[Add correct tier role]
    C --> H[Done]
    G --> H
```

## Discord Mapping Tool

Interactive tool for staff to match Discord members to Airtable records.

```mermaid
flowchart TB
    subgraph Input
        A[Paste Discord member list]
    end

    subgraph Parse
        B[Parse various formats]
        B1[username]
        B2[DisplayName - username]
        B3[Nick | Display | user]
    end

    subgraph Match
        C[Fuzzy match to Airtable]
        C1[Levenshtein distance]
        C2[Compare names, emails]
        C3[70% confidence threshold]
    end

    subgraph Review
        D[Show matches for review]
        D1[Auto-confirmed matches]
        D2[Needs review]
        D3[No match found]
    end

    subgraph Save
        E[Batch update Airtable]
        E1[50 per batch]
    end

    A --> B
    B --> B1 & B2 & B3
    B1 & B2 & B3 --> C
    C --> C1 --> C2 --> C3
    C3 --> D
    D --> D1 & D2 & D3
    D1 & D2 --> E
    E --> E1
```

## Rate Limiting

```mermaid
flowchart LR
    A[API Request] --> B{Rate limited?}
    B -->|No| C[Execute]
    B -->|Yes| D[Wait retry-after]
    D --> E{Retry count < 3?}
    E -->|Yes| A
    E -->|No| F[Fail]
    C --> G[Success]
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| 403 Forbidden | Bot role too low | Move bot role above tier roles |
| 404 Not Found | User left server | Skip user, mark as "not found" |
| 429 Rate Limited | Too many requests | Auto-retry with delay |

## Key Files

- Discord client: [app/lib/discord.ts](../../app/lib/discord.ts)
- Profile update: [app/portal/api/update-profile/route.ts](../../app/portal/api/update-profile/route.ts)
- Sync single: [app/portal/api/sync-discord-role/route.ts](../../app/portal/api/sync-discord-role/route.ts)
- Bulk sync: [app/portal/api/bulk-sync-discord-roles/route.ts](../../app/portal/api/bulk-sync-discord-roles/route.ts)
- Mapping tool: [app/portal/admin/discord-mapping/](../../app/portal/admin/discord-mapping/)
