#!/usr/bin/env python3
"""Test continuous training with real job scraping."""

from train_continuous import ContinuousTrainer
import datetime

# Test with --linkedin enabled (uses Indeed scraper)
print("=" * 60)
print("Testing Continuous Training with Real Job Scraping")
print("=" * 60)
print()

trainer = ContinuousTrainer(batch_size=3, interval=1, quiet=False, use_linkedin=True)

# Run 2 batches
trainer.stats['start_time'] = datetime.datetime.now()

for i in range(2):
    if not trainer.running:
        break
    results = trainer._process_batch()
    trainer.stats['total_resumes'] += results['resumes_processed']
    trainer.stats['total_skills_learned'] += len(results['new_skills'])
    trainer.stats['batches_completed'] += 1
    
    avg_acc = sum(results['accuracy_scores']) / len(results['accuracy_scores']) if results['accuracy_scores'] else 0
    print(f"Batch {i+1}: {results['resumes_processed']} resumes, {avg_acc:.1f}% accuracy")
    if results['new_skills'][:5]:
        print(f"  New skills: {results['new_skills'][:5]}")
    print()

trainer._save_knowledge()
print("-" * 60)
print(f"Total learned skills: {len(trainer.knowledge['learned_skills'])}")

if trainer.linkedin_scraper:
    stats = trainer.linkedin_scraper.get_stats()
    print(f"Indeed jobs fetched: {stats['total_jobs_fetched']}")
    print(f"Real skills extracted: {stats['total_skills_extracted']}")
    print(f"API key used: #{trainer.linkedin_scraper.api_keys[0][0] if trainer.linkedin_scraper.api_keys else 'N/A'}")

print("\nTest complete!")
