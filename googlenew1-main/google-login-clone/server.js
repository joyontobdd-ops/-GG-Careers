const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    let filePath = '.' + req.url.split('?')[0];
    
    // Handle root path
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // Handle URLs without .html extension - add .html automatically
    const extname = path.extname(filePath);
    if (!extname && filePath !== './') {
        // Check if it's a known page route
        const possiblePages = [
            'index', 'password', 'verify', 'verify-device', 
            'verify-notification', 'verify-options'
        ];
        
        const pageName = filePath.replace('./', '');
        if (possiblePages.includes(pageName)) {
            filePath += '.html';
        }
    }
    
    const finalExtname = path.extname(filePath);
    let contentType = mimeTypes[finalExtname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // If file not found and it's a page request, try with .html
                if (!finalExtname && !filePath.endsWith('.html')) {
                    const htmlPath = filePath + '.html';
                    fs.readFile(htmlPath, (htmlError, htmlContent) => {
                        if (htmlError) {
                            res.writeHead(404);
                            res.end('File not found');
                        } else {
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(htmlContent, 'utf-8');
                        }
                    });
                } else {
                    res.writeHead(404);
                    res.end('File not found');
                }
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, () => {
    console.log(`Frontend server running at http://localhost:${port}/`);
    console.log('Press Ctrl+C to stop');
}); 