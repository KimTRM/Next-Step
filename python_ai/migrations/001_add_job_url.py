"""
Migration: Add job_url and job_source columns to jobs table.

This migration adds:
- job_url: URL to the actual job posting
- job_source: Source of the job (jobstreet, rapidapi, synthetic)
"""
import sqlite3
import sys
import os


def migrate(db_path='jobs.db'):
    """
    Add job_url and job_source columns to existing jobs table.

    Args:
        db_path: Path to SQLite database file
    """
    print(f"Running migration on database: {db_path}")

    # Check if database exists
    if not os.path.exists(db_path):
        print(f"Database {db_path} does not exist. No migration needed.")
        return True

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check current schema
        cursor.execute("PRAGMA table_info(jobs)")
        columns = [col[1] for col in cursor.fetchall()]
        print(f"Current columns: {', '.join(columns)}")

        # Add job_url column if it doesn't exist
        if 'job_url' not in columns:
            print("Adding job_url column...")
            cursor.execute('ALTER TABLE jobs ADD COLUMN job_url TEXT')
            print("[OK] Added job_url column")
        else:
            print("[OK] job_url column already exists")

        # Add job_source column if it doesn't exist
        if 'job_source' not in columns:
            print("Adding job_source column...")
            cursor.execute('ALTER TABLE jobs ADD COLUMN job_source TEXT DEFAULT "synthetic"')
            print("[OK] Added job_source column")
        else:
            print("[OK] job_source column already exists")

        # Update existing rows to have job_source = 'synthetic' if NULL
        cursor.execute("UPDATE jobs SET job_source = 'synthetic' WHERE job_source IS NULL")
        updated_rows = cursor.rowcount
        if updated_rows > 0:
            print(f"[OK] Updated {updated_rows} existing rows with job_source='synthetic'")

        conn.commit()
        conn.close()

        print("\n[SUCCESS] Migration completed successfully!")
        return True

    except sqlite3.Error as e:
        print(f"\n❌ Migration failed: {e}")
        return False


def rollback(db_path='jobs.db'):
    """
    Rollback migration (remove added columns).

    Note: SQLite doesn't support DROP COLUMN easily, so this creates a new table.
    """
    print(f"Rolling back migration on database: {db_path}")

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Get current schema
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='jobs'")
        result = cursor.fetchone()

        if not result:
            print("Jobs table doesn't exist")
            return True

        # This would require recreating the table without the new columns
        # For safety, we'll just warn the user
        print("⚠️  Warning: SQLite doesn't support DROP COLUMN easily.")
        print("To rollback, you should restore from backup.")

        conn.close()
        return False

    except sqlite3.Error as e:
        print(f"Rollback failed: {e}")
        return False


if __name__ == '__main__':
    # Get database path from command line or use default
    db_path = sys.argv[1] if len(sys.argv) > 1 else 'jobs.db'

    # Run migration
    success = migrate(db_path)

    if not success:
        sys.exit(1)
