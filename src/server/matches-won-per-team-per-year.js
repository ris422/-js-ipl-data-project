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

function calculateMatchesWonPerTeamPerYear(matchesData, deliveriesData) {
    const matchesWonPerTeamPerYear = {};
    const uniqueMatchIds = new Set();
    matchesData.forEach(match => {
        const year = new Date(match.date).getFullYear();
        const winner = match.winner;

      
        if (!uniqueMatchIds.has(match.id)) {
            uniqueMatchIds.add(match.id);
            if (!matchesWonPerTeamPerYear[year]) {
                matchesWonPerTeamPerYear[year] = {};
            }
            matchesWonPerTeamPerYear[year][winner] = (matchesWonPerTeamPerYear[year][winner] || 0) + 1;
        }
    });
    return matchesWonPerTeamPerYear;
}



async function main() {
    try{
        const matchesData = await readCSV('../data/matches.csv');
        const deliveriesData = await readCSV('../data/deliveries.csv');
        const matchesWonPerTeamPerYear = calculateMatchesWonPerTeamPerYear(matchesData, deliveriesData);
        dumpJSON(matchesWonPerTeamPerYear, '../public/output/matchesWonPerTeamPerYear.json');
        console.log('Matches per year data dumped into output/matches_per_year.json');
    }
    catch(error) {
        console.log('An error occurred:', error);
    }
}

main();
