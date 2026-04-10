import React from 'react';
import { ShieldCheck, Users, Activity, Heart } from 'lucide-react';

const About = () => {
    return (
        <div style={styles.container}>
            <div style={styles.heroSection}>
                <h1 style={styles.title}>About <span style={{color: '#24aeb1'}}>MediSync</span></h1>
                <p style={styles.subtitle}>Bridging the gap between Healthcare and Technology.</p>
            </div>

            <div style={styles.contentGrid}>
                <div style={styles.card}>
                    <ShieldCheck size={40} color="#24aeb1" />
                    <h3>Secure Pharmacy</h3>
                    <p>We ensure that all medications provided through our platform are verified by certified pharmacists.</p>
                </div>
                <div style={styles.card}>
                    <Activity size={40} color="#24aeb1" />
                    <h3>Real-time Tracking</h3>
                    <p>MediSync offers a seamless digital experience for tracking your health essentials from order to doorstep.</p>
                </div>
                <div style={styles.card}>
                    <Users size={40} color="#24aeb1" />
                    <h3>Our Mission</h3>
                    <p>To provide accessible healthcare solutions to every organization through a centralized Q&A and inventory system.</p>
                </div>
            </div>

            <div style={styles.footerInfo}>
                <Heart size={20} color="#ff6f61" style={{marginRight: '10px'}} />
                <p>Designed for excellence in healthcare delivery.</p>
            </div>
        </div>
    );
};

const styles = {
    container: { maxWidth: '1000px', margin: '60px auto', padding: '0 20px', fontFamily: 'Arial, sans-serif', textAlign: 'center' },
    heroSection: { marginBottom: '50px' },
    title: { fontSize: '36px', color: '#242c44', marginBottom: '10px' },
    subtitle: { fontSize: '18px', color: '#666' },
    contentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginTop: '40px' },
    card: { padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' },
    footerInfo: { marginTop: '60px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }
};

export default About;