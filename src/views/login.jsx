import './reset.scss';
import './fonts.scss';
import './global.scss';

export default function Login({
  title, flash, uid, params, client,
}) {
  return (
    <div className="container">
      <div className="login">
        <div className="logo">
          <img src="/images/logo.png" alt="Quidditch UK" height="45px" width="45px" />
        </div>
        <h1>{title}</h1>
        <h2>To continue to {client.clientName}</h2>
        {flash && (<p className="error">{flash}</p>)}

        <form autoComplete="off" action={`/interaction/${uid}/login`} method="post">
          <div className="form">
            <label htmlFor="email">Email Address</label>
            <input required type="email" name="email" placeholder="Your email address" autoFocus={!params.login_hint} value={params.login_hint} />
            <label htmlFor="password">Password</label>
            <input required type="password" name="password" placeholder="Password" autoFocus={params.login_hint} />
          </div>
          <button type="submit" className="login-submit">Sign in</button>
        </form>

        <div className="login-help">
          {/* <a href={`/interaction/${uid}/abort`}>[ Cancel ]</a> */}
          {client.tosUri && (<a href={client.tosUri}>[ Terms of Service ]</a>)}
          {client.policyUri && (<a href={client.policyUri}>[ Privacy Policy ]</a>)}
        </div>
      </div>
    </div>
  );
}
