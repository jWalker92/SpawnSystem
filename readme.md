# Intelligent Spawner System

The **Intelligent Spawner System** is a modular and flexible way to handle player spawn logic in Battlefield 6 Portal. 
It provides team-based and distance-aware spawning.

The only thing needed to function is a list of ObjIds of the spatial spawner objects. 
If you have multiple maps in an experience you can keep them consistent and only need to set them once!

---

## 📦 Features

- Manage and organize multiple **Spawner** points.  
- Supports **team-based filtering** and **distance-based spawn selection**.

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

The Method returns true or false if a suitable spawn point has been found.
You can either try again after waiting or dynamically set the Min / Max Distances and try again.

---

## 📊 Utility Functions (internal)

| Function | Description |
|-----------|-------------|
| `getOwnSpawner(id)` | Finds spawner by ID. |
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

---

## 📄 License

Free for use in any non-commercial mod.  
Attribution appreciated but not required.
