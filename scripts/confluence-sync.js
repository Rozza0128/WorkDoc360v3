import axios from 'axios';
import fs from 'fs';
import path from 'path';

class ConfluenceSync {
  constructor(config) {
    this.baseUrl = config.baseUrl;
    this.auth = config.auth;
    this.spaceKey = config.spaceKey;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Basic ${Buffer.from(this.auth).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async createPage(title, content, parentId = null) {
    const pageData = {
      type: 'page',
      title: title,
      space: { key: this.spaceKey },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      }
    };

    if (parentId) {
      pageData.ancestors = [{ id: parentId }];
    }

    try {
      const response = await this.client.post('/rest/api/content', pageData);
      console.log(`Created page: ${title} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      console.error(`Failed to create page ${title}:`, error.response?.data);
      throw error;
    }
  }

  async updatePage(pageId, title, content, version) {
    const pageData = {
      id: pageId,
      type: 'page',
      title: title,
      space: { key: this.spaceKey },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      },
      version: { number: version + 1 }
    };

    try {
      const response = await this.client.put(`/rest/api/content/${pageId}`, pageData);
      console.log(`Updated page: ${title} (Version: ${response.data.version.number})`);
      return response.data;
    } catch (error) {
      console.error(`Failed to update page ${title}:`, error.response?.data);
      throw error;
    }
  }

  async syncMarkdownFile(filePath, parentId = null) {
    const content = fs.readFileSync(filePath, 'utf8');
    const title = path.basename(filePath, '.md').replace(/_/g, ' ');
    
    // Convert markdown to Confluence storage format
    const confluenceContent = this.markdownToConfluence(content);
    
    // Check if page exists
    const existingPage = await this.findPageByTitle(title);
    
    if (existingPage) {
      return await this.updatePage(
        existingPage.id, 
        title, 
        confluenceContent, 
        existingPage.version.number
      );
    } else {
      return await this.createPage(title, confluenceContent, parentId);
    }
  }

  async findPageByTitle(title) {
    try {
      const response = await this.client.get('/rest/api/content', {
        params: {
          spaceKey: this.spaceKey,
          title: title,
          expand: 'version'
        }
      });
      return response.data.results[0] || null;
    } catch (error) {
      console.error(`Failed to find page ${title}:`, error.response?.data);
      return null;
    }
  }

  markdownToConfluence(markdown) {
    // Basic markdown to Confluence conversion
    let confluence = markdown
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Code blocks
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">$1</ac:parameter><ac:plain-text-body><![CDATA[$2]]></ac:plain-text-body></ac:structured-macro>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold and italic
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Lists
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    // Wrap list items
    confluence = confluence.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    return confluence;
  }

  async testConnection() {
    try {
      const response = await this.client.get('/rest/api/space', {
        params: { spaceKey: this.spaceKey }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Check your email and API token.');
      } else if (error.response?.status === 404) {
        throw new Error(`Space '${this.spaceKey}' not found. Check your space key.`);
      }
      throw error;
    }
  }

  async createOrUpdatePage(title, content, parentId = null) {
    const existingPage = await this.findPageByTitle(title);
    
    if (existingPage) {
      return await this.updatePage(
        existingPage.id, 
        title, 
        content, 
        existingPage.version.number
      );
    } else {
      return await this.createPage(title, content, parentId);
    }
  }

  async syncAllDocumentation() {
    const docs = [
      { file: 'README.md', title: 'WorkDoc360 Overview' },
      { file: 'replit.md', title: 'Technical Architecture' },
      { file: 'CONFLUENCE_BACKUP_GUIDE.md', title: 'System Backup Guide' },
      { file: 'CONFLUENCE_INTEGRATION.md', title: 'Confluence Integration' },
      { file: 'CSCS_INTEGRATION_GUIDE.md', title: 'CSCS Integration Guide' },
      { file: 'DOMAIN_SETUP_GUIDE.md', title: 'Domain Setup Guide' },
      { file: 'MOBILE_APP_GUIDE.md', title: 'Mobile App Integration' }
    ];

    for (const doc of docs) {
      if (fs.existsSync(doc.file)) {
        await this.syncMarkdownFile(doc.file);
      }
    }
  }
}

export default ConfluenceSync;