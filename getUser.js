import jwt from "jsonwebtoken";

export default function checkauth(req) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(
          token,
          process.env.SECRET_KEY,
          function (err, decoded) {
            if (err) {
              console.log(err);
            } else {
              return decoded;
            }
          }
        );
        return user;
      } catch (err) {
        throw new Error("Invalid/Expired token");
      }
    } else {
      throw new Error("Authentication token must be 'Bearer [token]");
    }
  } else {
    throw new Error("Authorization header must be provided");
  }
}
