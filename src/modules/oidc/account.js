import { parse } from 'date-fns';
import { readOne, checkPassword } from '../../models/users';
import { getClub } from '../../models/clubs';
import { getUserProducts } from '../../models/products';

// class Account {
const Account = {
  // This interface is required by oidc-provider
  findAccount: async (ctx, id) => {
    // This would ideally be just a check whether the account is still in your storage
    const account = await readOne('uuid', id);

    if (!account) {
      return undefined;
    }

    let club;

    if (account.club_uuid) {
      club = await getClub(account.club_uuid);
    }

    const products = await getUserProducts(id);

    const currentMembership = Boolean(products.filter((product) => new Date() < parse(product?.metadata?.expires, 'dd-MM-yyyy', new Date())).length);

    return {
      accountId: id,
      // and this claims() method would actually query to retrieve the account claims
      async claims() {
        return {
          sub: id,
          email: account.email,
          name: account.first_name,
          family_name: account.last_name,
          profile: {
            club: club ? { name: club?.name, slug: club?.slug } : null,
            quk_current_membership: currentMembership,
          },
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
