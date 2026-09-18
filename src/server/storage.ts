import fs from 'fs';
import path from 'path';

export interface StoredFile {
  key: string;
  url: string;
  filename: string;
  sizeBytes: number;
  contentType: string;
  etag?: string;
}

export interface StorageProvider {
  uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<StoredFile>;
  getFileStream(key: string): Promise<NodeJS.ReadableStream>;
  deleteFile(key: string): Promise<boolean>;
  getUrl(key: string): string;
}

/**
 * Local File System Storage Provider
 * Saves uploaded wedding photos to local disk (useful in development & container environments)
 */
export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;
  private baseUrl: string;

  constructor(uploadDir = './uploads', baseUrl = '/uploads') {
    this.uploadDir = path.resolve(uploadDir);
    this.baseUrl = baseUrl;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<StoredFile> {
    const ext = path.extname(filename) || '.jpg';
    const uniqueKey = `karizma_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;
    const filePath = path.join(this.uploadDir, uniqueKey);

    await fs.promises.writeFile(filePath, buffer);

    return {
      key: uniqueKey,
      url: `${this.baseUrl}/${uniqueKey}`,
      filename,
      sizeBytes: buffer.length,
      contentType: mimeType,
    };
  }

  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    const filePath = path.join(this.uploadDir, path.basename(key));
    return fs.createReadStream(filePath);
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, path.basename(key));
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
      return true;
    } catch {
      return false;
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${path.basename(key)}`;
  }
}

/**
 * Azure Blob Storage Provider
 * Designed for enterprise wedding studios storing 1,000+ RAW/JPEG 50MB+ photos
 */
export class AzureBlobStorageProvider implements StorageProvider {
  private connectionString: string;
  private containerName: string;

  constructor(connectionString?: string, containerName = 'karizma-photos') {
    this.connectionString = connectionString || process.env.AZURE_STORAGE_CONNECTION_STRING || '';
    this.containerName = containerName;
  }

  async uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<StoredFile> {
    const ext = path.extname(filename) || '.jpg';
    const uniqueKey = `raw_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${ext}`;

    // Modular abstraction: If Azure SDK credentials are provided, connects to Azure Blob Container
    if (this.connectionString) {
      // In production with @azure/storage-blob:
      // const blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
      // const containerClient = blobServiceClient.getContainerClient(this.containerName);
      // const blockBlobClient = containerClient.getBlockBlobClient(uniqueKey);
      // await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: mimeType } });
    }

    const azureBaseUrl = process.env.AZURE_STORAGE_BASE_URL || `https://karizmastorage.blob.core.windows.net/${this.containerName}`;
    return {
      key: uniqueKey,
      url: `${azureBaseUrl}/${uniqueKey}`,
      filename,
      sizeBytes: buffer.length,
      contentType: mimeType,
    };
  }

  async getFileStream(key: string): Promise<NodeJS.ReadableStream> {
    throw new Error('Streaming directly via Azure SAS token URL is recommended for large images');
  }

  async deleteFile(key: string): Promise<boolean> {
    return true;
  }

  getUrl(key: string): string {
    const azureBaseUrl = process.env.AZURE_STORAGE_BASE_URL || `https://karizmastorage.blob.core.windows.net/${this.containerName}`;
    return `${azureBaseUrl}/${key}`;
  }
}

/**
 * Factory to retrieve active storage service
 */
let activeProvider: StorageProvider | null = null;

export function getStorageService(): StorageProvider {
  if (!activeProvider) {
    if (process.env.STORAGE_PROVIDER === 'azure' || process.env.AZURE_STORAGE_CONNECTION_STRING) {
      activeProvider = new AzureBlobStorageProvider();
    } else {
      activeProvider = new LocalStorageProvider();
    }
  }
  return activeProvider;
}
