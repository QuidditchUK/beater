export default function Login({
  title, flash, uid, params, client,
}) {
  return (
      <div class="login-card">
        <h1>{title}</h1>
        {flash && (<p>{flash}</p>)}

        <form autocomplete="off" action={`/interaction/${uid}/login`} method="post">
          <input required type="email" name="email" placeholder="Enter an email" autofocus={!params.login_hint} value={params.login_hint} />
          <input required type="password" name="password" placeholder="password" autoFocus={params.login_hint} />
          <button type="submit" class="login login-submit">Sign-in</button>
        </form>

        <div class="login-help">
          <a href={`/interaction/${uid}/abort`}>[ Cancel ]</a>
          {client.tosUri && (<a href={client.tosUri}>[ Terms of Service ]</a>)}
          {client.policyUri && (<a href={client.policyUri}>[ Privacy Policy ]</a>)}
        </div>
      </div>
  );
}
