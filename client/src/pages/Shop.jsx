import { useParams } from "react-router-dom";

import HeroSection from "../components/homepage/HeroSection";
import HealthConcerns from "../components/homepage/HealthConcerns";
import PopularProducts from "../components/homepage/PopularProducts";
import PopularBrands from "../components/homepage/PopularBrands";
import Footer from "../components/homepage/Footer";   // ✅ Added

const Shop = () => {
  const { name } = useParams();

  return (
    <>
      {!name ? (
        <>
          <HeroSection />
          <HealthConcerns />
          <PopularProducts />
          <PopularBrands />
          <Footer />   {/* ✅ Added */}
        </>
      ) : (
        <>
          <div style={{ padding: "40px" }}>
            <h2>{name} Products</h2>
          </div>
          <Footer />   {/* ✅ Added */}
        </>
      )}
    </>
  );
};

export default Shop;