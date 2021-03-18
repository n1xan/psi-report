const psi = require('psi');
var args = process.argv.slice(2);
var url = args[1];
if(url == undefined){
    return "Please supply URL for analysis.";
}

(async () => {
  // Get the PageSpeed Insights report
  const { data } = await psi(url);
  console.log('Speed score:', data.lighthouseResult.categories.performance.score);

  // Output a formatted report to the terminal
  await psi.output(url);
  console.log('Done');

  // Supply options to PSI and get back speed
  const data2 = await psi(url, {
    nokey: 'true',
    strategy: 'desktop'
  });
  console.log('Speed score:', data2.data.lighthouseResult.categories.performance.score);
})();