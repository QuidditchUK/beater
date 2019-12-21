export function parse(auth) {
  if (!auth || typeof auth !== 'string') {
    throw new Error('No or wrong argument');
  }

  const [scheme, token] = auth.split(' ');

  const result = { scheme };

  if (result.scheme !== 'Basic') {
    return result;
  }

  const decoded = Buffer.from(token, 'base64').toString('utf8');
  const colonIndex = decoded.indexOf(':');

  result.email = decoded.substr(0, colonIndex);
  result.password = decoded.substr(colonIndex + 1);

  return result;
}
