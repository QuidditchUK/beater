export default function Interaction({
  details, title, client, params, uid,
}) {
  const isNewAuthorization = [
    details.scopes.accepted,
    details.scopes.rejected,
    details.claims.accepted,
    details.claims.rejected,
  ].every(({ length }) => length === 0);

  const previouslyAuthorized = [details.scopes.new, details.claims.new].every(({ length }) => length === 0);

  const newScopes = new Set(details.scopes.new);
  newScopes.delete('openid');
  newScopes.delete('offline_access');

  const newClaims = new Set(details.claims.new);
  ['sub', 'sid', 'auth_time', 'acr', 'amr', 'iss'].forEach(Set.prototype.delete.bind(newClaims));

  return (
    <div class="login-card">
      <h1>{title}</h1>
      <div class="login-client-image">
        {client.logoUri && (<img src={client.logoUri} />)}
      </div>

      <ul>
        {isNewAuthorization && (<li>this is a new authorization</li>)}
        {previouslyAuthorized && (<li>the client is asking you to confirm previously given authorization</li>)}

        {newScopes.size && (
          <React.Fragment>
            <li>Scopes:</li>
            <ul>
              {newScopes.map((scope) => (<li>{scope}</li>))}
            </ul>
          </React.Fragment>
        )}

        {newClaims.size && (
          <React.Fragment>
            <li>Claims:</li>
            <ul>
              {newClaims.map((claim) => (<li>{claim}</li>))}
            </ul>
          </React.Fragment>
        )}

        {params.scope && params.scope.includes('offline_access') && (
          <li>the client {client.clientName} is asking to have offline access to this authorization
            {!details.scopes.new.includes('offline_access') && (<React.Fragment>(which you've previously granted)</React.Fragment>)}
          </li>
        )}
      </ul>

      <form autocomplete="off" action={`/interaction/${uid}/confirm`} method="post">
        <button autofocus type="submit" class="login login-submit">Continue</button>
      </form>

      <div class="login-help">
        <a href={`/interaction/${uid}/abort`}>[ Cancel ]</a>
        {client.tosUri && (<a href={client.tosUri}>[ Terms of Service ]</a>)}
        {client.policyUri && (<a href={client.policyUri}>[ Privacy Policy ]</a>)}
      </div>
    </div>
  );
}
