import React, { useState } from 'react';
import './mainStyle.css';
import * as mammoth from 'mammoth'; // Importing mammoth.js to handle DOCX files

const Main = () => {
    const [questionsAndAnswers, setQuestionsAndAnswers] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Start from the first question
    const [correctQuestions, setCorrectQuestions] = useState([]);
    const [incorrectQuestions, setIncorrectQuestions] = useState([]);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    // Handles the file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (file && file.name.endsWith(".docx")) {
            const reader = new FileReader();

            reader.onload = function(e) {
                const arrayBuffer = e.target.result;

                // Extract raw text from the DOCX file
                mammoth.extractRawText({ arrayBuffer: arrayBuffer })
                    .then((result) => {
                        const rawData = result.value;
                        parseData(rawData);
                    })
                    .catch((err) => console.error('Error reading DOCX file', err));
            };

            reader.readAsArrayBuffer(file);
        } else {
            alert('Please upload a .docx file');
        }
    };

    // Parses the raw data into question-answer pairs
    const parseData = (rawData) => {
        const rawEntries = rawData.split('\n').filter(entry => entry.trim().length > 0);

        const parsedData = rawEntries.map(entry => {
            const match = entry.match(/^(.+?)\s?\?(\s*.+)$/);
            if (match) {
                const question = match[1].trim();
                const answer = match[2].trim();
                return { question, answer };
            } else {
                console.error('Invalid entry:', entry);
                return null; // Ignore invalid entries
            }
        }).filter(item => item !== null);

        setQuestionsAndAnswers(parsedData);
        setCurrentQuestionIndex(0); // Start at the first question
    };

    // Handle the Show button - reveal the answer
    const handleShowAnswer = () => {
        setShowAnswer(true);
    };

    // Handle the Correct button - move question to correct state
    const handleCorrect = () => {
        const question = questionsAndAnswers[currentQuestionIndex];
        setCorrectQuestions((prev) => [...prev, question]);

        // Remove from main array and move to the next question
        moveToNextQuestion();
    };

    // Handle the Wrong button - move question to wrong state
    const handleWrong = () => {
        const question = questionsAndAnswers[currentQuestionIndex];
        setIncorrectQuestions((prev) => [...prev, question]);

        // Remove from main array and move to the next question
        moveToNextQuestion();
    };

    // Move to the next question (sequentially)
    const moveToNextQuestion = () => {
        if (currentQuestionIndex + 1 < questionsAndAnswers.length) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setShowAnswer(false);
        } else {
            setIsGameOver(true); // If we've gone through all the questions, end the game
        }
    };

    // Calculate scores and percentage
    const calculateScore = () => {
        const total = correctQuestions.length + incorrectQuestions.length;
        const correct = correctQuestions.length;
        const wrong = incorrectQuestions.length;
        const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
        return { correct, wrong, percentage };
    };

    // Handle retrying incorrect questions
    const handleRetryWrongQuestions = () => {
        // Add only the incorrect questions back to the game
        setQuestionsAndAnswers(incorrectQuestions);
        setCorrectQuestions([]);  // Clear previous correct answers
        setIncorrectQuestions([]);  // Clear previous incorrect answers
        setIsGameOver(false);  // Reset the game-over state
        setCurrentQuestionIndex(0);  // Start from the first incorrect question
    };

    // After the game is over, check if the player got all answers correct
    if (isGameOver && incorrectQuestions.length === 0) {
        setTimeout(() => {
            alert("You learnt everything!");
            window.location.reload(); // Reload the page to restart the game
        }, 500); // Delay the alert to allow the game-over screen to display first
    }

    return (
        <div className="main-container">
            <h1>Questions and Answers Game</h1>

            <input
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                className="file-input"
            />

            {!isGameOver ? (
                <div className="question-container">
                    {questionsAndAnswers.length > 0 && (
                        <>
                            <div className="question">
                                {currentQuestionIndex+1}. &nbsp;
                                {questionsAndAnswers[currentQuestionIndex].question}
                            </div>
                            {showAnswer && (
                                <div className="answer">
                                    {questionsAndAnswers[currentQuestionIndex].answer}
                                </div>
                            )}

                            <div className="buttons-container">
                                <button className="show-btn" onClick={handleShowAnswer}>Show Answer</button>
                                <button className="correct-btn" onClick={handleCorrect}>Correct</button>
                                <button className="wrong-btn" onClick={handleWrong}>Wrong</button>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="score-container">
                    <h2>Game Over</h2>
                    <p>Correct Answers: {calculateScore().correct}</p>
                    <p>Incorrect Answers: {calculateScore().wrong}</p>
                    <p>Score: {calculateScore().percentage}%</p>

                    <p>Would you like to work on the wrong questions?</p>
                    <div className="retry-buttons">
                        <button className="retry-yes" onClick={handleRetryWrongQuestions}>Yes</button>
                        <button className="retry-no" onClick={() => alert('Goodbye!')}>No</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Main;
