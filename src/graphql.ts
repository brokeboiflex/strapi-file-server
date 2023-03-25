export const query = async (query: string) => {
  const response = await fetch(process.env.DB_SERVER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query,
    }),
  });
  return response.json();
};
export const mutation = async (mutation: string) => {
  const response = await fetch(process.env.DB_SERVER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      mutation,
    }),
  });
  return response.json();
};
