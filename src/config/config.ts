import dotenv from "dotenv";

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",

  port: Number(process.env.PORT) || 5000,

  apiPrefix: process.env.API_PREFIX || "/api",

  mongodb: {
    uri: process.env.MONGODB_URI!,
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN!,
  },

 firebase: {
  type: process.env.FireBase_project_type!,
  projectId: process.env.FireBase_project_id!,
  privateKeyId: process.env.FireBase_private_key_id!,
  privateKey: process.env.FireBase_private_key!,
  clientEmail: process.env.Firebase_client_email!,
  clientId: process.env.FireBase_client_id!,
  authUri: process.env.FireBase_auth_uri!,
  tokenUri: process.env.FireBase_token_uri!,
  authProviderX509CertUrl:
    process.env.Firebase_auth_provider_x509_cert_url!,
  clientX509CertUrl:
    process.env.Firebase_client_x509_cert_url!,
  universeDomain:
    process.env.Firebase_universe_domain!,
},
};