import jwt from "jsonwebtoken";
import { StringValue } from "ms";

const SECRET = process.env.JWT_SECRET!;

export function signJwt(payload: object, expiresIn: StringValue = "1h") {
	return jwt.sign(payload, SECRET, { expiresIn: expiresIn });
}

export function verifyJwt(token: string) {
	return jwt.verify(token, SECRET);
}
