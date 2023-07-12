const https = require('node:https');


exports.is_league_manager = async (managerID) => {
    return new Promise((resolve, reject) => {

        const LEAGUE_CODE = "673028";

        const league_url = "https://fantasy.premierleague.com/api/leagues-classic/" + LEAGUE_CODE + "/standings/";

        https.get(league_url, (response) => {

            let rawData = "";

            // listen for data coming in
            response.on("data", (data) => {
                rawData = rawData + data;
            });

            // run callback when response stream ends
            response.on("end", () => {
                try {
                    const apiData = JSON.parse(rawData);
                    const managers = apiData.standings.results;
                    // get array of manager IDs
                    const manager_ids = managers.map(manager => manager.entry);
                    // check if managerID exists in league manager_ids
                    const inLeague = manager_ids.includes(managerID);
                    resolve (inLeague);
                } catch(err) {
                    reject(err.message);
                }
            });
        });
    });
}
