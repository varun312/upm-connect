const { MongoClient } = require("mongodb");
const { ClientEncryption } = require("mongodb-client-encryption");

async function createKeys() {
  const uri = "mongodb+srv://kevin:kevinn@cw.ppcfx.mongodb.net/upm-connect";
  const client = new MongoClient(uri);
  await client.connect();

  var encryption = new ClientEncryption(
    client,
    {
      keyVaultNamespace: "encryption.__keyVault",
      kmsProviders: {
        local: { key: Buffer.from(require("fs").readFileSync("master-key.txt")) },
      },
    }
  );

  const keyId = await encryption.createDataKey("local");
  console.log("DataKeyId:", keyId.toString("base64"));

  await client.close();
}
createKeys();