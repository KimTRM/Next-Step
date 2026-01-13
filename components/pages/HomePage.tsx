import { Hero } from '../landing/Hero';
import { Features } from '../landing/Features';
import { AIFeatures } from '../landing/AIFeatures';
import { UserRoles } from '../landing/UserRoles';
import { Courses } from '../landing/Courses';
import { Community } from '../landing/Community';

export function HomePage() {
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
