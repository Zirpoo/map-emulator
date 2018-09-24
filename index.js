var express = require('express'),
    path = require('path'),
    app = express(),
    PORT = 5934,
    index = 'index.html',
    assetsPath = '/assets';

app.use(assetsPath, express.static(path.resolve('./src' + assetsPath)));
app.get('/', (req, res) => res.sendFile(path.resolve('./src/' + index)));
app.listen(PORT, () => console.log('Listening on port ' + PORT));