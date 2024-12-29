// SpeechSynthesis.jsx

import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';


const SpeechSynthesis = ({ text, setText, start, setStart }) => {
    const [voices, setVoices] = useState([]);
    const [pitch, setPitch] = useState(1);
    const [rate, setRate] = useState(1);

    const [selectedVoice, setSelectedVoice] = useState(null);
    const synth = window.speechSynthesis;

    useEffect(() => {
        const populateVoiceList = () => {
            const voices = synth.getVoices();
            setVoices(voices);
        };

        populateVoiceList();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = populateVoiceList;
        }
    }, [synth]);
   

    const handleSubmit = (event) => {

        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.voice = selectedVoice;
        utterThis.pitch = pitch;
        utterThis.rate = rate;
        utterThis.onboundary = (event) => {
            const char = event.charIndex;
            const length = event.charLength;
            const word = event.utterance.text.slice(char, char + length)

            console.log(word)
        }
        synth.speak(utterThis);
    };
    //eslint-ignore-warnings
    useEffect(() => {
        if (start) {
            handleSubmit()
            setStart(false)
        }

    }, [start])
    return (
        <form style={{ marginTop: '2%', marginBottom: '5%' }} onSubmit={handleSubmit}>

            <div>
                <label htmlFor="rate">Rate</label>
                <input
                    type="range"
                    min="0.5"
                    max="2"
                    value={rate}
                    step="0.1"
                    id="rate"
                    onChange={(e) => setRate(e.target.value)}
                />
                <div className="rate-value">{rate}</div>
                <div className="clearfix"></div>
            </div>
            <div>
                <label htmlFor="pitch">Pitch</label>
                <input
                    type="range"
                    min="0"
                    max="2"
                    value={pitch}
                    step="0.1"
                    id="pitch"
                    onChange={(e) => setPitch(e.target.value)}
                />
                <div className="pitch-value">{pitch}</div>
                <div className="clearfix"></div>
            </div>
            <select
                onChange={(e) => {

                    const selectedVoiceName = e.target.value;
                    const selectedVoice = voices.find(
                        (voice) => voice.name === selectedVoiceName
                    );
                    setSelectedVoice(selectedVoice);
                }}
            >
                {voices.map((voice, index) => (
                    <option key={index} value={voice.name}>
                        {voice.name} ({voice.lang})
                    </option>
                ))}
            </select>
            <button id='speak' onClick={(event) => {
                event.preventDefault();
                setStart(true)
            }}>Speak</button>
            <div
                style={{ display: 'block', width: '50%', marginTop: '10%', height: '15rem' }}
                type="text"
                className="txt"
                value={text}
                onChange={(e) => setText(e.target.value)}
            >
               
            </div>

        </form>
    );
};

export default SpeechSynthesis;
