import crypto from "crypto";

const SALT = process.env.IP_HASH_SALT;

function hashIp(ip: string): string {
  return crypto
    .createHash("sha256")
    .update(ip + SALT)
    .digest("hex");
}

export default hashIp;
