document.addEventListener('DOMContentLoaded', () => {
    const defaultApiUrl = 'https://cbpfapi.unocha.org/vo2/odata/Poolfund?$format=csv';

    // Load default CSV on page load
    loadCSV(defaultApiUrl);

    // Event listener for the Load CSV button
    document.getElementById('load-csv').addEventListener('click', () => {
        const selectedUrl = document.getElementById('csv-endpoint').value;
        const customUrl = document.getElementById('custom-csv-url').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Use selected URL or custom URL
        const apiUrl = document.querySelector('input[name="source"]:checked').value === 'predefined' ? selectedUrl : customUrl;

        if (apiUrl) {
            loadCSV(apiUrl, username, password);
        } else {
            alert('Please select a predefined CSV or enter a custom URL');
        }
    });

    // Event listener for radio buttons
    document.querySelectorAll('input[name="source"]').forEach((radio) => {
        radio.addEventListener('change', () => {
            const isCustom = document.querySelector('input[name="source"]:checked').value === 'custom';
            document.getElementById('csv-endpoint').style.display = isCustom ? 'none' : 'inline';
            document.getElementById('custom-csv-url').style.display = isCustom ? 'inline' : 'none';
            document.getElementById('username').style.display = isCustom ? 'inline' : 'none';
            document.getElementById('password').style.display = isCustom ? 'inline' : 'none';
        });
    });

    // Hide username and password fields initially if predefined is selected
    if (document.querySelector('input[name="source"]:checked').value === 'predefined') {
        document.getElementById('username').style.display = 'none';
        document.getElementById('password').style.display = 'none';
    }
});

function loadCSV(url, username, password) {
    // Show loading indicator
    document.getElementById('loading').style.display = 'block';
    document.getElementById('pivot-table-container').innerHTML = '';

    // Initialize progress bar
    const progressBar = document.getElementById('progress-bar');
    progressBar.style.width = '0%';

    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
        if (progress < 100) {
            progress += 10; // Increment progress
            progressBar.style.width = progress + '%';
        }
    }, 100); // Update every 100ms

    // Create Basic Auth header
    const headers = new Headers();
    if (username && password) {
        const credentials = btoa(`${username}:${password}`);
        headers.append('Authorization', `Basic ${credentials}`);
    }

    fetch(url, { headers })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.text();
        })
        .then(csvData => {
            // Parse CSV data
            const parsedData = Papa.parse(csvData, { header: true }).data;

            // Create pivot table
            createPivotTable(parsedData);
        })
        .catch(error => {
            console.error('Error fetching or parsing CSV data:', error);
            alert('Error loading CSV: ' + error.message);
        })
        .finally(() => {
            // Hide loading indicator
            document.getElementById('loading').style.display = 'none';
            clearInterval(interval); // Stop the progress simulation
            progressBar.style.width = '100%'; // Ensure it reaches 100%
        });
}

function createPivotTable(data) {
    const container = document.getElementById('pivot-table-container');

    $(container).pivotUI(
        data,
        {
            rows: [Object.keys(data[0])[0]], // Use the first column as default row
            cols: [], // No default columns
            vals: [Object.keys(data[0])[1]], // Use the second column as default value
            aggregatorName: "Sum", // Change to "Sum" for summing values
            rendererName: "Table"
        },
        true, // Update existing pivot table
        "en"
    );

}
