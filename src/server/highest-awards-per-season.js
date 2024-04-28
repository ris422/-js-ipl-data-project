const fs = require('fs');
const csv = require('csv-parser');

function readCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

function dumpJSON(data, outputPath){
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
}

function calculatehighestPOMAwardsPerSeason(matchesData){
    const awardsPerSeason = {};
    matchesData.forEach(match => {
        const season = match.season;
        const playerOfMatch = match.player_of_match;
        if (playerOfMatch) {
            if (!awardsPerSeason[season]) {
                awardsPerSeason[season] = {};
            }
            if (!awardsPerSeason[season][playerOfMatch]) {
                awardsPerSeason[season][playerOfMatch] = 0;
            }

            awardsPerSeason[season][playerOfMatch]++;
        }
    });
    const highestAwardsPerSeason = {};
    for (const season in awardsPerSeason) {
        const playerCounts = awardsPerSeason[season];
        let maxAwards = 0;
        let topPlayer = null;
        for (const player in playerCounts) {
            const awards = playerCounts[player];
            if (awards > maxAwards) {
                maxAwards = awards;
                topPlayer = player;
            }
        }
        highestAwardsPerSeason[season] = { player: topPlayer, awards: maxAwards };
    }
    return highestAwardsPerSeason;
}

async function main() {
    try{
        const matchesData = await readCSV('../data/matches.csv');
        const highestAwardsPerSeason = calculatehighestPOMAwardsPerSeason(matchesData);
        dumpJSON(highestAwardsPerSeason, '../public/output/highestAwardsPerSeason.json');
        console.log('HIghest player of the match award data dumped into output/highestAwardsPerSeason.json');
    } 
    catch(error) {
        console.log('An error occured');
    }
}

main();

