// Change this to the location of your CSV file
const CSV_URL = '2020data.csv';
$.fn.dataTable.ext.errMode = 'none';
// Parse the CSV
Papa.parse(CSV_URL, {
  download: true,
  header: true,
  complete: function(results) {
    // Get the data and columns from the results
    var data = results.data;
    var columns = results.meta.fields.map(function(field) {
      return {title: field, data: field}
    });

    // Initialize the DataTable
    var table = $('#csv-table').DataTable({
      data: data,
      columns: columns,
      fixedHeader: true,  // Enable the fixed header
      fixedColumns: {
        leftColumns: 1  // Fix the first column
      },
      columnDefs: [
        {
          targets: '_all',
          width: '200px'
        }
      ]
    });

    // Listen for the 'draw' event and apply mark.js each time
    table.on('draw', function() {
      var body = $(table.table().body());
      
      body.unmark();  // Remove old search highlights
      body.mark(table.search());  // Highlight new search
    });
  }
});
