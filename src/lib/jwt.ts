import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export function signJwt(payload: object) {
	return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

//TODO: figure out how jwt work
export function verifyJwt(token: string) {
	try {
		return jwt.verify(token, SECRET);
	} catch (error) {
		return null; // Invalid token
	}
}
