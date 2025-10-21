class Spawner{
    Id: number;
    TeamId: number = -1;
    Position: mod.Vector | undefined;
    LastSpawnedPlayer: mod.Player | undefined;

    constructor(id: number, teamId: number = -1){
        this.Id = id;
        this.TeamId = teamId;
    }
}

class IntelligentSpawner {

    private spawners: Spawner[] = [];
    private teams: mod.Team[] = [];
    private exploredPercentage: number = 0;

    public MaxDistance: number = -1;
    public MinDistance: number = -1;
    public TeamFilter: boolean = false;

    constructor(){
    }

    public SetTeams(teams: mod.Team[]){
        this.teams = teams;
    }

    public SetSpawners(spawners: Spawner[]){
        this.spawners = spawners;
    }

    public AddSpawner(spawner: Spawner){
        this.spawners.push(spawner);
    }

    public GetExploredPercentage(): number { return this.exploredPercentage; }

    public SpawnPlayer(modPlayer: mod.Player, spawnerId: number | undefined): boolean {
        if (spawnerId){
            return this.spawnPlayerOnSpawner(modPlayer, spawnerId);
        } else {
            return this.spawnPlayerOnNextSpawner(modPlayer);
        }
    }

    private spawnPlayerOnSpawner(modPlayer: mod.Player, spawnerId: number): boolean {
        const modSpawner = mod.GetSpawner(spawnerId);
        if (!modSpawner)
            return false;
        const ownSpawner = this.getOwnSpawner(spawnerId);
        if (!ownSpawner){
            return false;
        }
        ownSpawner.LastSpawnedPlayer = modPlayer;
        mod.SpawnPlayerFromSpawnPoint(modPlayer, ownSpawner.Id);
        return true;
    }

    private spawnPlayerOnNextSpawner(modPlayer: mod.Player): boolean {
        const filteredTeam = this.TeamFilter ? mod.GetTeam(modPlayer) : undefined;
        const nextSpawner = this.getNextSpawner(filteredTeam);
        if (!nextSpawner)
            return false;
        nextSpawner.LastSpawnedPlayer = modPlayer;
        mod.SpawnPlayerFromSpawnPoint(modPlayer, nextSpawner.Id);
        return true;
    }

    private getOwnSpawner(id: number): Spawner | undefined {
        return this.spawners.find((s) => s.Id == id);
    }

    private getOwnSpawnerWithLatestPlayer(modPlayer: mod.Player): Spawner | undefined {
        return this.spawners.find((s) => mod.Equals(s.LastSpawnedPlayer, modPlayer));
    }

    private getNextSpawner(team: mod.Team | undefined): Spawner | undefined {
        const unpositionedSpawner = this.spawners.find((s) => s.Position === undefined);
        if (unpositionedSpawner){
            return unpositionedSpawner;
        } else {
            return this.getMostRemoteSpawner(team);
        }
    }

    private getMostRemoteSpawner(team: mod.Team | undefined): Spawner | undefined {
        let mostRemoteDistance: number = -1;
        let mostRemoteSpawner: Spawner | undefined;
        this.spawners.forEach(spawner => {
            const spawnerPos = spawner.Position;
            if (!spawnerPos)
                return;
            let checkedTeams = this.createTeamFilter(team);
            checkedTeams.forEach(team => {
                const closestPlayer = this.getClosestPlayer(spawnerPos, team);
                const closestPlayerPos = mod.GetSoldierState(closestPlayer, mod.SoldierStateVector.GetPosition);
                const distance = mod.DistanceBetween(spawnerPos, closestPlayerPos);

                const inMinRange = this.MinDistance === -1 || distance >= this.MinDistance;
                const inMaxRange = this.MaxDistance === -1 || distance <= this.MaxDistance;

                if (inMinRange && inMaxRange && distance > mostRemoteDistance){
                    mostRemoteDistance = distance;
                    mostRemoteSpawner = spawner;
                }
            });
        });
        return mostRemoteSpawner;
    }

    private createTeamFilter(team: mod.Team | undefined): (mod.Team | undefined)[] {
        if (this.TeamFilter && team !== undefined && this.teams.length > 0)
            return this.teams.filter(x => !mod.Equals(team, x));
        else
            return [undefined];
    }

    private getClosestPlayer(pos: mod.Vector, team: mod.Team | undefined): mod.Player {
        if (team !== undefined)
            return mod.ClosestPlayerTo(pos, team);
        else 
            return mod.ClosestPlayerTo(pos);
    }

    public OnPlayerDeployedHandler(modPlayer: mod.Player){
        const ownSpawner = this.getOwnSpawnerWithLatestPlayer(modPlayer);
        if (!ownSpawner)
            return;
        const pos = mod.GetSoldierState(modPlayer, mod.SoldierStateVector.GetPosition);
        ownSpawner.Position = pos;
        this.exploredPercentage = this.spawners.filter(x => x.Position !== undefined).length / this.spawners.length;
    }
}

const SpawnerListExample: Spawner[] = [
    new Spawner(1001, 0),
    new Spawner(1002, 0),
    new Spawner(1003, 0),
    new Spawner(1004, 0),
    new Spawner(1005, 0),
    new Spawner(1006, 0),
    new Spawner(1007, 0),
    new Spawner(1008, 0),
    new Spawner(1101, 1),
    new Spawner(1102, 1),
    new Spawner(1103, 1),
    new Spawner(1104, 1),
    new Spawner(1105, 1),
    new Spawner(1106, 1),
    new Spawner(1107, 1),
    new Spawner(1108, 1),
]

const SpawnSystem: IntelligentSpawner = new IntelligentSpawner();

export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    SpawnSystem.OnPlayerDeployedHandler(eventPlayer);
}

// Triggered on main gamemode start/end. Useful for game start setup and cleanup.
export async function OnGameModeStarted() {
    SpawnSystem.SetSpawners(SpawnerListExample);
}
