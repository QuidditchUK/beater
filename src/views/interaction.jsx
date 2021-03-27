import './reset.scss';
import './fonts.scss';
import './global.scss';

const SCOPES = {
  profile: {
    label: 'Your Profile information',
    claims: ['Preferred first name', 'Preferred last name', 'Current club', 'Current QUK Membership'],
  },
  email: {
    label: 'Your Email Address',
  },
};

export default function Interaction({
  details,
  title,
  client,
  // params,
  uid,
}) {
  const newScopes = details.scopes.new.filter((scope) => scope !== 'openid').map((scope) => SCOPES[scope]);

  const previouslyAuthorized = [details.scopes.new, details.claims.new].every(({ length }) => length === 0);
  const newClaims = new Set(details.claims.new);
  ['sub', 'sid', 'auth_time', 'acr', 'amr', 'iss'].forEach(Set.prototype.delete.bind(newClaims));

  return (
    <div className="container">
      <div className="login">
        <div className="logo">
          <img src="/images/logo.png" alt="Quidditch UK" height="45px" width="45px" />{' '}
          <span className="heavy-plus">+</span>{' '}
          {client.logoUri && (
            <img src={client.logoUri} height="45px" width="45px" alt={client.clientName} />
          )}
        </div>

        <h1>{title}</h1>
        <h2>{client.clientName} would like access to the following information from QuidditchUK:</h2>

        {previouslyAuthorized && (<div className="label">{client.clientName} is asking you to confirm a previously given authorization</div>)}

        {newScopes.length !== 0 && (
          <ul className="scope-list">
            {newScopes.map((scope) => (
              <React.Fragment key={scope.label}>
                <li className="label">{scope.label}</li>

                {scope.claims && (
                  <ul className="claim-list">
                    {scope.claims.map((claim) => (<li className="claim" key={claim}>{claim}</li>))}
                  </ul>
                )}
              </React.Fragment>
            ))}
          </ul>
        )}

        {newClaims.size !== 0 && (
          <React.Fragment>
            <li>Claims:</li>
            <ul>
              {newClaims.forEach((claim) => (<li>{claim}</li>))}
            </ul>
          </React.Fragment>
        )}

        <div className="flex-buttons">
          <form autoComplete="off" action={`/interaction/${uid}/confirm`} method="post">
            <button autoFocus type="submit" className="login login-submit">Approve</button>
          </form>

          <a href={`/interaction/${uid}/abort`}>
            <button type="button" className="login login-decline">Decline</button>
          </a>
        </div>

        <div className="login-help">
          {client.tosUri && (<a href={client.tosUri}>[ Terms of Service ]</a>)}
          {client.policyUri && (<a href={client.policyUri}>[ Privacy Policy ]</a>)}
        </div>
      </div>
      </div>
  );
}
