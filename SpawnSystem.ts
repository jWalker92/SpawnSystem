class Spawner{
    Id: number;
    TeamId: number = -1;
    SpawnerObj: mod.Spawner | undefined;
    Position: mod.Vector | undefined;

    constructor(id: number, teamId: number = -1){
        this.Id = id;
        this.TeamId = teamId;
    }
}

class IntelligentSpawner {

    private spawners: Spawner[] = [];
    private teams: mod.Team[] = [];

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
        this.spawners.forEach(spawner => {
            spawner.SpawnerObj = mod.GetSpawner(spawner.Id);
            if (!spawner.SpawnerObj)
                return;
            spawner.Position = mod.GetObjectPosition(spawner.SpawnerObj);
        });
        this.spawners = this.spawners.filter(x => !x.SpawnerObj);
    }

    public AddSpawner(spawner: Spawner){
        this.spawners.push(spawner);
    }

    public SpawnPlayer(modPlayer: mod.Player, spawnerId: number | undefined): boolean {
        if (spawnerId){
            return this.spawnPlayerOnSpawner(modPlayer, spawnerId);
        } else {
            return this.spawnPlayerOnNextSpawner(modPlayer);
        }
    }

    private spawnPlayerOnSpawner(modPlayer: mod.Player, spawnerId: number): boolean {
        const ownSpawner = this.getOwnSpawner(spawnerId);
        if (!ownSpawner){
            return false;
        }
        mod.SpawnPlayerFromSpawnPoint(modPlayer, ownSpawner.Id);
        return true;
    }

    private spawnPlayerOnNextSpawner(modPlayer: mod.Player): boolean {
        const filteredTeam = this.TeamFilter ? mod.GetTeam(modPlayer) : undefined;
        const nextSpawner = this.getMostRemoteSpawner(filteredTeam);
        if (!nextSpawner)
            return false;
        mod.SpawnPlayerFromSpawnPoint(modPlayer, nextSpawner.Id);
        return true;
    }

    private getOwnSpawner(id: number): Spawner | undefined {
        return this.spawners.find((s) => s.Id == id);
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

// Triggered on main gamemode start/end. Useful for game start setup and cleanup.
export async function OnGameModeStarted() {
    SpawnSystem.SetSpawners(SpawnerListExample);
}
