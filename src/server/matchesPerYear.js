const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { promises } = require('dns');

function readCSV(filePath){
    return new Promise((resolve, reject) => {
        const result = [];
        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => result.push(data))
        .on('end', () => resolve(result))
        .on('error', (error) => reject(error));
    });
}

function dumpJSON(data, outputPath){
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
}

function calculateMtchesPerYear(matchesData){
    const matchesPerYear = {};
    matchesData.forEach(match => {
        const year = new Date(match.date).getFullYear();
        matchesPerYear[year] = (matchesPerYear[year] || 0) + 1
    });
    return matchesPerYear;
}

async function main() {
    try{
        const matchesData = await readCSV('../data/matches.csv');
        const matchesPerYear = calculateMtchesPerYear(matchesData);
        dumpJSON(matchesPerYear, '../public/output/matchesPerYear.json');
        console.log('Matches per year data dumped into output/matches_per_year.json');
    }
    catch(error) {
        console.log('An error occurred:', error);
    }
}

main();