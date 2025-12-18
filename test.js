const fetchVenueData = require('./modules/fetchVenueData');

fetchVenueData().then(x => console.log(JSON.stringify(x, null, 4)));
// fetchVenueData()