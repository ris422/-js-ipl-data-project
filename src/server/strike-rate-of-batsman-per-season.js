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

function dumpJSON(data, outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
}

function calculateStrikeRate(deliveriesData, matchData) {
    const strikeRates = {};
    matchData.forEach(match => {
        const season = match.season
        deliveriesData.forEach(delivery => {
            const batsman = delivery.batsman;
            const runs = parseInt(delivery.batsman_runs);
            const balls = 1;
            const strikeRate = (runs / balls) * 100;
            if (!strikeRates[season]) {
                strikeRates[season] = {};
            }
            if (!strikeRates[season][batsman]) {
                strikeRates[season][batsman] = [];
            }
            strikeRates[season][batsman].push(strikeRate);
        });
    });
    return strikeRates;
}

function calculateAverageStrikeRate(strikeRates) {
    const averageStrikeRates = {};
    for (const season in strikeRates) {
        averageStrikeRates[season] = {};
        for (const batsman in strikeRates[season]) {
            const totalStrikeRate = strikeRates[season][batsman].reduce((acc, cur) => acc + cur, 0);
            const averageStrikeRate = totalStrikeRate / strikeRates[season][batsman].length;
            averageStrikeRates[season][batsman] = averageStrikeRate.toFixed(2);
        }
    }
    return averageStrikeRates;
}

async function main() {
    try {
        const matchData = await readCSV('../data/matches.csv');
        const deliveriesData = await readCSV('../data/deliveries.csv');
        const strikeRates = calculateStrikeRate(deliveriesData, matchData);
        const averageStrikeRates = calculateAverageStrikeRate(strikeRates);
        dumpJSON(averageStrikeRates, '../public/output/strikeRateOfBatsmanPerSeason.json');
    } catch (error) {
        console.error('An error occurred');
    }
}

main();
