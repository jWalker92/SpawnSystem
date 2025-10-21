# Intelligent Spawner System

The **Intelligent Spawner System** is a modular and flexible way to handle player spawn logic Battlefield 6 Portal. 
It provides team-based and distance-aware spawning with automatic tracking of explored spawn points.
Current spawn implementations need to either spawn and despawn the player, or need the exact spawn positions of every spawn object for every map.

The one is very bad UX for the player, the other one is a huge overcomplification for the portal dev.
This system tries to be a system that automatically discovers the positions of the spawners while they are being used.

---

## 📦 Features

- Manage and organize multiple **Spawner** points.  
- Supports **team-based filtering** and **distance-based spawn selection**.  
- Keeps track of which spawn points have been "explored" (used).  
- Provides helper methods to **spawn specific players**, **auto-select spawners**, and **update exploration progress** dynamically.

---

## 🧩 Classes Overview

### `class Spawner`

Represents a single spawn point in the world.

```ts
class Spawner {
    Id: number;
    TeamId: number = -1;
    Position?: mod.Vector;
    LastSpawnedPlayer?: mod.Player;

    constructor(id: number, teamId: number = -1) {
        this.Id = id;
        this.TeamId = teamId;
    }
}
```

**Properties**
| Property | Type | Description |
|-----------|------|-------------|
| `Id` | `number` | Unique spawn point ID from godot. |
| `TeamId` | `number` | Team association (e.g. 0 = Team 1, 1 = Team 2 ...). |
| `Position` | `mod.Vector` | Last known world position of this spawner. |
| `LastSpawnedPlayer` | `mod.Player` | Player last spawned at this spawner. |

---

### `class IntelligentSpawner`

Controls all spawn logic and manages available spawners.

```ts
const SpawnSystem = new IntelligentSpawner();
SpawnSystem.SetSpawners(SpawnerListExample);
SpawnSystem.SetTeams([mod.Team1, mod.Team2]);
```

**Key Features**
- Automatically finds the most suitable spawner.
- Optional team filter for symmetric spawning.
- Min/Max distance filters for avoiding crowded areas.
- Tracks explored spawners as players deploy.

---

## ⚙️ Configuration

```ts
SpawnSystem.MaxDistance = 100.0;
SpawnSystem.MinDistance = 10.0;
SpawnSystem.TeamFilter = true;
```

| Setting | Type | Description |
|----------|------|-------------|
| `MaxDistance` | `number` | Maximum allowed distance from other players. |
| `MinDistance` | `number` | Minimum distance from other players. |
| `TeamFilter` | `boolean` | Whether to only consider opposing teams. |

---

## 🚀 Usage Examples

### Spawn a player at a specific spawner

```ts
const player: mod.Player = ...;
const success = SpawnSystem.SpawnPlayer(player, 1001);

if (success) {
    mod.Log("Player spawned successfully!");
} else {
    mod.Log("Failed to spawn player.");
}
```

### Spawn a player automatically on the next available spawner

```ts
const player: mod.Player = ...;
SpawnSystem.SpawnPlayer(player, undefined);
```

This will find the **most remote** available spawner based on:
- Team filtering (`TeamFilter`)
- Distance constraints (`MinDistance` / `MaxDistance`)
- Whether a position has already been explored.

The Method returns true or false if a suitable spawn point has been found.
You can either try again after waiting or dynamically set the Min / Max Distances and try again.

---

## 🧠 Handling Player Deployment

Each time a player successfully spawns (is deployed), you should notify the system so it can update exploration status.
Add the Handler function to the corresponding Portal event:

```ts
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    SpawnSystem.OnPlayerDeployedHandler(eventPlayer);
}
```

This will:
- Update the corresponding `Spawner.Position` with the player’s position.
- Recalculate `exploredPercentage` to track world coverage.

You can retrieve that percentage:

```ts
const explored = SpawnSystem.GetExploredPercentage();
mod.Log(`Explored spawners: ${(explored * 100).toFixed(1)}%`);
```

---


## 📊 Utility Functions (internal)

| Function | Description |
|-----------|-------------|
| `getOwnSpawner(id)` | Finds spawner by ID. |
| `getNextSpawner(team)` | Selects next suitable spawner. |
| `getMostRemoteSpawner(team)` | Finds the most distant spawner based on player positions. |
| `createTeamFilter(team)` | Filters teams based on `TeamFilter`. |
| `getClosestPlayer(pos, team)` | Returns nearest player to a given position. |

---

## 🏁 Summary

| Method | Purpose |
|--------|----------|
| `SetSpawners()` | Load all available spawn points. |
| `SetTeams()` | Define available teams. |
| `SpawnPlayer()` | Spawn player manually or automatically. |
| `OnPlayerDeployedHandler()` | Handler forwarding for internal use. |
| `GetExploredPercentage()` | Monitor progress. |

---

## 📄 License

Free for use in any non-commercial mod.  
Attribution appreciated but not required.
