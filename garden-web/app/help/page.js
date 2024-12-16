'use client';
import { useState, useEffect } from 'react';
import styles from './help.module.css';
import Container from '../components/container';

// Exporting the help page as default
export default function AccordionItem() {
  const [tip, setTip] = useState('Loading...'); // State for the tip of the day

  // Fetch tips from the static file
  useEffect(() => {
    fetch('/Tips.txt') // Path to your static file
      .then(response => response.text())
      .then(data => {
        const tips = data.split('\n').filter(line => line.trim() !== ''); // Split by line and remove empty lines
        const today = new Date().getDate(); // Get today's day (1-31)
        const tipIndex = today % tips.length; // Calculate which tip to show
        setTip(tips[tipIndex]); // Set the tip
      })
      .catch(error => setTip('Error loading tip of the day.'));
  }, []); // Fetch once when the component loads

  return (
    <Container title={"FAQ & Help"}>
      {/* Search Bar
      <div className="flex justify-center mt-8">
        <input
          type="text"
          placeholder="FAQs, Videos, Documentation and Forum Posts"
          className="w-[80vw] p-4 border border-gray-300 rounded-lg text-xl"
        />
      </div> */}

      {/* Help Content FAQ with toggleAnswer on click */}
      <div className={styles.accordion}>
        <AccordionQuestion 
          question="How do I log in as a UTD Student?"
          answer="All students will need to register with a google account to sign in and harvest data."
        />
        <AccordionQuestion 
          question="How many harvests can I log?"
          answer="Harvest log inputs happen as you harvest! Feel free to add log of the different plants you harvested today!"
        />
        <AccordionQuestion 
          question="Who do I contact if I want to join the Community Garden?"
          answer="Contact the Office of Student Volunteerism for more information at volunteer@utdallas.edu"
        />
        <AccordionQuestion 
          question="What do the sensors mean?"
          answer="The sensors are used to monitor the soil moisture and temperature levels of the plants."
        />
        <AccordionQuestion 
          question="What is a good moisture range?"
          answer= "Depends on the plant that you are growing. You can find more information on the plant's moisture range in the gardening guide."
        />
      </div>

      {/* Quick Links */}
      <div className={styles.quicklinks}>
        <div className={styles.quicklinkitem}>
          <h3><b>Gardening Guide</b></h3>
          <p>Here is a helpful <a className= {styles["underlined-link"]} href="https://www.kellogggarden.com/wp-content/uploads/2020/06/Harvesting-Guide.pdf">guide</a> to start gardening.</p>
        </div>
        <div className={styles.quicklinkitem}>
          <h3><b>Tip of the day!!</b></h3>
          <p>{tip}</p> {/* Dynamic Tip */}
        </div>
        <div className={styles.quicklinkitem}>
          <h3><b>Plants</b></h3>
          <p>Here is a list of <a className= {styles["underlined-link"]} href="https://www.kellogggarden.com/Companion-Planting-Guide.pdf" >plants</a> you can have in your plot! </p> 
        </div>
      </div>
    </Container>
  );
}

function AccordionQuestion({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAnswer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.AccordionItem}>
      <div className={styles.question} onClick={toggleAnswer}>
        <span className={styles.arrow} style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
        →	
        </span>
        <span>{question}</span>
      </div>
      <div className={styles.answer} style={{ display: isOpen ? 'block' : 'none' }}>
        {answer}
      </div>
    </div>
  );
}


