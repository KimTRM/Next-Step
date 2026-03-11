"""
PH skill taxonomy normalizer.
Maps raw skill variants to canonical forms using ph_skills.json.

Usage:
    from pipeline.normalizers.skill_normalizer import SkillNormalizer
    norm = SkillNormalizer()
    canonical = norm.normalize("JS")  # → "JavaScript"
    skills = norm.normalize_list(["js", "react", "postgresql"])
"""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import List, Optional

TAXONOMY_PATH = Path(__file__).parents[2] / "data" / "taxonomies" / "ph_skills.json"


class SkillNormalizer:
    def __init__(self, taxonomy_path: str | Path = TAXONOMY_PATH):
        with open(taxonomy_path, encoding="utf-8") as f:
            taxonomy = json.load(f)

        # Build lookup: lowercase alias/canonical → canonical name
        self._lookup: dict[str, str] = {}
        self._skills_data = taxonomy["skills"]

        for skill in self._skills_data:
            canonical = skill["canonical"]
            self._lookup[canonical.lower()] = canonical
            for alias in skill.get("aliases", []):
                self._lookup[alias.lower()] = canonical

    def normalize(self, raw_skill: str) -> Optional[str]:
        """Return canonical skill name or None if not found."""
        clean = raw_skill.strip().lower()
        # Direct lookup
        if clean in self._lookup:
            return self._lookup[clean]
        # Try removing punctuation
        stripped = re.sub(r"[^\w\s]", "", clean).strip()
        if stripped in self._lookup:
            return self._lookup[stripped]
        return None

    def normalize_list(self, raw_skills: List[str]) -> List[str]:
        """Normalize a list, deduplicate, skip unknown skills."""
        seen: set[str] = set()
        result = []
        for raw in raw_skills:
            canonical = self.normalize(raw)
            if canonical and canonical not in seen:
                result.append(canonical)
                seen.add(canonical)
        return result

    def normalize_list_with_fallback(self, raw_skills: List[str]) -> List[str]:
        """Normalize known skills; keep unknown ones as-is (title-cased)."""
        seen: set[str] = set()
        result = []
        for raw in raw_skills:
            canonical = self.normalize(raw) or raw.strip().title()
            if canonical not in seen:
                result.append(canonical)
                seen.add(canonical)
        return result

    def get_sector(self, canonical_skill: str) -> Optional[str]:
        for skill in self._skills_data:
            if skill["canonical"] == canonical_skill:
                return skill.get("sector")
        return None

    def get_ph_credential(self, canonical_skill: str) -> Optional[str]:
        for skill in self._skills_data:
            if skill["canonical"] == canonical_skill:
                return skill.get("ph_credential")
        return None
