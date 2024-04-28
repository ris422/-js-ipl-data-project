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

async function findHighestDismissals(deliveriesData) {
    const dismissals = {};
    deliveriesData.forEach(delivery => {
        const dismissalType = delivery.dismissal_kind;
        const dismissedPlayer = delivery.player_dismissed;
        const bowler = delivery.bowler;
        if (dismissalType && dismissedPlayer && bowler !== dismissedPlayer) {
            const key = `${dismissedPlayer} dismissed by ${bowler}`;
            dismissals[key] = (dismissals[key] || 0) + 1;
        }
    });
    let highestDismissals = { player: '', bowler: '', count: 0 };
    for (const key in dismissals) {
        if (dismissals[key] > highestDismissals.count) {
            const [player, bowler] = key.split(' dismissed by ');
            highestDismissals = { player, bowler, count: dismissals[key] };
        }
    }

    return highestDismissals;
}

async function main() {
    try {
        const deliveriesData = await readCSV('../data/deliveries.csv');
        const highestDismissals = await findHighestDismissals(deliveriesData);
        dumpJSON(highestDismissals,'../public/output/highestDismissals.json');
        console.log(Done);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();
