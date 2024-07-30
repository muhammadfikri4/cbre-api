# Snowflake CBRE

## How to configure P8 Key
```
// Private Key
openssl genrsa 2048 | openssl pkcs8 -topk8 -inform PEM -out rsa_key.p8 -nocrypt

// Public Key
openssl rsa -in rsa_key.p8 -pubout -out rsa_key.pub
```

## Configure Snowflake User Authentication
```
-- ALTER USER FERDINAND SET RSA_PUBLIC_KEY = '<public-key>';
-- DESCRIBE USER FERDINAND;
```

## Install required packages
```
npm install \
	snowflake-sdk \
	crypto \
	fs

npm install -g nodemon
```

## Run server
```
nodemon server.js
```


