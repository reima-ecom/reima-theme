import { Response, serve } from "https://deno.land/std@0.87.0/http/server.ts";

/*

Use this script to develop the cart locally. Will proxy `/cart` urls
to the demo cart worker route. Start this script in one terminal 
and hugo in another with the port 8000. 

hugo server -p 8000
deno run -A dev-server.ts

*/

const server = serve({
  port: 1313,
});

console.log("http://localhost:1313/");

for await (const request of server) {
  console.log(request.url);
  let baseUrl = "http://localhost:8000";
  if (request.url.startsWith("/cart")) {
    baseUrl = "https://demo.reima.ca";
  }
  const response = await fetch(baseUrl + request.url, {
    headers: request.headers,
    method: request.method,
    body: await Deno.readAll(request.body),
  });
  request.respond({
    body: new Uint8Array(await response.arrayBuffer()),
    headers: response.headers,
    status: response.status,
  });
}
