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

function calculateEconomyRate(runsConceded, ballsBowled) {
    return (runsConceded / ballsBowled) * 6; 
}

function dumpJSON(data, outputPath){
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
}

function findBestEconomyInSuperOvers(deliveriesData) {
    const superOverDeliveries = deliveriesData.filter(delivery => delivery.over === '20.0' && delivery.is_super_over === '1');
    const bowlersData = {};

    superOverDeliveries.forEach(delivery => {
        const bowler = delivery.bowler;
        const runsConceded = parseInt(delivery.total_runs, 10);
        const isWideOrNoBall = parseInt(delivery.wide_runs, 10) > 0 || parseInt(delivery.noball_runs, 10) > 0;
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
        .sort((a, b) => a.economyRate - b.economyRate);
    return bowlers[0];
}

async function main() {
    try {
        const deliveriesData = await readCSV('../data/deliveries.csv');
        const bestBowler = findBestEconomyInSuperOvers(deliveriesData);
        dumpJSON(bestBowler, '../public/output/bestBowlerSuperOver.js');
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();
