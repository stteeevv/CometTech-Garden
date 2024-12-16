import styles from '../map/map.module.css';
import { useSession } from "next-auth/react";
import { useState } from 'react';  // Import useState to manage the menu toggle state

export default function Navbar() {
    const { data: session } = useSession();
    const [menuOpen, setMenuOpen] = useState(false); 
    const toggleMenu = () => {
        setMenuOpen(!menuOpen);  // Toggle the menu visibility
    };

    return (
        <nav className={styles.navbar}>
            {/* Hamburger Button for Small Screens */}
            <button className={styles.menuToggle} onClick={toggleMenu}>
                &#9776; {/* Hamburger icon */}
            </button>

            {/* Navbar Links */}
            <div className={`${styles.navLinks} ${menuOpen ? styles.active : ''}`}>
                <a href="/home" className={styles.navButton}>
                    <img src="/home.svg" alt="homeLogo" width={20} height={20} className={styles.iconHeader} />
                    Home
                </a>
                <a href="/plots" className={styles.navButton}>
                    <img src="/image 5.svg" alt="plotsLogo" width={20} height={20} className={styles.iconHeader} />
                    Plots
                </a>
                {session && (
                    <a href="/profile" className={styles.navButton}>
                        <img src="/User_fill.svg" alt="profileLogo" width={20} height={20} className={styles.iconHeader} />
                        Profile
                    </a>
                )}
                {!session && (
                    <a href="/signin" className={styles.navButton}>
                        <img src="/User_fill.svg" alt="signinLogo" width={20} height={20} className={styles.iconHeader} />
                        Sign In
                    </a>
                )}
            </div>
        </nav>
    );
}
