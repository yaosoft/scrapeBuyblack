import net from 'net';

const proxy = {
    createProxy(proxyIP, proxyPort){
        
        const server = net.createServer();

        server.on("connection", (clientToProxySocket) => {
            console.log("Client connected to proxy");
            clientToProxySocket.once("data", (data) => {
                // data = data.toString().split( 'Connection: close' )[0];
console.log(data.toString());
                let isConnectionTLS = data.toString().indexOf("CONNECT") !== -1;

                let serverPort = 80;
                let serverAddress;

                if (isConnectionTLS) {
                    serverPort = 443;

                    serverAddress = data
                        .toString().split("CONNECT")[1]
                        .split(" ")[1]
                        .split(":")[0];
                } else {
                    serverAddress = data.toString().split("Host: ")[1].split("\n")[0].replace("\r", '' ).trim();
                }

                let proxyToServerSocket = net.createConnection(
                    {
                        host: serverAddress,
                        port: serverPort
                    },
                    () => {
                        console.log("Proxy to server is setup");
                    }
                )

                if (isConnectionTLS) {
                    clientToProxySocket.write("HTTP/1.1 200 OK\r\n\n");
                } else {
                    proxyToServerSocket.write(data);
                }

                clientToProxySocket.pipe(proxyToServerSocket);
                proxyToServerSocket.pipe(clientToProxySocket);

                proxyToServerSocket.on("error", (err) => {
                    console.log("Proxy to server error");
                    console.log(err);
                })

                clientToProxySocket.on("error", (err) => {
                    console.log("Client to proxy error");
                })
            })
        })

        server.on("error", (err) => {
            console.log("Internal server error");
            console.log(err);
        })

        server.on("close", () => {
            console.log("Client disconnected");
        })

        server.listen(
            {
                host: proxyIP,
                port: proxyPort,
            },
            () => {
                console.log("Server listening on " + proxyIP + ":" + proxyPort);
            }
        );
        return true;
    }
}
proxy.createProxy( '172.31.7.213', '3000' )