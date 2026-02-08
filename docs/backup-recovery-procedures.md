# Backup and Recovery Procedures for KN Biosciences

## Overview
This document outlines the backup and recovery procedures for the KN Biosciences e-commerce platform. It covers data backup strategies, disaster recovery plans, and operational procedures to ensure business continuity.

## Data Backup Strategy

### 1. Database Backup (Supabase/PostgreSQL)

#### Automated Daily Backups
```bash
#!/bin/bash
# daily-backup.sh
# Daily backup script for Supabase PostgreSQL database

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/db"
DB_NAME="kn_biosciences"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform the backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --no-password > $BACKUP_DIR/db_backup_$DATE.sql

# Compress the backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_backup_$DATE.sql.gz"
```

#### Weekly Full Backups
```bash
#!/bin/bash
# weekly-full-backup.sh
# Weekly full backup with retention policy

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/full"
RETENTION_DAYS=90

mkdir -p $BACKUP_DIR

# Full database backup
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --no-password --verbose > $BACKUP_DIR/full_backup_$DATE.sql

# Also backup database schema separately
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME --no-password --schema-only > $BACKUP_DIR/schema_backup_$DATE.sql

# Compress both files
gzip $BACKUP_DIR/full_backup_$DATE.sql
gzip $BACKUP_DIR/schema_backup_$DATE.sql

# Remove backups older than retention period
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Weekly full backup completed"
```

#### Supabase Backup Configuration
```sql
-- Enable WAL archiving for point-in-time recovery
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET archive_mode = on;
ALTER SYSTEM SET archive_command = 'cp %p /backup/wal/%f';

-- Configure backup settings
ALTER SYSTEM SET max_wal_senders = 3;
ALTER SYSTEM SET wal_keep_segments = 8;
```

### 2. File Storage Backup (Supabase Storage)

```typescript
// backup-storage.ts
import { StorageClient } from '@supabase/storage-js';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class StorageBackup {
  private storage: StorageClient;
  private backupDir: string;

  constructor() {
    this.storage = new StorageClient(
      process.env.SUPABASE_URL!,
      { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` }
    );
    this.backupDir = '/backups/storage';
  }

  async backupBucket(bucketName: string): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const backupPath = path.join(this.backupDir, bucketName, date);
    
    // Create backup directory
    if (!fs.existsSync(backupPath)) {
      fs.mkdirSync(backupPath, { recursive: true });
    }

    try {
      // List all files in the bucket
      const { data, error } = await this.storage.from(bucketName).list('', {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      });

      if (error) throw error;

      // Download each file
      for (const file of data!) {
        const filePath = path.join(backupPath, file.name);
        const { data: fileData, error: fileError } = await this.storage
          .from(bucketName)
          .download(file.name);

        if (fileError) {
          console.error(`Error downloading ${file.name}:`, fileError);
          continue;
        }

        // Write file to backup location
        const buffer = await fileData.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(buffer));
      }

      console.log(`Backup of bucket ${bucketName} completed to ${backupPath}`);
    } catch (error) {
      console.error(`Error backing up bucket ${bucketName}:`, error);
      throw error;
    }
  }

  async restoreBucket(bucketName: string, backupDate: string): Promise<void> {
    const backupPath = path.join(this.backupDir, bucketName, backupDate);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup path does not exist: ${backupPath}`);
    }

    const files = fs.readdirSync(backupPath);

    for (const fileName of files) {
      const filePath = path.join(backupPath, fileName);
      const fileContent = fs.readFileSync(filePath);

      const { error } = await this.storage
        .from(bucketName)
        .upload(fileName, fileContent, {
          upsert: true
        });

      if (error) {
        console.error(`Error restoring ${fileName}:`, error);
        continue;
      }
    }

    console.log(`Restore of bucket ${bucketName} from ${backupDate} completed`);
  }

  async cleanupOldBackups(retentionDays: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const buckets = fs.readdirSync(this.backupDir);
    
    for (const bucket of buckets) {
      const bucketPath = path.join(this.backupDir, bucket);
      const dates = fs.readdirSync(bucketPath);
      
      for (const date of dates) {
        const dateObj = new Date(date);
        if (dateObj < cutoffDate) {
          const backupToRemove = path.join(bucketPath, date);
          fs.rmSync(backupToRemove, { recursive: true, force: true });
          console.log(`Removed old backup: ${backupToRemove}`);
        }
      }
    }
  }
}

export default StorageBackup;
```

### 3. Application Code Backup

```bash
#!/bin/bash
# backup-application.sh
# Backup application code and configurations

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/application"
APP_DIR="/app"
CONFIG_DIR="/etc/app-config"

mkdir -p $BACKUP_DIR

# Create application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz -C $APP_DIR .

# Create configuration backup
if [ -d "$CONFIG_DIR" ]; then
  tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz -C $CONFIG_DIR .
fi

# Create environment variables backup (securely)
if [ -f "$APP_DIR/.env.production" ]; then
  # Encrypt the environment file
  gpg --symmetric --cipher-algo AES256 --output $BACKUP_DIR/env_backup_$DATE.gpg $APP_DIR/.env.production
fi

# Remove backups older than 30 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
find $BACKUP_DIR -name "*.gpg" -mtime +30 -delete

echo "Application backup completed"
```

### 4. Cron Jobs for Automated Backups

```bash
# Add to crontab: crontab -e

# Daily database backup at 2 AM
0 2 * * * /app/scripts/daily-backup.sh >> /var/log/backup.log 2>&1

# Weekly full backup on Sundays at 3 AM
0 3 * * 0 /app/scripts/weekly-full-backup.sh >> /var/log/full-backup.log 2>&1

# Daily file storage backup at 4 AM
0 4 * * * cd /app && npx ts-node scripts/backup-storage.ts >> /var/log/storage-backup.log 2>&1

# Daily application backup at 5 AM
0 5 * * * /app/scripts/backup-application.sh >> /var/log/app-backup.log 2>&1

# Weekly cleanup of old backups on Saturdays at 1 AM
0 1 * * 6 find /backups -name "*.gz" -mtime +30 -delete >> /var/log/cleanup.log 2>&1
```

## Disaster Recovery Plan

### 1. Recovery Procedures

#### Database Recovery
```bash
#!/bin/bash
# recover-database.sh
# Database recovery script

RESTORE_DATE=$1
BACKUP_DIR="/backups/db"

if [ -z "$RESTORE_DATE" ]; then
  echo "Usage: $0 <restore_date>"
  echo "Example: $0 20231201_120000"
  exit 1
fi

BACKUP_FILE="$BACKUP_DIR/db_backup_$RESTORE_DATE.sql.gz"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring database from $BACKUP_FILE..."

# Stop the application
systemctl stop kn-biosciences-app

# Drop and recreate the database
dropdb -U postgres kn_biosciences
createdb -U postgres -O postgres kn_biosciences

# Restore the database
gunzip -c $BACKUP_FILE | psql -U postgres -d kn_biosciences

# Restart the application
systemctl start kn-biosciences-app

echo "Database recovery completed"
```

#### File Storage Recovery
```typescript
// recovery-storage.ts
import StorageBackup from './backup-storage';

async function performStorageRecovery(bucketName: string, backupDate: string) {
  const backupManager = new StorageBackup();
  
  try {
    console.log(`Starting recovery of bucket: ${bucketName} from date: ${backupDate}`);
    
    await backupManager.restoreBucket(bucketName, backupDate);
    
    console.log(`Recovery of bucket ${bucketName} completed successfully`);
  } catch (error) {
    console.error('Storage recovery failed:', error);
    throw error;
  }
}

// Usage
if (require.main === module) {
  const bucketName = process.argv[2];
  const backupDate = process.argv[3];
  
  if (!bucketName || !backupDate) {
    console.error('Usage: npx ts-node recovery-storage.ts <bucket-name> <backup-date>');
    process.exit(1);
  }
  
  performStorageRecovery(bucketName, backupDate)
    .catch(err => {
      console.error('Recovery process failed:', err);
      process.exit(1);
    });
}
```

### 2. Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO)

| Component | RTO | RPO | Backup Frequency |
|-----------|-----|-----|------------------|
| Database | 4 hours | 1 hour | Every hour |
| File Storage | 8 hours | 24 hours | Daily |
| Application Code | 1 hour | 15 minutes | Continuous (Git) |
| Configuration | 1 hour | 15 minutes | Continuous (Git) |

### 3. Backup Verification

```typescript
// backup-verifier.ts
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class BackupVerifier {
  async verifyDatabaseBackup(backupFilePath: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Check if file exists and has content
      if (!fs.existsSync(backupFilePath)) {
        reject(new Error(`Backup file does not exist: ${backupFilePath}`));
        return;
      }

      const stats = fs.statSync(backupFilePath);
      if (stats.size === 0) {
        reject(new Error(`Backup file is empty: ${backupFilePath}`));
        return;
      }

      // Attempt to decompress if it's gzipped
      if (backupFilePath.endsWith('.gz')) {
        const gunzip = spawn('gunzip', ['-t', backupFilePath]);
        
        gunzip.on('close', (code) => {
          if (code === 0) {
            console.log(`Database backup ${backupFilePath} is valid`);
            resolve(true);
          } else {
            reject(new Error(`Database backup ${backupFilePath} is corrupted`));
          }
        });
      } else {
        // For non-gzipped files, just check if it's a valid SQL dump
        const content = fs.readFileSync(backupFilePath, 'utf-8');
        if (content.includes('PostgreSQL database dump')) {
          console.log(`Database backup ${backupFilePath} appears valid`);
          resolve(true);
        } else {
          reject(new Error(`Database backup ${backupFilePath} does not appear to be a valid SQL dump`));
        }
      }
    });
  }

  async verifyStorageBackup(backupDir: string): Promise<boolean> {
    if (!fs.existsSync(backupDir)) {
      throw new Error(`Storage backup directory does not exist: ${backupDir}`);
    }

    const files = fs.readdirSync(backupDir);
    if (files.length === 0) {
      throw new Error(`Storage backup directory is empty: ${backupDir}`);
    }

    console.log(`Storage backup directory ${backupDir} contains ${files.length} files`);
    return true;
  }

  async verifyApplicationBackup(backupFilePath: string): Promise<boolean> {
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Application backup file does not exist: ${backupFilePath}`);
    }

    const stats = fs.statSync(backupFilePath);
    if (stats.size === 0) {
      throw new Error(`Application backup file is empty: ${backupFilePath}`);
    }

    // Try to untar the backup to verify it's valid
    const tar = spawn('tar', ['-tf', backupFilePath]);
    let isValid = false;

    tar.on('close', (code) => {
      if (code === 0) {
        isValid = true;
      }
    });

    // Wait a bit for the process to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (isValid) {
      console.log(`Application backup ${backupFilePath} is valid`);
      return true;
    } else {
      throw new Error(`Application backup ${backupFilePath} is corrupted`);
    }
  }

  async runVerification(): Promise<void> {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const backupDir = '/backups';
    
    try {
      // Verify database backup
      const dbBackupFile = path.join(backupDir, 'db', `db_backup_${today}_020000.sql.gz`);
      await this.verifyDatabaseBackup(dbBackupFile);
      
      // Verify storage backup
      const storageBackupDir = path.join(backupDir, 'storage', 'public', today);
      await this.verifyStorageBackup(storageBackupDir);
      
      // Verify application backup
      const appBackupFile = path.join(backupDir, 'application', `app_backup_${today}_050000.tar.gz`);
      await this.verifyApplicationBackup(appBackupFile);
      
      console.log('All backups verified successfully');
    } catch (error) {
      console.error('Backup verification failed:', error);
      throw error;
    }
  }
}

export default BackupVerifier;
```

### 4. Backup Monitoring and Alerts

```typescript
// backup-monitor.ts
import { createTransport } from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface BackupStatus {
  timestamp: Date;
  database: boolean;
  storage: boolean;
  application: boolean;
  errors: string[];
}

class BackupMonitor {
  private transporter: any;
  private adminEmail: string;

  constructor(adminEmail: string) {
    this.adminEmail = adminEmail;
    
    this.transporter = createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async checkBackupStatus(): Promise<BackupStatus> {
    const now = new Date();
    const today = now.toISOString().split('T')[0].replace(/-/g, '');
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0].replace(/-/g, '');
    
    const status: BackupStatus = {
      timestamp: now,
      database: false,
      storage: false,
      application: false,
      errors: []
    };

    // Check database backup
    const dbBackupPath = path.join('/backups/db', `db_backup_${today}_020000.sql.gz`);
    if (fs.existsSync(dbBackupPath)) {
      status.database = true;
    } else {
      status.errors.push(`Database backup missing: ${dbBackupPath}`);
    }

    // Check storage backup
    const storageBackupPath = path.join('/backups/storage/public', today);
    if (fs.existsSync(storageBackupPath)) {
      status.storage = true;
    } else {
      status.errors.push(`Storage backup missing: ${storageBackupPath}`);
    }

    // Check application backup
    const appBackupPath = path.join('/backups/application', `app_backup_${today}_050000.tar.gz`);
    if (fs.existsSync(appBackupPath)) {
      status.application = true;
    } else {
      status.errors.push(`Application backup missing: ${appBackupPath}`);
    }

    return status;
  }

  async sendAlert(subject: string, message: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: this.adminEmail,
      subject,
      text: message
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Alert email sent successfully');
    } catch (error) {
      console.error('Failed to send alert email:', error);
    }
  }

  async runDailyCheck(): Promise<void> {
    try {
      const status = await this.checkBackupStatus();
      
      if (status.errors.length > 0) {
        await this.sendAlert(
          'Backup Failure Alert',
          `Backup failures detected:\n\n${status.errors.join('\n')}\n\nTimestamp: ${status.timestamp}`
        );
      } else {
        console.log('All backups are up to date');
      }
    } catch (error) {
      console.error('Error during backup check:', error);
      await this.sendAlert(
        'Backup Monitoring Error',
        `Error occurred during backup monitoring: ${error}`
      );
    }
  }
}

export default BackupMonitor;
```

### 5. Backup Security

```bash
# backup-security.sh
# Security measures for backups

# Encrypt sensitive backup files
gpg --symmetric --cipher-algo AES256 --output /backups/encrypted/env_backup_$(date +%Y%m%d).gpg /tmp/env_vars

# Set proper permissions on backup directories
chmod 700 /backups
find /backups -type f -exec chmod 600 {} \;
find /backups -type d -exec chmod 700 {} \;

# Rotate encryption keys periodically
# Store keys in a secure key management system (like HashiCorp Vault or AWS KMS)
```

## Testing Procedures

### 1. Backup Restoration Testing

Regular restoration tests should be performed quarterly:

1. Select a backup from 30 days ago
2. Restore to a test environment
3. Verify data integrity
4. Document the process and time taken
5. Update procedures if necessary

### 2. Disaster Simulation

Annually, conduct a full disaster simulation:
1. Simulate complete system failure
2. Execute recovery procedures
3. Measure RTO and RPO achievement
4. Document lessons learned
5. Update disaster recovery plan

## Compliance and Audit

### 1. Backup Retention Policy
- Daily backups: 30 days
- Weekly backups: 90 days
- Monthly backups: 1 year
- Yearly backups: 7 years (for compliance)

### 2. Audit Trail
Maintain logs of all backup and recovery activities for audit purposes:
- Who performed the backup/recovery
- When it was performed
- What was backed up/restored
- Success/failure status
- Any issues encountered

This backup and recovery procedure ensures that the KN Biosciences platform maintains high availability and data integrity, meeting business continuity requirements while following security best practices.