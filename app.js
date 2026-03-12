const express = require('express');
const os = require('os');
const app = express();
const port = 3006;

// Get private IP
const networkInterfaces = os.networkInterfaces();
let currentPrivateIP = '';
for (const interfaceName in networkInterfaces) {
    for (const iface of networkInterfaces[interfaceName]) {
        if (iface.family === 'IPv4' && !iface.internal) {
            currentPrivateIP = iface.address;
        }
    }
}

// Get public IP from EC2 metadata
let currentPublicIP = '';
async function getPublicIP() {
    try {
        const res = await fetch('http://169.254.169.254/latest/meta-data/public-ipv4');
        currentPublicIP = await res.text();
    } catch (e) {
        currentPublicIP = currentPrivateIP; // fallback for local dev
    }
}

let serverIdentity = "Unknown Server";
if (currentPrivateIP === '172.31.42.54') {
    serverIdentity = "Server 1 (Primary)";
} else if (currentPrivateIP === '172.31.26.89') {
    serverIdentity = "Server 2 (Backup)";
} else {
    serverIdentity = `Local Dev`;
}

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', {
        serverID: serverIdentity,
        ip: currentPublicIP || currentPrivateIP  // shows public IP
    });
});

// Fetch public IP first, then start server
getPublicIP().then(() => {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Running on ${serverIdentity} — Public IP: ${currentPublicIP}`);
    });
});