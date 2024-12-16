'use client';
import Image from "next/image";
import styles from "./map.module.css";
import Container from "../components/container";
import { IonIcon } from '@ionic/react'; 
import { logoFacebook, logoTwitter, logoInstagram } from 'ionicons/icons'; 

export default function Map() {
  return (
    <div className={styles.container}>
      {/* Meta tag for mobile responsiveness */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      <Container title={"Garden Map"}>
        <main className={styles.main}>
          {/* Responsive Image */}
          <div className={styles.imageBox2}>
          <Image src="/GardenPic.png" width={500} height={300} sizes="(max-width: 768px) 100vw, 50vw" />
          </div>

          {/* Location and Directions Content */}
          <div className={styles.textContent}>
            <h2 className={styles.titles}>Location:</h2>
            <p>
              The <a className={styles["underlined-link"]} href="https://volunteer.utdallas.edu/garden/">
                UT Dallas Community Garden
              </a> is at the southwest corner of the Phase I apartment complex on the UTD campus.
            </p>

            <h2 className={styles.titles}>Directions:</h2>
            <p>
              Turn onto Franklyn Jenifer Drive from Waterview Parkway and take right into
              the Phase 1 apartment complex parking lot. Continue south to the UT Dallas Community Garden. 
              <a className={styles["underlined-link"]} href="https://map.concept3d.com/?id=1772#!m/436225?s/">
                View the garden location on the UTD campus map.
              </a>
            </p>
          </div>
        </main>
      </Container>
    </div>
  );
}
