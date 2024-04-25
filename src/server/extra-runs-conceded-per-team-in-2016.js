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


function calculateExtraRunsConceded(matchesData, deliveriesData, year) {
    const matchesOfYear = matchesData.filter(match => new Date(match.date).getFullYear() === year);
    const matchIdsOfYear = matchesOfYear.map(match => match.id);
    const deliveriesOfYear = deliveriesData.filter(delivery => matchIdsOfYear.includes(delivery.match_id));
    const extraRunsConceded = {};
    deliveriesOfYear.forEach(delivery => {
        const bowlingTeam = delivery.bowling_team;
        const extraRuns = parseInt(delivery.extra_runs, 10);
        extraRunsConceded[bowlingTeam] = (extraRunsConceded[bowlingTeam] || 0) + extraRuns;
    });

    return extraRunsConceded;
}

async function main() {
    try {
        const matchesData = await readCSV('../data/matches.csv');
        const deliveriesData = await readCSV('../data/deliveries.csv');;
        const extraRunsConceded2016 = calculateExtraRunsConceded(matchesData, deliveriesData, 2016);
        console.log('Extra runs conceded per team in the year 2016:');
        console.log(extraRunsConceded2016);
        dumpJSON(extraRunsConceded2016,'../public/output/extraRunsConcededPerTeamIn2016.json');
    } 
    catch (error) {
        console.log('An error occurred:', error);
    }
}

main();
