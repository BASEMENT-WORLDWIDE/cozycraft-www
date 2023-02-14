import invariant from "tiny-invariant";

export const requireApiKey = (request: Request) => {
  const authorization = request.headers.get("Authorization");
  invariant(authorization, "Missing API Key");

  const [, apiKey] = authorization.split(" ");

  console.log(apiKey, process.env.SERVER_API_KEY);

  if (apiKey !== process.env.SERVER_API_KEY) {
    throw "API Key Mismatch";
  }
};
