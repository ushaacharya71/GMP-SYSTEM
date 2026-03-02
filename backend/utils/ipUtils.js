// export const getClientIp = (req) => {
//   const forwarded = req.headers["x-forwarded-for"];
//   if (forwarded) {
//     return forwarded.split(",")[0].trim();
//   }
//   return req.socket.remoteAddress;
// };

// export const isOfficeIp = (ip) => {
//   if (!process.env.OFFICE_IPS) return false;

//   const allowedIps = process.env.OFFICE_IPS
//     .split(",")
//     .map((i) => i.trim());

//   return allowedIps.includes(ip);
// };


export const getClientIp = (req) => {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "";

  //  Remove IPv6 prefix if present (::ffff:106.51.37.233)
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  // Normalize localhost
  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  return ip;
};

export const isOfficeIp = (ip) => {
  if (!process.env.OFFICE_IPS) return false;

  const allowedIps = process.env.OFFICE_IPS
    .split(",")
    .map((i) => i.trim());

  return allowedIps.includes(ip);
};