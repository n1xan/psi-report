const psi = require('psi');
const Influx = require("influx");
const influx = new Influx.InfluxDB({
  host: "localhost",
  database: "googlepagespeed",
  port: 8086
});
module.exports = influx;

var args = process.argv.slice(2);
var url = args[1];
if(url == undefined){
    return "Please supply URL for analysis.";
}

(async () => {
  // Get the PageSpeed Insights report
  const { data } = await psi(url);
  console.log('Speed score:', data.lighthouseResult.categories.performance.score);

  // Write date to InfluxDB
  let date1 = Date.parse(data.analysisUTCTimestamp);
  let date = date1 * 1000000;

  influx
      .writePoints([
        {
          measurement: "googlepagespeed",
          tags: {
            pageName: data.lighthouseResult.requestedUrl,
            run: 1,
          },
          fields: {
            testID: data.analysisUTCTimestamp,
            speedScore: data.lighthouseResult.categories.performance.score,
          },
          timestamp: date,
        }
      ])
      .then(() => {
        console.log("Finished writing in influxDB")
        return influx.query(`
          select * from googlepagespeed
          order by time desc
          `);
      })
      .catch(err => {
        console.error(`Error creating Influx database!` + err);
      });

      // Output a formatted report to the terminal
      await psi.output(url);
      console.log('Done');
})();