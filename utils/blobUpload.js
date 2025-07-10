const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol, StorageSharedKeyCredential } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.AZURE_BLOB_CONTAINER;

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

// Extract account name and key for signing SAS
const extractCredentials = () => {
  const matches = AZURE_STORAGE_CONNECTION_STRING.match(/AccountName=(.*?);.*AccountKey=(.*?);/);
  return {
    accountName: matches[1],
    accountKey: matches[2]
  };
};

exports.uploadBase64Image = async (base64Data) => {
  // If caller omitted the data URI prefix, default to png
  if (!base64Data.startsWith('data:')) {
    base64Data = `data:image/png;base64,${base64Data.trim()}`;
  }

  const matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid base64 image format');

  const extension = matches[1].split('/')[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const blobName = `${uuidv4()}.${extension}`;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  // Upload image to private container
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: `image/${extension}` },
  });

  // Generate a SAS token to read the image
  const { accountName, accountKey } = extractCredentials();
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

  const sasToken = generateBlobSASQueryParameters({
    containerName: CONTAINER_NAME,
    blobName,
    permissions: BlobSASPermissions.parse('r'),
    startsOn: new Date(),
    expiresOn: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    protocol: SASProtocol.Https
  }, sharedKeyCredential).toString();

  const signedUrl = `${blockBlobClient.url}?${sasToken}`;
  return signedUrl;
};
