# WorkDoc360 Document Storage Architecture
## Master Record List (MRL) Strategy

### Current Issues
- All documents stored in PostgreSQL database
- Frontend performance bottleneck loading all company documents
- No file separation between customers
- Security concerns with shared storage

### Recommended Solution: Customer-Specific Object Storage

#### 1. Object Storage Structure
```
WorkDoc360-Bucket/
├── customers/
│   ├── company-17-plastermaster/
│   │   ├── generated-documents/
│   │   │   ├── risk-assessments/
│   │   │   ├── method-statements/
│   │   │   ├── toolbox-talks/
│   │   │   └── iso-9001/
│   │   ├── uploaded-documents/
│   │   │   ├── cscs-cards/
│   │   │   ├── certificates/
│   │   │   └── photos/
│   │   └── templates/
│   │       ├── company-branded/
│   │       └── master-copies/
│   └── company-18-robbson/
│       ├── generated-documents/
│       ├── uploaded-documents/
│       └── templates/
└── master-templates/
    ├── iso-9001-base/
    ├── hse-templates/
    └── trade-specific/
```

#### 2. Database Schema Changes
- Keep `generatedDocuments` table for metadata only
- Add `objectStoragePath` field instead of storing content
- Add `companyStorageQuota` to companies table
- Index by companyId for fast retrieval

#### 3. Performance Benefits
- **Faster Frontend**: Only load document metadata, not content
- **Isolated Storage**: Each customer has private object storage area
- **Scalable**: Unlimited document storage without database bloat
- **CDN Ready**: Object storage supports global content delivery

#### 4. Security Benefits
- **Customer Isolation**: Complete separation of company documents
- **Access Control**: Per-company permissions and API keys
- **Audit Trail**: Track all document access by customer
- **Backup Strategy**: Independent backups per customer

#### 5. Implementation Plan
Phase 1: Setup Google Cloud Storage buckets
Phase 2: Migrate existing documents to object storage
Phase 3: Update frontend to use presigned URLs
Phase 4: Implement customer-specific storage quotas

### Technical Implementation

#### Object Storage Service
```typescript
class CustomerDocumentStorage {
  private getCustomerPath(companyId: number): string {
    return `customers/company-${companyId}-${slugify(companyName)}/`;
  }
  
  async storeDocument(companyId: number, document: Buffer, type: string): Promise<string> {
    const path = `${this.getCustomerPath(companyId)}generated-documents/${type}/`;
    return await this.uploadToStorage(path, document);
  }
  
  async getCustomerDocuments(companyId: number): Promise<DocumentMetadata[]> {
    // Only return metadata, not file content
    return await db.select().from(generatedDocuments).where(eq(generatedDocuments.companyId, companyId));
  }
}
```

#### Frontend Performance
- Load document lists via paginated API
- Use lazy loading for document previews
- Cache document metadata in localStorage
- Implement search/filter on backend

### Cost Analysis
- **Object Storage**: £0.02 per GB per month
- **Data Transfer**: £0.12 per GB
- **API Calls**: £0.004 per 1,000 requests
- **Estimated Cost**: £5-15/month per customer with heavy usage

### Migration Strategy
1. **Setup object storage** with customer directories
2. **Migrate existing documents** company by company
3. **Update API endpoints** to use object storage
4. **Frontend updates** for new document URLs
5. **Performance testing** and optimization

This architecture ensures each customer has their own "FTP area" equivalent, preventing performance issues and maintaining security isolation.