"""
Gemini AI-powered Resume Analyzer
Uses Google's Gemini API to analyze resumes and extract structured information.
"""
import google.generativeai as genai
import json
import re
from typing import Dict, List, Optional
import logging
import base64
import io

logger = logging.getLogger(__name__)


class GeminiResumeAnalyzer:
    """Analyze resumes using Google's Gemini API."""
    
    INDUSTRY_LIST = [
        "Technology", "Finance", "Healthcare", "Retail", "Manufacturing",
        "Education", "Marketing", "Consulting", "BPO", "Engineering",
        "Hospitality", "Legal", "Human Resources", "Administrative",
        "Fine Arts & Design"
    ]
    
    def __init__(self, api_key: str):
        """Initialize Gemini client."""
        self.api_key = api_key
        self.model = None
        
        if api_key:
            try:
                genai.configure(api_key=api_key)
                # Use gemini-2.0-flash (gemini-1.5-flash is deprecated)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
                logger.info("Gemini API initialized successfully with gemini-2.0-flash")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini: {e}")
                self.model = None
    
    def is_available(self) -> bool:
        """Check if Gemini API is available."""
        return self.model is not None
    
    def analyze_resume_text(self, resume_text: str) -> Dict:
        """
        Analyze resume text using Gemini.
        
        Args:
            resume_text: The text content of the resume
            
        Returns:
            Dictionary with analysis results
        """
        if not self.model:
            return self._fallback_analysis(resume_text)
        
        prompt = f"""Analyze this resume and extract the following information in JSON format:

1. "detected_skills": List of technical and soft skills mentioned (max 20)
2. "detected_industry": The most likely industry this person works in. Must be one of: {', '.join(self.INDUSTRY_LIST)}
3. "industry_confidence": Confidence score 0-100 for the detected industry
4. "suggested_industries": List of up to 3 other industries that might fit, each with "industry" and "confidence" fields
5. "experience_years": Estimated total years of experience (number)
6. "job_titles": List of job titles mentioned in the resume (max 5)
7. "education_level": Highest education level (e.g., "High School", "Bachelor", "Master", "PhD")
8. "search_keywords": 5 optimal job search keywords based on this resume
9. "summary": A brief 2-sentence summary of this candidate's profile

Resume:
{resume_text}

Respond ONLY with valid JSON, no markdown formatting or code blocks."""

        try:
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            
            # Clean up the response - remove markdown code blocks if present
            if result_text.startswith('```'):
                result_text = re.sub(r'^```(?:json)?\n?', '', result_text)
                result_text = re.sub(r'\n?```$', '', result_text)
            
            result = json.loads(result_text)
            
            # Ensure required fields exist
            result.setdefault('detected_skills', [])
            result.setdefault('detected_industry', 'Technology')
            result.setdefault('industry_confidence', 70)
            result.setdefault('suggested_industries', [])
            result.setdefault('experience_years', 0)
            result.setdefault('job_titles', [])
            result.setdefault('education_level', 'Bachelor')
            result.setdefault('search_keywords', [])
            result.setdefault('summary', '')
            
            # Validate industry
            if result['detected_industry'] not in self.INDUSTRY_LIST:
                result['detected_industry'] = 'Technology'
            
            logger.info(f"Gemini analysis complete: {result['detected_industry']} ({result['industry_confidence']}%)")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}")
            return self._fallback_analysis(resume_text)
        except Exception as e:
            logger.error(f"Gemini analysis failed: {e}")
            return self._fallback_analysis(resume_text)
    
    def analyze_resume_file(self, file_content: bytes, filename: str, mime_type: str) -> Dict:
        """
        Analyze a resume file (PDF, DOCX) using Gemini's multimodal capabilities.
        
        Args:
            file_content: Raw bytes of the file
            filename: Name of the file
            mime_type: MIME type of the file
            
        Returns:
            Dictionary with analysis results
        """
        if not self.model:
            return {"error": "Gemini API not available", "detected_skills": [], "detected_industry": "Technology"}
        
        prompt = f"""Analyze this resume document and extract the following information in JSON format:

1. "detected_skills": List of technical and soft skills mentioned (max 20)
2. "detected_industry": The most likely industry this person works in. Must be one of: {', '.join(self.INDUSTRY_LIST)}
3. "industry_confidence": Confidence score 0-100 for the detected industry
4. "suggested_industries": List of up to 3 other industries that might fit, each with "industry" and "confidence" fields
5. "experience_years": Estimated total years of experience (number)
6. "job_titles": List of job titles mentioned in the resume (max 5)
7. "education_level": Highest education level (e.g., "High School", "Bachelor", "Master", "PhD")
8. "search_keywords": 5 optimal job search keywords based on this resume
9. "summary": A brief 2-sentence summary of this candidate's profile
10. "extracted_text": The full text content extracted from this document

Respond ONLY with valid JSON, no markdown formatting or code blocks."""

        try:
            # For PDF files, try to extract text first using pdfminer
            if mime_type == 'application/pdf':
                extracted_text = self._extract_pdf_text(file_content)
                if extracted_text and len(extracted_text.strip()) > 50:
                    logger.info(f"Extracted {len(extracted_text)} chars from PDF, using text analysis")
                    result = self.analyze_resume_text(extracted_text)
                    result['extracted_text'] = extracted_text
                    result['extraction_method'] = 'pdfminer'
                    return result
                else:
                    # PDF text extraction failed - likely an image-based/scanned PDF
                    logger.warning("PDF appears to be image-based or has minimal text content")
                    
                    # Try Gemini multimodal as fallback (if available and quota permits)
                    if self.model:
                        logger.info("Attempting Gemini multimodal analysis for image-based PDF...")
                        try:
                            # Use Gemini's inline data format for PDF
                            file_part = {
                                "inline_data": {
                                    "mime_type": mime_type,
                                    "data": base64.standard_b64encode(file_content).decode('utf-8')
                                }
                            }
                            
                            response = self.model.generate_content([prompt, file_part])
                            result_text = response.text.strip()
                            
                            # Clean up markdown formatting
                            if result_text.startswith('```'):
                                result_text = re.sub(r'^```(?:json)?\n?', '', result_text)
                                result_text = re.sub(r'\n?```$', '', result_text)
                            
                            result = json.loads(result_text)
                            result['extraction_method'] = 'gemini_multimodal'
                        except Exception as multimodal_error:
                            logger.error(f"Gemini multimodal failed: {multimodal_error}")
                            # Return error with helpful message
                            return {
                                "error": "This PDF appears to be image-based (scanned). Please use a text-based PDF, or copy and paste your resume text directly.",
                                "detected_skills": [],
                                "detected_industry": "Technology",
                                "industry_confidence": 0,
                                "extracted_text": "",
                                "search_keywords": []
                            }
                    else:
                        return {
                            "error": "Could not extract text from PDF. It may be image-based (scanned). Please paste your resume text directly.",
                            "detected_skills": [],
                            "detected_industry": "Technology", 
                            "industry_confidence": 0,
                            "extracted_text": "",
                            "search_keywords": []
                        }
            else:
                # For DOCX, try to extract text first using python-docx
                text = self._extract_docx_text(file_content)
                if text:
                    result = self.analyze_resume_text(text)
                    result['extracted_text'] = text
                    return result
                else:
                    return {"error": "Could not extract text from document", "detected_skills": [], "detected_industry": "Technology"}
            
            # Ensure required fields
            result.setdefault('detected_skills', [])
            result.setdefault('detected_industry', 'Technology')
            result.setdefault('industry_confidence', 70)
            result.setdefault('suggested_industries', [])
            result.setdefault('experience_years', 0)
            result.setdefault('job_titles', [])
            result.setdefault('education_level', 'Bachelor')
            result.setdefault('search_keywords', [])
            result.setdefault('summary', '')
            result.setdefault('extracted_text', '')
            
            # Validate industry
            if result['detected_industry'] not in self.INDUSTRY_LIST:
                result['detected_industry'] = 'Technology'
            
            logger.info(f"Gemini file analysis complete: {result['detected_industry']} ({result['industry_confidence']}%)")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini file response as JSON: {e}")
            return {"error": str(e), "detected_skills": [], "detected_industry": "Technology"}
        except Exception as e:
            logger.error(f"Gemini file analysis failed: {e}")
            return {"error": str(e), "detected_skills": [], "detected_industry": "Technology"}
    
    def _extract_pdf_text(self, file_content: bytes) -> Optional[str]:
        """Extract text from PDF file using pdfminer."""
        try:
            from pdfminer.high_level import extract_text
            from pdfminer.pdfparser import PDFSyntaxError
            import io
            
            text = extract_text(io.BytesIO(file_content))
            if text:
                # Clean up the text - remove excessive whitespace
                lines = [line.strip() for line in text.split('\n') if line.strip()]
                cleaned_text = '\n'.join(lines)
                logger.info(f"PDF text extraction successful: {len(cleaned_text)} characters")
                return cleaned_text
            else:
                logger.warning("PDF text extraction returned empty text - PDF may be image-based")
                return None
        except PDFSyntaxError as e:
            logger.error(f"PDF syntax error: {e}")
            return None
        except ImportError:
            logger.error("pdfminer not installed")
            return None
        except Exception as e:
            logger.error(f"PDF text extraction failed: {e}")
            return None
    
    def _extract_docx_text(self, file_content: bytes) -> Optional[str]:
        """Extract text from DOCX file."""
        try:
            from docx import Document
            doc = Document(io.BytesIO(file_content))
            text_parts = []
            for paragraph in doc.paragraphs:
                text_parts.append(paragraph.text)
            return '\n'.join(text_parts)
        except ImportError:
            logger.warning("python-docx not installed, cannot extract DOCX text")
            return None
        except Exception as e:
            logger.error(f"Failed to extract DOCX text: {e}")
            return None
    
    def _fallback_analysis(self, text: str) -> Dict:
        """Fallback analysis when Gemini is not available."""
        text_lower = text.lower()
        
        # Simple skill extraction
        common_skills = [
            'python', 'javascript', 'java', 'react', 'node.js', 'sql', 'aws', 
            'docker', 'kubernetes', 'git', 'agile', 'scrum', 'html', 'css',
            'excel', 'word', 'powerpoint', 'communication', 'leadership',
            'project management', 'photoshop', 'illustrator', 'figma',
            'adobe', 'canva', 'video editing', 'animation', 'ui/ux',
            'customer service', 'sales', 'marketing', 'accounting', 'finance'
        ]
        
        detected_skills = [skill for skill in common_skills if skill in text_lower]
        
        # Simple industry detection
        industry_keywords = {
            'Technology': ['software', 'developer', 'engineer', 'programming', 'data', 'cloud', 'ai'],
            'Finance': ['accounting', 'finance', 'bank', 'audit', 'tax', 'investment'],
            'Healthcare': ['nurse', 'medical', 'hospital', 'patient', 'clinical', 'doctor'],
            'Marketing': ['marketing', 'advertising', 'brand', 'social media', 'seo', 'content'],
            'Education': ['teacher', 'education', 'school', 'training', 'curriculum'],
            'Fine Arts & Design': ['designer', 'graphic', 'artist', 'creative', 'visual', 'ui', 'ux', 'illustrator'],
            'BPO': ['customer service', 'call center', 'support', 'bpo'],
            'Human Resources': ['hr', 'recruitment', 'hiring', 'human resources'],
            'Administrative': ['admin', 'assistant', 'secretary', 'office']
        }
        
        best_industry = 'Technology'
        best_score = 0
        
        for industry, keywords in industry_keywords.items():
            score = sum(1 for kw in keywords if kw in text_lower)
            if score > best_score:
                best_score = score
                best_industry = industry
        
        confidence = min(95, 50 + best_score * 10)
        
        return {
            'detected_skills': detected_skills[:15],
            'detected_industry': best_industry,
            'industry_confidence': confidence,
            'suggested_industries': [],
            'experience_years': 0,
            'job_titles': [],
            'education_level': 'Bachelor',
            'search_keywords': detected_skills[:5] if detected_skills else ['job'],
            'summary': 'Resume analyzed using fallback method.',
            'analysis_method': 'fallback'
        }
