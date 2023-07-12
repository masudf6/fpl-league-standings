const https = require('node:https');


exports.get_gw_history = async (manager_id) => {
    return new Promise((resolve, reject) => {

        const url = "https://fantasy.premierleague.com/api/entry/" + manager_id + "/history/";

        https.get(url, (response) => {

            let rawData = "";

            // listen for data coming in
            response.on("data", (data) => {
                rawData = rawData + data;
            });

            // run callback when response stream ends
            response.on("end", () => {
                try {
                    const apiData = JSON.parse(rawData);
                    const gameweeks = apiData.current;
                    // get GW history in 2D array
                    const net_gameweek_ponts = gameweeks.map(gameweek => [gameweek.event, gameweek.points - gameweek.event_transfers_cost]);
                    //convert 2D array to an array of objects
                    const gwObj = net_gameweek_ponts.map(([gw, points]) => ({gw, points}));
                    resolve (gwObj);
                } catch(err) {
                    reject(err.message);
                }
            });
        });
    });
}