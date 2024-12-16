function toggleAnswer(questionElement) {
    const answerElement = questionElement.nextElementSibling;
    const arrow = questionElement.querySelector('.arrow');
    
    if (answerElement.style.display === 'none' || answerElement.style.display === '') {
      answerElement.style.display = 'block';
      arrow.style.transform = 'rotate(180deg)';
    } else {
      answerElement.style.display = 'none';
      arrow.style.transform = 'rotate(0deg)';
    }
  }
  