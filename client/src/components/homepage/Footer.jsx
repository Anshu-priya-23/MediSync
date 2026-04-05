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

          <p className="social-item">
            <FaFacebookF className="social-icon" />
            Facebook
          </p>

          <p className="social-item">
            <FaTwitter className="social-icon" />
            Twitter
          </p>

          <p className="social-item">
            <FaLinkedinIn className="social-icon" />
            LinkedIn
          </p>

          <p className="social-item">
            <FaInstagram className="social-icon" />
            Instagram
          </p>

          <p className="social-item">
            <FaYoutube className="social-icon" />
            Youtube
          </p>
        </div>

      </div>

      <div className="footer-bottom">
        © 2025 MediSync. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;