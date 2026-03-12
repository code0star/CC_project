const express = require('express');
const os = require('os'); // Built-in Node.js module
const app = express();

const port = 3006;

// 1. Get the Private IP of the current machine
const networkInterfaces = os.networkInterfaces();
let currentPrivateIP = '';

// Loop through network cards to find the internal IPv4
for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
        if (iface.family === 'IPv4' && !iface.internal) {
            currentPrivateIP = iface.address;
        }
    }
}

// 2. Simple If-Else logic to identify the server
let serverIdentity = "Unknown Server";
if (currentPrivateIP === '13.60.31.95') {  // Replace with Server 1 Private IP
    serverIdentity = "Server 1 (Primary)";
} else if (currentPrivateIP === '51.21.218.164') { // Replace with Server 2 Private IP
    serverIdentity = "Server 2 (Backup)";
} else {
    serverIdentity = `Local Dev (IP: ${currentPrivateIP})`;
}

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', { 
        serverID: serverIdentity,
        ip: currentPrivateIP 
    });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`System running on ${serverIdentity}`);
});