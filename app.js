const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

app.use(express.json());

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
    `;
  const teamArray = await db.all(getAllPlayersQuery);
  response.send(
    teamArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
module.exports = app;

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT 
    INTO 
    cricket_team (playerName, jerseyNumber, role)
    VALUES (
        '${playerName}', ${jerseyNumber}, '${role}'
    );`;
  await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerIdQuery = `
    SELECT
      *
    FROM
      cricket_team
      WHERE player_id = ${playerId}
    `;
  const player = await db.get(getPlayerIdQuery);
  response.send(
    player.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
