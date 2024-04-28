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

function calculateTossAndMatchesWonPerTeam(matchesData){
    const teamWins = {};
    matchesData.forEach(match => {
        const tossWinner = match.toss_winner;
        const matchWinner = match.winner;
        if (tossWinner === matchWinner) {
            if (!teamWins[matchWinner]) {
                teamWins[matchWinner] = { tossWins: 0, matchWins: 0 };
            }
            teamWins[matchWinner].tossWins++;
            teamWins[matchWinner].matchWins++;
        } 
        else {
            if (!teamWins[tossWinner]) {
                teamWins[tossWinner] = { tossWins: 0, matchWins: 0 };
            }
            teamWins[tossWinner].tossWins++;
        }
    });

    return teamWins;
}

async function main(){
    const matchesData = await readCSV('../data/matches.csv');
    const TossAndMatchesWonPerTeam = calculateTossAndMatchesWonPerTeam(matchesData);
    dumpJSON(TossAndMatchesWonPerTeam, '../public/output/TossAndMatchesWonPerTeam.json');
    console.log('Number of matches and toss won per team dumped into output/TossAndMatchesWonPerTeam.json');
}
main();