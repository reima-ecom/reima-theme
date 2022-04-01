const getUToken = async (
  yotpoAppKey: string,
  yotpoSecret: string,
): Promise<string> => {
  if (!yotpoAppKey || !yotpoSecret) {
    throw new Error("Please specify yotpo credentials");
  }

  const params = {
    client_id: yotpoAppKey,
    client_secret: yotpoSecret,
    grant_type: "client_credentials",
  };
  const response = await fetch("https://api.yotpo.com/oauth/token", {
    method: "POST",
    body: JSON.stringify(params),
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Couldn't get utoken: ${await response.text()}`);
  }
  const data = await response.json();

  return data.access_token;
};

export default getUToken;