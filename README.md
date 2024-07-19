# edge-cms

Goal: Build a simple CMS that could be hosted on cloudflare workers/pages.

# Secrets & wrangler.toml

Some deployment secrets are encrypted with sops and age.

## Encrypt

New secrets can be encrypted using just the public key:

```
sops --encrypt --age age1hwkvcnxc5220y0tzkw5esfm8p4fz5nacmhs6n8g5thsrvk49ddqqqxw3xy secrets.json
```

## Decrypt

Copy your private key `keys.txt` to `~/.config/sops/age/keys.txt`.

Then run:

```
sops --decrypt secrets.json
```

## Generate wrangler.toml

Make sure you install sops and add the private key such that the
`sops --decrypt secrets.json` command runs successfully.

Then run the generate command:

```
node scripts/generate-wrangler.js
```

If you run without sops set up it will still work but some values will be undefined.


## Wishlist

- tenants
- user sso
- can host posts for a blog, etc
- fix overlap API bug
