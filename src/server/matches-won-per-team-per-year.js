const fs = require('fs');
const csv = require('csv-parser');

// Function to read CSV file
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
    
    // Create a set to store unique match IDs
    const uniqueMatchIds = new Set();

    // Iterate through matches data
    matchesData.forEach(match => {
        const year = new Date(match.date).getFullYear();
        const winner = match.winner;

        // Check if the match ID is not in the set
        if (!uniqueMatchIds.has(match.id)) {
            // Add the match ID to the set
            uniqueMatchIds.add(match.id);

            // Count the match as won by the batting team
            if (!matchesWonPerTeamPerYear[year]) {
                matchesWonPerTeamPerYear[year] = {};
            }
            matchesWonPerTeamPerYear[year][winner] = (matchesWonPerTeamPerYear[year][winner] || 0) + 1;
        }
    });
    return matchesWonPerTeamPerYear;
}


// Main function to calculate number of matches won per team per year
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

// Call the main function
main();
