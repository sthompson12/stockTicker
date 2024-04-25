const express = require('express');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

const connStr = "mongodb+srv://sthompson:qLUCipRv7wZOnvks@cluster0.jwbuex4.mongodb.net/Stock";

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    fs.readFile('part2.html', 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading HTML file:", err);
            res.status(500).send("Internal Server Error");
            return;
        }
        res.send(data);
    });
});

app.get('/process', async (req, res) => {
    const query = req.query.query;
    const searchType = req.query.searchType;

    const client = new MongoClient(connStr);

    try {
        await client.connect();
        const db = client.db("Stock");
        const collection = db.collection("PublicCompanies");

        let searchQuery = {};
        if (searchType === 'ticker') {
            searchQuery = { ticker: query };
        } else if (searchType === 'company') {
            searchQuery = { companyName: query };
        }

        const results = await collection.find(searchQuery).toArray();
        
        //log data in the console
        console.log("Search Results:");
        results.forEach(company => {
            console.log(`Company Name: ${company.companyName}`);
            console.log(`Ticker Symbol: ${company.ticker}`);
            console.log(`Stock Price: ${company.price}`);
            console.log("---------------------------------------");
        });

        // display the data on the webpage
        let toPage = '<h2>Search Results:</h2>';
        results.forEach(company => {
            toPage += `<p><strong>Company Name:</strong> ${company.companyName}</p>`;
            toPage += `<p><strong>Ticker Symbol:</strong> ${company.ticker}</p>`;
            toPage += `<p><strong>Stock Price:</strong> ${company.price}</p>`;
            toPage += '<hr>';
        });
        res.send(toPage);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).send("Internal Server Error");
    } finally {
        await client.close();
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
