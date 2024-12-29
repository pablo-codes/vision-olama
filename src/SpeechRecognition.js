// SpeechRecognitionComponent.jsx

import React, { useState, useEffect } from 'react';
const commands = [
    "Stop listening",
    "Francis"
]
const grammar = `#JSGF V1.0; grammar commands; public <commmand> =${commands.join("|",)}; `

const SpeechRecognitions =
    window.SpeechRecognition || window.webkitSpeechRecognition;

const SpeechRecognitionList = window.SpeechGrammarList || window.webkitSpeechGrammarList;


const grammarList = new SpeechRecognitionList()
const recognition = new SpeechRecognitions();
grammarList.addFromString(grammar, 1)

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';



const SpeechRecognition = ({ setAsk }) => {
    const [listening, setListening] = useState(false);
    const [finalTranscript, setFinalTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');

    const toggleListen = () => {
        setListening((prevListening) => !prevListening);

        if (!listening) {
            recognition.start();
        } else {
            recognition.stop();
        }
    };

    useEffect(() => {
        const handleRecognitionStart = () => {
            console.log('Listening!');
        };

        const handleRecognitionEnd = () => {
            if (listening) {
                recognition.start();
                console.log('...continue listening...');
            } else {
                setFinalTranscript('');
                setInterimTranscript('');
                console.log('Stopped listening per click');
            }
        };

        const handleRecognitionResult = (event) => {
            console.log('here')
            let interim = '';
            let final = finalTranscript;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) final += transcript + ' ';
                else interim += transcript;
            }
            setInterimTranscript(interim);
            setFinalTranscript(final);
            setAsk(final);
            const transcriptArr = final.split(' ');
            const stopCmd = transcriptArr.slice(-3, -1);
            console.log(stopCmd[0])
            if (stopCmd[0].toLocaleLowerCase('en-us') === 'stop' && stopCmd[1] === 'listening') {
                setListening((prevListening) => !prevListening);
                recognition.stop();
                const finalText = transcriptArr.slice(0, -3).join(' ');
                setFinalTranscript(finalText);

                console.log('Stopped listening per command');
            }
        };

        const handleRecognitionError = (event) => {
            console.log('Error occurred in recognition: ' + event.error);
        };

        recognition.addEventListener("start", handleRecognitionStart);
        recognition.onend = handleRecognitionEnd;
        recognition.addEventListener("result", handleRecognitionResult);
        recognition.onerror = handleRecognitionError;

        return () => {
            recognition.stop();
        };
    }, [listening, finalTranscript]);

    return (
        <div>
            <button onClick={toggleListen}>
                {listening ? 'Stop Listening' : 'Start Listening'}
            </button>
            <div>{interimTranscript}</div>
            <div>{finalTranscript}</div>
        </div>
    );
};

export default SpeechRecognition;
