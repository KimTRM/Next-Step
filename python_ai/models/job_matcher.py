"""
Job Matching AI Algorithm
Trainable skill-based matching with confidence scoring
"""

import json
import pickle
import numpy as np
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import math


@dataclass
class MatchResult:
    """Result of a job match"""
    job_id: str
    company: str
    title: str
    industry: str
    city: str
    confidence: float  # 0-100 percentage
    skill_match_score: float
    experience_match_score: float
    education_match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    explanation: str
    job_url: str = ""
    job_source: str = "synthetic"

    def to_dict(self) -> Dict:
        return asdict(self)


class SkillEmbedder:
    """
    Convert skills to vector representations for semantic matching.
    Uses a simplified TF-IDF-like approach that can be trained.
    """
    
    def __init__(self):
        self.vocabulary: Dict[str, int] = {}
        self.idf_scores: Dict[str, float] = {}
        self.skill_cooccurrence: Dict[str, Dict[str, float]] = {}
        self.is_trained = False
    
    def fit(self, skill_documents: List[List[str]]):
        """
        Train the embedder on a collection of skill sets.
        
        Args:
            skill_documents: List of skill lists (from resumes or job postings)
        """
        # Build vocabulary
        all_skills = set()
        for doc in skill_documents:
            all_skills.update([s.lower() for s in doc])
        
        self.vocabulary = {skill: idx for idx, skill in enumerate(sorted(all_skills))}
        
        # Calculate IDF scores
        doc_count = len(skill_documents)
        skill_doc_freq = {skill: 0 for skill in self.vocabulary}
        
        for doc in skill_documents:
            unique_skills = set([s.lower() for s in doc])
            for skill in unique_skills:
                if skill in skill_doc_freq:
                    skill_doc_freq[skill] += 1
        
        for skill, freq in skill_doc_freq.items():
            # IDF with smoothing
            self.idf_scores[skill] = math.log((doc_count + 1) / (freq + 1)) + 1
        
        # Build co-occurrence matrix for related skills
        for doc in skill_documents:
            skills = [s.lower() for s in doc]
            for i, skill1 in enumerate(skills):
                if skill1 not in self.skill_cooccurrence:
                    self.skill_cooccurrence[skill1] = {}
                for skill2 in skills:
                    if skill1 != skill2:
                        self.skill_cooccurrence[skill1][skill2] = \
                            self.skill_cooccurrence[skill1].get(skill2, 0) + 1
        
        # Normalize co-occurrence
        for skill1 in self.skill_cooccurrence:
            total = sum(self.skill_cooccurrence[skill1].values())
            if total > 0:
                for skill2 in self.skill_cooccurrence[skill1]:
                    self.skill_cooccurrence[skill1][skill2] /= total
        
        self.is_trained = True
    
    def embed(self, skills: List[str]) -> np.ndarray:
        """
        Convert a skill list to a vector representation.
        """
        if not self.is_trained:
            raise RuntimeError("Embedder must be trained before use")
        
        vector = np.zeros(len(self.vocabulary))
        skills_lower = [s.lower() for s in skills]
        
        for skill in skills_lower:
            if skill in self.vocabulary:
                idx = self.vocabulary[skill]
                # TF-IDF weighting
                tf = skills_lower.count(skill) / len(skills_lower)
                idf = self.idf_scores.get(skill, 1.0)
                vector[idx] = tf * idf
        
        # Normalize
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
        
        return vector
    
    def get_related_skills(self, skill: str, top_k: int = 5) -> List[Tuple[str, float]]:
        """Get skills that commonly co-occur with given skill"""
        skill_lower = skill.lower()
        if skill_lower not in self.skill_cooccurrence:
            return []
        
        related = sorted(
            self.skill_cooccurrence[skill_lower].items(),
            key=lambda x: x[1],
            reverse=True
        )
        return related[:top_k]
    
    def save(self, path: str):
        """Save trained embedder"""
        data = {
            'vocabulary': self.vocabulary,
            'idf_scores': self.idf_scores,
            'skill_cooccurrence': self.skill_cooccurrence,
            'is_trained': self.is_trained
        }
        with open(path, 'wb') as f:
            pickle.dump(data, f)
    
    def load(self, path: str):
        """Load trained embedder"""
        with open(path, 'rb') as f:
            data = pickle.load(f)
        self.vocabulary = data['vocabulary']
        self.idf_scores = data['idf_scores']
        self.skill_cooccurrence = data['skill_cooccurrence']
        self.is_trained = data['is_trained']


class JobMatcher:
    """
    Main matching algorithm with trainable weights.
    """
    
    def __init__(self):
        self.embedder = SkillEmbedder()
        
        # Trainable weights (can be adjusted via feedback)
        self.weights = {
            'skill_semantic': 0.30,    # Semantic skill similarity
            'skill_exact': 0.35,       # Exact skill overlap
            'experience': 0.20,        # Experience match
            'education': 0.10,         # Education match
            'industry': 0.05,          # Industry match
        }
        
        # Experience scoring parameters
        self.exp_params = {
            'underqualified_penalty': 0.7,  # Penalty per missing year
            'overqualified_penalty': 0.95,  # Slight penalty for overqualification
            'overqualified_threshold': 5,   # Years over max before penalty
        }
        
        # Education level scoring
        self.education_levels = {
            'phd': 5,
            'doctorate': 5,
            'masters': 4,
            'mba': 4,
            'bachelors': 3,
            'associates': 2,
            'high school': 1,
            'diploma': 1,
        }
        
        # Confidence calibration parameters (trained from feedback)
        self.calibration = {
            'scale': 1.0,
            'shift': 0.0,
        }
        
        # Training history
        self.feedback_history: List[Dict] = []
        self.is_trained = False
    
    def train(self, training_data: List[Dict]):
        """
        Train the matcher on historical data.
        
        Args:
            training_data: List of dicts with keys:
                - 'candidate_skills': List[str]
                - 'job_skills': List[str]
                - 'was_hired': bool (optional, for supervised learning)
        """
        # Extract all skill sets for embedder training
        skill_documents = []
        for item in training_data:
            skill_documents.append(item.get('candidate_skills', []))
            skill_documents.append(item.get('job_skills', []))
        
        # Train the embedder
        self.embedder.fit(skill_documents)
        
        # If we have hire/no-hire labels, optimize weights
        labeled_data = [d for d in training_data if 'was_hired' in d]
        if len(labeled_data) >= 10:
            self._optimize_weights(labeled_data)
        
        self.is_trained = True
    
    def _optimize_weights(self, labeled_data: List[Dict]):
        """
        Optimize weights using labeled data (simple grid search).
        In production, use gradient descent or Bayesian optimization.
        """
        best_accuracy = 0
        best_weights = self.weights.copy()
        
        # Simple grid search over weight combinations
        for skill_semantic in [0.2, 0.3, 0.4]:
            for skill_exact in [0.3, 0.35, 0.4]:
                for experience in [0.15, 0.2, 0.25]:
                    remaining = 1 - skill_semantic - skill_exact - experience
                    education = remaining * 0.67
                    industry = remaining * 0.33
                    
                    test_weights = {
                        'skill_semantic': skill_semantic,
                        'skill_exact': skill_exact,
                        'experience': experience,
                        'education': education,
                        'industry': industry,
                    }
                    
                    correct = 0
                    for item in labeled_data:
                        score = self._calculate_raw_score(
                            item.get('candidate_skills', []),
                            item.get('job_skills', []),
                            item.get('candidate_experience', 0),
                            item.get('job_min_experience', 0),
                            item.get('job_max_experience', 10),
                            item.get('candidate_education', []),
                            item.get('job_education', 'bachelors'),
                            test_weights
                        )
                        predicted_hire = score > 0.5
                        if predicted_hire == item['was_hired']:
                            correct += 1
                    
                    accuracy = correct / len(labeled_data)
                    if accuracy > best_accuracy:
                        best_accuracy = accuracy
                        best_weights = test_weights
        
        self.weights = best_weights
        print(f"Optimized weights with accuracy: {best_accuracy:.2%}")
    
    def match(self, candidate: Dict, job: Dict) -> MatchResult:
        """
        Match a candidate to a job and return detailed results.
        
        Args:
            candidate: Dict with keys: skills, experience_years, education, industries
            job: Dict with keys: id, title, company, industry, city, 
                 required_skills, min_experience, max_experience, education_required
        """
        candidate_skills = candidate.get('skills', [])
        job_skills = job.get('required_skills', [])
        
        # If job has no required skills, try to infer relevance from title/description
        title_relevance_bonus = 0
        if not job_skills:
            title_relevance_bonus = self._calculate_title_relevance(
                candidate_skills, 
                job.get('title', ''),
                job.get('description', '')
            )
        
        # Calculate component scores
        skill_semantic_score = self._calculate_skill_semantic_score(
            candidate_skills,
            job_skills
        )
        
        skill_exact_score, matched_skills, missing_skills = self._calculate_skill_exact_score(
            candidate_skills,
            job_skills
        )
        
        # If no job skills to match against, use title relevance
        if not job_skills and title_relevance_bonus > 0:
            skill_exact_score = title_relevance_bonus
            # Find matching keywords in title/description as pseudo-matched skills
            title_desc = f"{job.get('title', '')} {job.get('description', '')}".lower()
            for skill in candidate_skills:
                if skill.lower() in title_desc and skill.lower() not in matched_skills:
                    matched_skills.append(skill.lower())
        
        experience_score = self._calculate_experience_score(
            candidate.get('experience_years', 0),
            job.get('min_experience', 0),
            job.get('max_experience', 20)
        )
        
        education_score = self._calculate_education_score(
            candidate.get('education', []),
            job.get('education_required', 'bachelors')
        )
        
        industry_score = self._calculate_industry_score(
            candidate.get('industries', []),
            job.get('industry', '')
        )
        
        # Weighted combination
        raw_score = (
            self.weights['skill_semantic'] * skill_semantic_score +
            self.weights['skill_exact'] * skill_exact_score +
            self.weights['experience'] * experience_score +
            self.weights['education'] * education_score +
            self.weights['industry'] * industry_score
        )
        
        # Apply title relevance bonus for jobs without structured skills
        if title_relevance_bonus > 0 and raw_score < 0.5:
            raw_score = max(raw_score, title_relevance_bonus * 0.7)
        
        # Convert to calibrated confidence percentage
        confidence = self._calibrate_confidence(raw_score)
        
        # Generate explanation
        explanation = self._generate_explanation(
            skill_exact_score, experience_score, education_score,
            matched_skills, missing_skills, confidence
        )
        
        return MatchResult(
            job_id=job.get('id', ''),
            company=job.get('company', ''),
            title=job.get('title', ''),
            industry=job.get('industry', ''),
            city=job.get('city', ''),
            confidence=round(confidence, 1),
            skill_match_score=round(skill_exact_score * 100, 1),
            experience_match_score=round(experience_score * 100, 1),
            education_match_score=round(education_score * 100, 1),
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            explanation=explanation,
            job_url=job.get('job_url', ''),
            job_source=job.get('job_source', 'synthetic')
        )
    
    def _calculate_skill_semantic_score(
        self, 
        candidate_skills: List[str], 
        job_skills: List[str]
    ) -> float:
        """Calculate semantic similarity between skill sets"""
        if not self.is_trained or not candidate_skills or not job_skills:
            return 0.0
        
        candidate_vec = self.embedder.embed(candidate_skills)
        job_vec = self.embedder.embed(job_skills)
        
        # Cosine similarity
        similarity = np.dot(candidate_vec, job_vec)
        return float(max(0, min(1, similarity)))
    
    def _calculate_title_relevance(
        self,
        candidate_skills: List[str],
        job_title: str,
        job_description: str = ""
    ) -> float:
        """
        Calculate relevance score based on title and description when
        no structured skills are available.
        """
        if not candidate_skills:
            return 0.3  # Base score for any job
        
        # Combine title and description
        text = f"{job_title} {job_description}".lower()
        
        # Count how many candidate skills appear in the text
        matches = 0
        for skill in candidate_skills:
            skill_lower = skill.lower()
            # Check for exact match or partial match
            if skill_lower in text:
                matches += 1
            # Also check for related terms
            elif len(skill_lower) > 3:
                # Check if skill words appear separately
                skill_words = skill_lower.split()
                if any(word in text for word in skill_words if len(word) > 2):
                    matches += 0.5
        
        # Calculate relevance score (0 to 1)
        if matches > 0:
            score = min(1.0, matches / min(len(candidate_skills), 5))
            return max(0.4, score)  # At least 40% if any match
        
        return 0.3  # Base score even without matches (industry match matters)
    
    def _calculate_skill_exact_score(
        self,
        candidate_skills: List[str],
        job_skills: List[str]
    ) -> Tuple[float, List[str], List[str]]:
        """Calculate exact skill overlap"""
        if not job_skills:
            return 1.0, [], []
        
        candidate_set = set(s.lower() for s in candidate_skills)
        job_set = set(s.lower() for s in job_skills)
        
        matched = candidate_set & job_set
        missing = job_set - candidate_set
        
        # Score based on percentage of required skills matched
        score = len(matched) / len(job_set) if job_set else 1.0
        
        return score, list(matched), list(missing)
    
    def _calculate_experience_score(
        self,
        candidate_exp: float,
        min_exp: float,
        max_exp: float
    ) -> float:
        """Calculate experience match score"""
        if candidate_exp >= min_exp:
            if max_exp and candidate_exp > max_exp + self.exp_params['overqualified_threshold']:
                # Slightly penalize significant overqualification
                return self.exp_params['overqualified_penalty']
            return 1.0
        else:
            # Partial credit for underqualification
            ratio = candidate_exp / min_exp if min_exp > 0 else 1.0
            return ratio * self.exp_params['underqualified_penalty']
    
    def _calculate_education_score(
        self,
        candidate_education: List[Dict],
        required_education: str
    ) -> float:
        """Calculate education match score"""
        if not required_education:
            return 1.0
        
        required_level = self.education_levels.get(required_education.lower(), 0)
        
        if not candidate_education:
            return 0.5  # Unknown education gets partial credit
        
        # Get highest education level
        candidate_level = 0
        for edu in candidate_education:
            degree = edu.get('degree', '').lower()
            level = self.education_levels.get(degree, 0)
            candidate_level = max(candidate_level, level)
        
        if candidate_level >= required_level:
            return 1.0
        elif candidate_level > 0:
            return candidate_level / required_level
        else:
            return 0.5
    
    def _calculate_industry_score(
        self,
        candidate_industries: List[str],
        job_industry: str
    ) -> float:
        """Calculate industry match score"""
        if not job_industry or not candidate_industries:
            return 0.5  # Neutral score for unknown
        
        job_ind_lower = job_industry.lower()
        candidate_inds_lower = [i.lower() for i in candidate_industries]
        
        if job_ind_lower in candidate_inds_lower:
            return 1.0
        
        # Partial credit for related industries
        related_industries = {
            'technology': ['consulting', 'finance'],
            'finance': ['technology', 'consulting'],
            'healthcare': ['technology', 'research'],
            'consulting': ['technology', 'finance'],
        }
        
        related = related_industries.get(job_ind_lower, [])
        for ind in candidate_inds_lower:
            if ind in related:
                return 0.7
        
        return 0.3
    
    def _calculate_raw_score(
        self,
        candidate_skills: List[str],
        job_skills: List[str],
        candidate_exp: float,
        job_min_exp: float,
        job_max_exp: float,
        candidate_education: List[Dict],
        job_education: str,
        weights: Dict
    ) -> float:
        """Calculate raw score with given weights (for optimization)"""
        skill_exact, _, _ = self._calculate_skill_exact_score(candidate_skills, job_skills)
        exp_score = self._calculate_experience_score(candidate_exp, job_min_exp, job_max_exp)
        edu_score = self._calculate_education_score(candidate_education, job_education)
        
        return (
            weights['skill_exact'] * skill_exact +
            weights['experience'] * exp_score +
            weights['education'] * edu_score
        )
    
    def _calibrate_confidence(self, raw_score: float) -> float:
        """Convert raw score to calibrated confidence percentage"""
        # Sigmoid-based calibration
        adjusted = raw_score * self.calibration['scale'] + self.calibration['shift']
        
        # Map to percentage with realistic bounds
        # Raw scores rarely go above 0.9 or below 0.2
        confidence = 100 * (1 / (1 + math.exp(-10 * (adjusted - 0.5))))
        
        # Ensure realistic bounds
        return max(5, min(95, confidence))
    
    def _generate_explanation(
        self,
        skill_score: float,
        exp_score: float,
        edu_score: float,
        matched_skills: List[str],
        missing_skills: List[str],
        confidence: float
    ) -> str:
        """Generate human-readable explanation of the match"""
        parts = []
        
        if confidence >= 75:
            parts.append("Strong match!")
        elif confidence >= 50:
            parts.append("Good potential match.")
        else:
            parts.append("Partial match.")
        
        if matched_skills:
            top_skills = matched_skills[:5]
            parts.append(f"Key matching skills: {', '.join(top_skills)}.")
        
        if missing_skills and len(missing_skills) <= 3:
            parts.append(f"Consider developing: {', '.join(missing_skills)}.")
        elif missing_skills:
            parts.append(f"Missing {len(missing_skills)} required skills.")
        
        if exp_score < 0.8:
            parts.append("May need more experience for this role.")
        
        return " ".join(parts)
    
    def record_feedback(
        self,
        match_result: MatchResult,
        was_successful: bool,
        feedback_type: str = 'application'
    ):
        """
        Record feedback for continuous learning.
        
        Args:
            match_result: The match that received feedback
            was_successful: Whether the match was successful (hired, interviewed, etc.)
            feedback_type: 'application', 'interview', 'hire'
        """
        feedback = {
            'timestamp': datetime.now().isoformat(),
            'job_id': match_result.job_id,
            'predicted_confidence': match_result.confidence,
            'was_successful': was_successful,
            'feedback_type': feedback_type,
        }
        self.feedback_history.append(feedback)
        
        # Recalibrate if we have enough feedback
        if len(self.feedback_history) >= 20:
            self._recalibrate()
    
    def _recalibrate(self):
        """Recalibrate confidence scores based on feedback"""
        if len(self.feedback_history) < 20:
            return
        
        # Simple calibration: adjust scale and shift
        predictions = []
        actuals = []
        
        for fb in self.feedback_history[-100:]:  # Last 100 feedbacks
            predictions.append(fb['predicted_confidence'] / 100)
            actuals.append(1.0 if fb['was_successful'] else 0.0)
        
        pred_mean = np.mean(predictions)
        actual_mean = np.mean(actuals)
        
        # Adjust shift to match average success rate
        self.calibration['shift'] += (actual_mean - pred_mean) * 0.1
    
    def save(self, path: str):
        """Save trained matcher"""
        data = {
            'weights': self.weights,
            'exp_params': self.exp_params,
            'calibration': self.calibration,
            'feedback_history': self.feedback_history,
            'is_trained': self.is_trained,
        }
        
        model_path = Path(path)
        model_path.mkdir(parents=True, exist_ok=True)
        
        with open(model_path / 'matcher.pkl', 'wb') as f:
            pickle.dump(data, f)
        
        self.embedder.save(str(model_path / 'embedder.pkl'))
    
    def load(self, path: str):
        """Load trained matcher"""
        model_path = Path(path)
        
        with open(model_path / 'matcher.pkl', 'rb') as f:
            data = pickle.load(f)
        
        self.weights = data['weights']
        self.exp_params = data['exp_params']
        self.calibration = data['calibration']
        self.feedback_history = data['feedback_history']
        self.is_trained = data['is_trained']
        
        self.embedder.load(str(model_path / 'embedder.pkl'))


class IndustryClassifier:
    """Classify jobs and candidates into industries"""
    
    INDUSTRY_KEYWORDS = {
        'Technology': [
            'software', 'developer', 'engineer', 'programming', 'cloud', 'data',
            'ai', 'machine learning', 'tech', 'startup', 'saas', 'platform'
        ],
        'Finance': [
            'bank', 'financial', 'investment', 'trading', 'fintech', 'accounting',
            'audit', 'tax', 'portfolio', 'asset', 'wealth'
        ],
        'Healthcare': [
            'hospital', 'medical', 'health', 'clinical', 'patient', 'pharma',
            'biotech', 'nursing', 'doctor', 'therapy'
        ],
        'Retail': [
            'retail', 'store', 'ecommerce', 'e-commerce', 'shop', 'consumer',
            'merchandise', 'inventory', 'sales'
        ],
        'Manufacturing': [
            'manufacturing', 'factory', 'production', 'assembly', 'industrial',
            'supply chain', 'logistics', 'warehouse'
        ],
        'Education': [
            'school', 'university', 'college', 'teaching', 'professor', 'academic',
            'research', 'student', 'curriculum'
        ],
        'Marketing': [
            'marketing', 'advertising', 'brand', 'campaign', 'digital marketing',
            'social media', 'content', 'seo', 'creative'
        ],
        'Consulting': [
            'consulting', 'consultant', 'advisory', 'strategy', 'management consulting'
        ],
        'Fine Arts & Design': [
            'graphic design', 'artist', 'illustrator', 'creative', 'visual', 'animation',
            'ui', 'ux', 'designer', 'art director', 'multimedia', 'photography',
            'video editing', 'adobe', 'photoshop', 'illustration', 'branding', 'layout'
        ],
    }
    
    @classmethod
    def classify(cls, text: str) -> List[str]:
        """Classify text into industries"""
        text_lower = text.lower()
        matches = []
        
        for industry, keywords in cls.INDUSTRY_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score >= 2:
                matches.append((industry, score))
        
        # Sort by score and return industry names
        matches.sort(key=lambda x: x[1], reverse=True)
        return [m[0] for m in matches]


# Example usage
if __name__ == "__main__":
    # Create training data
    training_data = [
        {
            'candidate_skills': ['python', 'javascript', 'react', 'sql', 'aws'],
            'job_skills': ['python', 'javascript', 'react', 'node.js', 'postgresql'],
            'was_hired': True,
            'candidate_experience': 5,
            'job_min_experience': 3,
            'job_max_experience': 7,
        },
        {
            'candidate_skills': ['java', 'spring', 'sql'],
            'job_skills': ['python', 'django', 'postgresql', 'aws'],
            'was_hired': False,
            'candidate_experience': 2,
            'job_min_experience': 5,
            'job_max_experience': 10,
        },
        # Add more training samples...
    ]
    
    # Train the matcher
    matcher = JobMatcher()
    matcher.train(training_data)
    
    # Test matching
    candidate = {
        'skills': ['python', 'javascript', 'react', 'sql', 'aws', 'docker'],
        'experience_years': 4,
        'education': [{'degree': 'Bachelors', 'field': 'Computer Science'}],
        'industries': ['Technology'],
    }
    
    job = {
        'id': 'job_001',
        'title': 'Senior Software Engineer',
        'company': 'Tech Corp',
        'industry': 'Technology',
        'city': 'San Francisco',
        'required_skills': ['python', 'react', 'aws', 'postgresql', 'docker'],
        'min_experience': 3,
        'max_experience': 8,
        'education_required': 'bachelors',
    }
    
    result = matcher.match(candidate, job)
    print(f"\nMatch Result:")
    print(f"Company: {result.company}")
    print(f"Title: {result.title}")
    print(f"Confidence: {result.confidence}%")
    print(f"Matched Skills: {result.matched_skills}")
    print(f"Missing Skills: {result.missing_skills}")
    print(f"Explanation: {result.explanation}")
