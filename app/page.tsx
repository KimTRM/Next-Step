/**
 * Landing Page - NextStep Platform
 * 
 * Public homepage with hero, features, and call-to-action sections
 */

import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { AIFeatures } from '@/components/landing/AIFeatures';
import { UserRoles } from '@/components/landing/UserRoles';
import { Courses } from '@/components/landing/Courses';
import { Community } from '@/components/landing/Community';

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
