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

function calculateEconomyRate(runsConceded, ballsBowled) {
    return (runsConceded / ballsBowled) * 6;
}

async function calculateTopEconomicalBowlers2015(deliveriesData, matchesData) {  
    const matchIDs2015 = matchesData.filter(match => new Date(match.date).getFullYear() === 2015).map(match => match.id);
    const deliveries2015 = deliveriesData.filter(delivery => matchIDs2015.includes(delivery.match_id));
    const bowlersData = {};
    deliveries2015.forEach(delivery => {
        const bowler = delivery.bowler;
        const runsConceded = parseInt(delivery.total_runs, 10);
        const isWideOrNoBall = delivery.wide || delivery.noball;
        if (!isWideOrNoBall) { 
            bowlersData[bowler] = bowlersData[bowler] || { runs: 0, balls: 0 };
            bowlersData[bowler].runs += runsConceded;
            bowlersData[bowler].balls++;
        }
    });
    const bowlers = Object.keys(bowlersData)
        .map(bowler => {
            const { runs, balls } = bowlersData[bowler];
            const economyRate = calculateEconomyRate(runs, balls);
            return { bowler, economyRate };
        })
        .sort((a, b) => a.economyRate - b.economyRate)
        .slice(0, 10);

    return bowlers;
}
async function main() {
    const matchesData = await readCSV('../data/matches.csv');
    const deliveriesData = await readCSV('../data/deliveries.csv');
    const topEconomicalBowlers2015 = await calculateTopEconomicalBowlers2015(deliveriesData, matchesData);
    dumpJSON(topEconomicalBowlers2015, '../public/output/topEconomicalBowlers2015.json');
}
    
main();

