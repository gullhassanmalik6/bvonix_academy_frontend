import Card from '../components/common/Card';

const StaticPage = ({ title, children }) => (
  <div className="max-w-3xl mx-auto py-12 px-4">
    <Card>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
      <div className="prose text-gray-600 space-y-4">{children}</div>
    </Card>
  </div>
);

export const AboutPage = () => (
  <StaticPage title="About Bvonix Academy">
    <p>
      <strong>Bvonix Academy</strong> provides practical, earning-oriented tech education focused on real-world skills,
      real client projects, and real income opportunities.
    </p>
    <p className="font-medium text-gray-800">We don&apos;t just teach — we train students to earn.</p>
    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Our Learning Approach</h2>
    <ul className="list-disc pl-5 space-y-1">
      <li>80% Practical • 20% Theory</li>
      <li>Hands-on Real Client Projects</li>
      <li>Internship During the Course</li>
      <li>Career Building &amp; Earning Guidance</li>
    </ul>
    <h2 className="text-xl font-bold text-gray-900 mt-6 mb-2">Internship &amp; Job Program</h2>
    <ul className="list-disc pl-5 space-y-1">
      <li>Internship during the course (paid &amp; unpaid based on skill level)</li>
      <li>Real projects from our software house</li>
      <li>Job offers for skilled and consistent students</li>
      <li>Freelancing and remote work guidance (Upwork, Fiverr, and more)</li>
    </ul>
    <p className="italic text-gray-700 mt-6">From Learning to Earning — The Right Way.</p>
  </StaticPage>
);

export const ContactPage = () => (
  <StaticPage title="Contact Us">
    <p>For enrollment, scholarships, entry test details, or general inquiries, reach us directly:</p>
    <ul className="space-y-2 mt-4">
      <li>
        <strong>Phone:</strong>{' '}
        <a href="tel:03081166897" className="text-primary-600 hover:underline">0308-1166897</a>
      </li>
      <li>
        <strong>Phone:</strong>{' '}
        <a href="tel:03095061251" className="text-primary-600 hover:underline">0309-5061251</a>
      </li>
      <li>
        <strong>WhatsApp:</strong>{' '}
        <a href="https://wa.me/923081166897" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
          0308-1166897
        </a>
      </li>
    </ul>
    <p className="mt-6">
      <strong>Address:</strong><br />
      Sonara Bazar, Near Gurdwara Sahib, Daharki
    </p>
    <p className="mt-4 text-sm text-gray-500">
      Admissions are open. New batch starting 1st January 2026. First 100 students pay only 3,000 PKR/month (2,000 PKR off).
    </p>
  </StaticPage>
);

export const PrivacyPolicyPage = () => (
  <StaticPage title="Privacy Policy">
    <p>We collect personal information you provide during registration and enrollment solely to deliver our educational services.</p>
    <p>Your data is stored securely and is not shared with third parties except as required to process payments or comply with law.</p>
  </StaticPage>
);

export const TermsPage = () => (
  <StaticPage title="Terms and Conditions">
    <p>By using Bvonix Academy you agree to comply with our enrollment policies, payment terms, and academic conduct guidelines.</p>
    <p>Course access is granted after admin verification of payment. Refund policies vary by course.</p>
  </StaticPage>
);

export const CookiePolicyPage = () => (
  <StaticPage title="Cookie Policy">
    <p>We use essential cookies and local storage to maintain your login session and preferences.</p>
    <p>No third-party advertising cookies are used on the platform.</p>
  </StaticPage>
);
