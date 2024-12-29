import React, { useState, useEffect } from "react";
import Olama from "./Olama";
import CameraCapture from "./CameraCapture";
import SpeechSynthesis from "./SpeechSynthesis";

//------------------------SPEECH RECOGNITION-----------------------------

const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = "en-US";

//------------------------COMPONENT-----------------------------

const Speech = () => {
    const [listening, setListening] = useState(false);
    const [speaking, setSpeaking] = useState(false);

    const [finalTranscript, setFinalTranscript] = useState("");
    const [interimTranscript, setInterimTranscript] = useState("");

    const [ask, setAsk] = useState("")
    const [text, setText] = useState("");
    const [test, setTest] = useState("");
    const [voices, setVoices] = useState([]);
    const [pitch, setPitch] = useState(1);
    const [rate, setRate] = useState(1);
    const [selectedVoice, setSelectedVoice] = useState(null);


    const synth = window.speechSynthesis;

    const toggleListen = () => {
        setListening((prevListening) => !prevListening);

        if (!listening) {
            recognition.start();
        } else {
            recognition.stop();
        }
    };



    const send = () => {
        Olama.chat(ask).then((response) => {
            console.log(response.done);
            setText(response.message.content)
            const speak = document.getElementById('speak')
            speak.click();
        }).catch((err) => {
            console.log(err)
        })
    }
    useEffect(() => {
        const handleRecognitionStart = () => {
            console.log("Listening!");
        };

        const handleRecognitionEnd = () => {
            if (listening) {
                recognition.start();
                console.log("...continue listening...");
            } else {
                setFinalTranscript("")
                setInterimTranscript("")
                console.log("Stopped listening per click");
            }
        };

        const handleRecognitionResult = (event) => {
            let interim = "";
            let final = finalTranscript;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) final += transcript + " ";
                else interim += transcript;
            }
            setInterimTranscript(interim);
            setFinalTranscript(final);
            setAsk(final);
            const transcriptArr = final.split(" ");
            const stopCmd = transcriptArr.slice(-3, -1);

            if (stopCmd[0] === "stop" && stopCmd[1] === "listening") {
                setListening((prevListening) => !prevListening);
                recognition.stop();
                const finalText = transcriptArr.slice(0, -3).join(" ");
                setFinalTranscript(finalText);

                console.log("Stopped listening per command");
            }
        };

        const handleRecognitionError = (event) => {
            console.log("Error occurred in recognition: " + event.error);
        };

        recognition.onstart = handleRecognitionStart;
        recognition.onend = handleRecognitionEnd;
        recognition.onresult = handleRecognitionResult;
        recognition.onerror = handleRecognitionError;


        return () => {
            recognition.stop();
        };
    }, [listening, finalTranscript]);

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

    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.voice = selectedVoice;
    utterThis.pitch = pitch;
    utterThis.rate = rate;


    utterThis.onboundary = (event) => {
        const char = event.utterance.text.charAt(event.charIndex);
        setTest(test + '' + char)
        console.log(char, test)
    }

    useEffect(() => {

        if (synth.speaking) {
            console.log(speaking)
        }
    }, [synth, speaking, test])


    const handleSubmit = (event) => {
        event.preventDefault();

        synth.speak(utterThis);
        setSpeaking((prevSpeaking) => !prevSpeaking);

        utterThis.onpause = (event) => {
            const char = event.utterance.text.charAt(event.charIndex);
            console.log(
                `Speech paused at character ${event.charIndex} of "${event.utterance.text}", which is "${char}".`
            );
        };
    };

    return (
        <div style={styles.container}>
            <CameraCapture />
            <h1>Olama chatbot</h1>
            <button
                id="microphone-btn"
                style={styles.button}
                onClick={toggleListen}
            />
            <div id="interim" style={styles.interim}>
                {interimTranscript}
            </div>
            <div id="final" style={styles.final}>
                {finalTranscript}
            </div>

            <input id="ask" style={styles.final} value={ask} onChange={(e) => { setAsk(e.currentTarget.value) }} />

            <button onClick={() => { send() }} type="submit">Ask</button>

            {test}
            <SpeechSynthesis />
            {/* <form style={{ marginTop: '2%', marginBottom: '5%' }} onSubmit={handleSubmit}>

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
        <button id='speak' type="submit">Speak</button>
        <textarea
          style={{ display: 'block', width: '100%', marginTop: '10%', height: '15rem' }}
          type="text"
          className="txt"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </form> */}
        </div>
    );
};

export default Speech;

//-------------------------CSS------------------------------------

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
    },
    button: {
        width: "60px",
        height: "60px",
        background: "lightblue",
        borderRadius: "50%",
        margin: "1em 0 2em 0",
    },
    interim: {
        color: "gray",
        border: "#ccc 1px solid",
        padding: "1em",
        margin: "1em",
        width: "300px",
    },
    final: {
        color: "black",
        border: "#ccc 1px solid",
        padding: "1em",
        margin: "1em",
        width: "300px",
    },
};

