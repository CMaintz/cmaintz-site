// www.maintz.dev -> maintz.dev, keeping the path and query. Permanent (301),
// so browsers and search engines remember the canonical address.
export default {
  fetch(request) {
    const url = new URL(request.url);
    url.hostname = 'maintz.dev';
    return Response.redirect(url.toString(), 301);
  },
};
