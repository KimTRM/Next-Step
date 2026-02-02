"""Check and fetch Fine Arts & Design jobs"""
import sqlite3

conn = sqlite3.connect('jobs.db')
c = conn.cursor()

# Check for Fine Arts related jobs
c.execute("SELECT COUNT(*) FROM jobs WHERE industry LIKE '%Fine%' OR industry LIKE '%Design%' OR industry LIKE '%Art%'")
print(f'Fine Arts/Design related jobs: {c.fetchone()[0]}')

# Check for design-related titles
c.execute("SELECT title, industry FROM jobs WHERE title LIKE '%design%' OR title LIKE '%graphic%' OR title LIKE '%artist%' LIMIT 10")
results = c.fetchall()
print(f'Design-related titles found: {len(results)}')
for r in results:
    print(f'  - {r[0]} ({r[1]})')

conn.close()
