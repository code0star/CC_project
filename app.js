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

// Resolve server identity from private IP
function getServerIdentity(privateIP) {
    if (privateIP === '172.31.42.54') return "Server 1 (Primary)";
    if (privateIP === '172.31.26.89') return "Server 2 (Backup)";
    return "Local Dev";
}

// Get public IP from EC2 metadata
async function getPublicIP() {
    try {
        const res = await fetch('http://169.254.169.254/latest/meta-data/public-ipv4');
        return await res.text();
    } catch (e) {
        return currentPrivateIP; // fallback for local dev
    }
}

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', {
        serverID: getServerIdentity(currentPrivateIP),
        ip: app.locals.publicIP || currentPrivateIP
    });
});

// Fetch public IP first, then start server
getPublicIP().then((publicIP) => {
    app.locals.publicIP = publicIP;
    const serverIdentity = getServerIdentity(currentPrivateIP);

    app.listen(port, '0.0.0.0', () => {
        console.log(`Running on ${serverIdentity} — Private IP: ${currentPrivateIP} — Public IP: ${publicIP}`);
    });
});