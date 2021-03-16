import './reset.scss';
import './fonts.scss';
import './global.scss';

export default function Interaction({
  details,
  title,
  client,
  // params,
  uid,
}) {
  // const isNewAuthorization = [
  //   details.scopes.accepted,
  //   details.scopes.rejected,
  //   details.claims.accepted,
  //   details.claims.rejected,
  // ].every(({ length }) => length === 0);

  const previouslyAuthorized = [details.scopes.new, details.claims.new].every(({ length }) => length === 0);
  const newScopes = details.scopes.new.filter((scope) => scope !== 'openid');

  const newClaims = new Set(details.claims.new);
  ['sub', 'sid', 'auth_time', 'acr', 'amr', 'iss'].forEach(Set.prototype.delete.bind(newClaims));

  return (
    <div className="container">
      <div className="login">
        <div className="logo">
          <img src="/images/logo.png" alt="Quidditch UK" height="45px" width="45px" />{' '}<span class="heavy-plus">+</span>{' '}{client.logoUri && (<img src={client.logoUri} height="45px" width="45px" alt={client.clientName} />)}
        </div>

        <h1>{title}</h1>
        <h2>{client.clientName} access to:</h2>

        <ul>
          {/* {isNewAuthorization && (<li>This is a new authorization</li>)} */}
          {previouslyAuthorized && (<li>the client is asking you to confirm previously given authorization</li>)}

          {newScopes.length !== 0 && (
            <React.Fragment>
              <li>Scopes:</li>
              <ul>
                {newScopes.map((scope) => (<li>{scope}</li>))}
              </ul>
            </React.Fragment>
          )}

          {newClaims.size !== 0 && (
            <React.Fragment>
              <li>Claims:</li>
              <ul>
                {newClaims.forEach((claim) => (<li>{claim}</li>))}
              </ul>
            </React.Fragment>
          )}

          {/* {params.scope && params.scope.includes('offline_access') && (
            <li>the client {client.clientName} is asking to have offline access to this authorization
              {!details.scopes.new.includes('offline_access') && (<React.Fragment>(which you've previously granted)</React.Fragment>)}
            </li>
          )} */}
        </ul>

        <form autocomplete="off" action={`/interaction/${uid}/confirm`} method="post">
          <button autofocus type="submit" className="login login-submit">Continue</button>
        </form>

        <div className="login-help">
          <a href={`/interaction/${uid}/abort`}>[ Cancel ]</a>
          {client.tosUri && (<a href={client.tosUri}>[ Terms of Service ]</a>)}
          {client.policyUri && (<a href={client.policyUri}>[ Privacy Policy ]</a>)}
        </div>
      </div>
      </div>
  );
}
