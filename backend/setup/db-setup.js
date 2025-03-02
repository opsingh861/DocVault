import fs from 'fs/promises';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const dbFile = path.resolve('mydb.db'); 
const sqlFile = path.resolve('./setup/db.sql');

async function migrateDatabase() {
    try {
        console.log('Migration script started...');

        // Open database
        const db = await open({
            filename: dbFile,
            driver: sqlite3.Database
        });
        console.log('Connected to SQLite database.');

        // Enable foreign key constraints
        console.log('Enabling foreign keys...');
        await db.exec('PRAGMA foreign_keys = ON;');

        // Read SQL schema from file
        console.log('Reading SQL schema file...');
        const sql = await fs.readFile(sqlFile, 'utf8');

        // Execute SQL queries
        console.log('Executing SQL schema...');
        await db.exec(sql);
        console.log('Database schema migrated successfully!');

        // Close the database connection
        console.log('Closing database connection...');
        await db.close();
        console.log('Database connection closed.');
    } catch (error) {
        console.error('Error during migration:', error);
    }
}

// Run migration if executed directly
if (import.meta.url.endsWith('migrate.mjs')) {
    migrateDatabase();
}

// Export function for reuse in other modules
export { migrateDatabase };
