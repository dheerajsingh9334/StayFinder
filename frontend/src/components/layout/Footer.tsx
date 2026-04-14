import { Link } from 'react-router-dom';
import {
  Home,
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-container">
        <div className="site-footer-grid">
          <div>
            <Link to="/" className="site-footer-brand">
              <Home size={28} />
              <span>StayFinder</span>
            </Link>
            <p className="site-footer-copy">
              Experience the world's most luxurious properties. Masterfully
              curated, exceptionally designed just for you.
            </p>
            <div className="site-footer-socials">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="site-footer-social"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="site-footer-social"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="site-footer-social"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="site-footer-heading">Explore</h4>
            <ul className="site-footer-list">
              <li>
                <Link to="/" className="site-footer-link">
                  All Properties
                </Link>
              </li>
              <li>
                <Link to="/nearby" className="site-footer-link">
                  Nearby Locations
                </Link>
              </li>
              <li>
                <Link to="/search" className="site-footer-link">
                  Smart Semantic Search
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="site-footer-link">
                  Authentic Reviews
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="site-footer-heading">Hosting</h4>
            <ul className="site-footer-list">
              <li>
                <Link to="/CreateProperty" className="site-footer-link">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link to="/host-dashboard" className="site-footer-link">
                  Host Command Center
                </Link>
              </li>
              <li>
                <Link to="/host-panel" className="site-footer-link">
                  Resources & Panels
                </Link>
              </li>
              <li>
                <Link to="/mybooking" className="site-footer-link">
                  Manage Reservations
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="site-footer-heading">Contact</h4>
            <ul className="site-footer-contact-list">
              <li className="site-footer-contact-item">
                <Mail size={16} />
                <span>concierge@stayfinder.luxury</span>
              </li>
              <li className="site-footer-contact-item">
                <Phone size={16} />
                <span>+1 800 LUX-STAY</span>
              </li>
              <li className="site-footer-contact-item site-footer-contact-item-top">
                <MapPin size={16} />
                <span>100 Premium Blvd, New York, US</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom">
          <p className="site-footer-copyright">
            © {currentYear} StayFinder Ultra-Premium. All rights reserved.
          </p>
          <div className="site-footer-legal">
            <Link to="/privacy" className="site-footer-link">
              Privacy Policy
            </Link>
            <Link to="/terms" className="site-footer-link">
              Terms of Service
            </Link>
            <Link to="/cookies" className="site-footer-link">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
