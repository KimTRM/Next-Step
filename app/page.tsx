/**
 * Landing Page - NextStep Platform
 * 
 * Main landing page with hero section, features, and CTA
 */

import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card, { CardBody, CardTitle } from '@/components/ui/Card';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-emerald-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block px-4 py-2 bg-green-100 rounded-full mb-6">
            <span className="text-green-700 text-sm font-medium">🎯 Your Career Journey Starts Here</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Helping You Take Your <span className="text-white">Next Step in Life</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            A jobseeker and mentorship hub designed for youth. Discover opportunities, track applications, and connect with mentors who guide you from campus to career.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button variant="primary" size="lg" className="bg-white text-green-700 hover:bg-gray-100">
                Get Started Free
              </Button>
            </Link>
            <Link href="/opportunities">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                Find a Mentor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to <span className="text-green-700">Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools to guide you from student to professional. Find jobs, track applications, and get mentored.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hoverable>
              <CardBody className="text-center">
                <div className="text-5xl mb-4">💼</div>
                <CardTitle>Job Opportunities</CardTitle>
                <p className="text-gray-600 mt-2">
                  Browse hundreds of entry-level jobs and internships from top companies
                  looking for talented youth like you.
                </p>
              </CardBody>
            </Card>

            <Card hoverable>
              <CardBody className="text-center">
                <div className="text-5xl mb-4">🎓</div>
                <CardTitle>Expert Mentorship</CardTitle>
                <p className="text-gray-600 mt-2">
                  Connect with experienced professionals who can guide your career,
                  review your work, and help you grow.
                </p>
              </CardBody>
            </Card>

            <Card hoverable>
              <CardBody className="text-center">
                <div className="text-5xl mb-4">🚀</div>
                <CardTitle>Career Growth</CardTitle>
                <p className="text-gray-600 mt-2">
                  Track your applications, build your profile, and showcase your skills
                  to stand out to employers.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How NextStep Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
              <p className="text-gray-600">
                Sign up and build your profile highlighting your skills, experience, and goals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Explore & Apply</h3>
              <p className="text-gray-600">
                Browse opportunities that match your interests and apply with one click.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect & Grow</h3>
              <p className="text-gray-600">
                Get matched with mentors and receive guidance to accelerate your career.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">5K+</div>
              <div className="text-green-100">Job Seekers</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">800+</div>
              <div className="text-green-100">Mentors</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">2K+</div>
              <div className="text-green-100">Success Stories</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Take Your Next Step?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of youth who have found their dream jobs and mentors through NextStep.
          </p>
          <Link href="/auth">
            <Button variant="primary" size="lg">
              Get Started Now - It's Free!
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-xl mb-4">NextStep</h3>
              <p className="text-sm">
                Empowering youth to achieve their career goals through mentorship and opportunities.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/opportunities" className="hover:text-white">Opportunities</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/auth" className="hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Career Guides</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 NextStep. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
