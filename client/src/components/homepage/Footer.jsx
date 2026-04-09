import "./Footer.css";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        <div className="footer-column">
          <h4>COMPANY</h4>
          <p>About MediSync</p>
          <p>Careers</p>
          <p>Blog</p>
          <p>Contact Us</p>
        </div>

        <div className="footer-column">
          <h4>OUR POLICIES</h4>
          <p>Terms & Conditions</p>
          <p>Privacy Policy</p>
          <p>Return Policy</p>
          <p>Shipping Policy</p>
          <p>Refund Policy</p>
        </div>

        <div className="footer-column">
          <h4>SHOPPING</h4>
          <p>Medicines A to Z</p>
          <p>Shop by Categories</p>
          <p>Health Concerns</p>
          <p>Offers & Discounts</p>
          <p>FAQs</p>
        </div>

        <div className="footer-column">
          <h4>SOCIAL</h4>

          <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="social-item">
            <FaFacebookF className="social-icon" />
            Facebook
          </a>

          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="social-item">
            <FaTwitter className="social-icon" />
            Twitter
          </a>

          <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="social-item">
            <FaLinkedinIn className="social-icon" />
            LinkedIn
          </a>

          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" className="social-item">
            <FaInstagram className="social-icon" />
            Instagram
          </a>

          <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" className="social-item">
            <FaYoutube className="social-icon" />
            Youtube
          </a>

        </div>

      </div>

      <div className="footer-bottom">
        © 2025 MediSync. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
