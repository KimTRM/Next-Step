/**
 * Landing Page - NextStep Platform
 * 
 * Public homepage with hero, features, and call-to-action sections
 */

import { Hero } from '@/shared/components/landing/Hero';
import { Features } from '@/shared/components/landing/Features';
import { AIFeatures } from '@/shared/components/landing/AIFeatures';
import { UserRoles } from '@/shared/components/landing/UserRoles';
import { Courses } from '@/shared/components/landing/Courses';
import { Community } from '@/shared/components/landing/Community';

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <AIFeatures />
      <UserRoles />
      <Courses />
      <Community />
    </>
  );
}
