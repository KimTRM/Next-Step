import sqlite3
conn = sqlite3.connect('jobs.db')
c = conn.cursor()
c.execute("SELECT COUNT(*) FROM jobs WHERE industry='Fine Arts & Design'")
print(f"Fine Arts & Design jobs: {c.fetchone()[0]}")
c.execute("SELECT COUNT(*), industry FROM jobs GROUP BY industry ORDER BY COUNT(*) DESC")
print("\nAll industries:")
for row in c.fetchall():
    print(f"  {row[1]}: {row[0]}")
conn.close()
