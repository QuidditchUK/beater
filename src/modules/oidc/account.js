import { readOne, checkPassword } from '../../models/users';

// class Account {
const Account = {
  // This interface is required by oidc-provider
  findAccount: async (ctx, id) => {
    // This would ideally be just a check whether the account is still in your storage
    const account = await readOne('uuid', id);
    if (!account) {
      return undefined;
    }

    return {
      accountId: id,
      // and this claims() method would actually query to retrieve the account claims
      async claims() {
        return {
          sub: id,
          email: account.email,
          name: account.first_name,
          family_name: account.last_name,
        };
      },
    };
  },

  // This can be anything you need to authenticate a user
  authenticate: async (email, password) => {
    try {
      const check = await checkPassword(email, password);

      if (check) {
        const { uuid } = await readOne('email', email);

        return uuid;
      }
    } catch (err) {
      return undefined;
    }

    return undefined;
  },
};

export default Account;
