const mongoose = require("mongoose");

const User = require("../models/User");

const add_money = (rank) => {
    if (rank == 1) return 200;
    if (rank == 2) return 100;
    if (rank == 3) return 60;
    return 0;
}


exports.create_gw_rank = async (managerID, gameweek) => {

    const gw_data = await User.find({}).select({"_id": 0, "managerID": 1, "history.points": 1});

    return new Promise((resolve, reject) => {

        try {
            // Get managerID and gameweek points in a 2D array
            let gw = gw_data.map(manager => [manager.managerID, manager.history[gameweek].points]);

            // convert 2D array to array of objects
            gw = gw.map(([managerID, points]) => ({managerID, points}));

            // Sort the array in descending order by "points" filed
            gw.sort((a, b) => b.points - a.points)

            let rank = 0;
            
            gw.forEach((value, index) => {

                if (index > 0 && value.points == gw[index - 1].points) {
                    rank = rank - 1;
                }

                rank = rank + 1;

                let amount = add_money(rank);

                if(value.managerID == managerID) {                    
                    const points = value.points;
                    const rankObj = {rank, points, amount};
                    resolve(rankObj);
                }
            });
        } catch (error) {
            reject(err.message);        
        }
    });
}