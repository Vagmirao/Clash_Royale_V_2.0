import https from 'https';
import fs from 'fs';

https.get('https://clashroyale.fandom.com/wiki/Card_Overviews', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('cr.html', data);
    console.log(`Saved html.`);
  });
}).on('error', (err) => {
  console.error(err);
});
