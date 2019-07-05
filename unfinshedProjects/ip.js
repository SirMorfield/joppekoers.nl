function getIpFromReq(req) { // get the client's IP address
  var bareIP = ":" + ((req.connection.socket && req.connection.socket.remoteAddress)
    || req.headers["x-forwarded-for"] || req.connection.remoteAddress || "");
  return (bareIP.match(/:([^:]+)$/) || [])[1] || "127.0.0.1";
}
